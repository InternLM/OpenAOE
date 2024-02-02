import { create } from 'zustand';
import { fetchEventSource } from '@fortaine/fetch-event-source';
import { persist } from 'zustand/middleware';
import { scrollToBottom } from '@utils/utils.ts';
import { getHeaders, getPayload, getUrl } from '@services/fetch.ts';
import { fetchBotAnswer } from '@services/home.ts';
import { DEFAULT_BOT, SERIAL_SESSION, STREAM_BOT } from '@constants/models.ts';

export interface ChatMessage {
    text: string;
    sender_type: string;
    date: string;
    id: number;
    provider: string;
    model?: string;
    stream?: boolean;
    isError?: boolean;
}
export function createMessage(override: Partial<ChatMessage>): ChatMessage {
    return {
        id: Date.now(),
        provider: 'openai',
        date: new Date().toLocaleString(),
        sender_type: 'user',
        text: '',
        ...override,
    };
}

export interface ChatSession {
    id: number;
    name: string;
    bot: string;
    messages: ChatMessage[];
    isShow?: boolean;
    clearContextIndex?: number;
}
export function createSession(override: Partial<ChatSession>): ChatSession {
    return {
        id: Date.now() + Math.random(),
        name: DEFAULT_BOT,
        bot: '',
        messages: [],
        isShow: true,
        clearContextIndex: 0,
        ...override,
    };
}
interface ChatStore {
    hasStreaming: boolean;
    sessions: ChatSession[];
    currentSessionIndex: number;
    globalId: number;
    controller: Record<string, AbortController> | null;
    newSession: (sessionName: string) => void;
    removeSession: (sessionName: string) => void;
    getSession: (sessionName: string) => ChatSession;
    updateSession: (sessionIndex: number, override: Partial<ChatSession>) => void;
    onNewMessage: (message: ChatMessage, sessionIndex?: number) => void;
    deleteMessage: (sessionName: string, messageIndex: number) => void;
    onUserInput: (content: string, provider: string, model: string, sessionId: string, isStreamApi: boolean) => Promise<void>;
    updateMessage: (
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: ChatMessage) => void,
    ) => void;
    lastMessage: (sessionName: string) => ChatMessage;
    lastBotMessage: (sessionName: string) => ChatMessage;
    lastUserMessage: (sessionName: string) => ChatMessage;
    closeController: (sessionName: string) => void;
    retry: (sessionName: string, provider: string, model: string, isStreamApi: boolean) => void;

    clearAllData: () => void;
}

export const useChatStore = create<ChatStore>()(
    // save chat data to localStorage by persist middleware
    persist(
        (set, get) => ({
            hasStreaming: false,
            sessions: [createSession({ name: SERIAL_SESSION }), createSession({ name: DEFAULT_BOT })],
            currentSessionIndex: 0,
            globalId: 0,
            controller: {},
            newSession(sessionName) {
                const sessions = get().sessions;
                const targetIdx = sessions.findIndex((session) => session.name === sessionName);
                if (targetIdx > 0) {
                    get().updateSession(targetIdx, { isShow: true });
                    return;
                }
                const session = createSession({
                    name: sessionName,
                    isShow: true,
                });
                set(() => ({ globalId: get().globalId + 1 }));
                session.id = get().globalId;
                sessions.push(session);
                set(() => ({ sessions }));
            },
            removeSession(sessionName) {
                const sessions = get().sessions;
                const targetIdx = sessions.findIndex((session) => session.name === sessionName);
                if (targetIdx) {
                    get().updateSession(targetIdx, { isShow: false });
                }
            },
            getSession(sessionName) {
                const sessions = get().sessions;
                const targetIdx = sessions.findIndex((session) => session.name === sessionName);
                if (targetIdx < 0) {
                    return createSession({ name: sessionName });
                }
                return sessions[targetIdx];
            },
            onNewMessage(message, sessionIndex = 0) {
                const session = get().sessions[sessionIndex];
                session.messages.push(message);
                set(() => ({ sessions: get().sessions }));
            },
            deleteMessage(sessionName, messageIndex) {
                const session = get().sessions.find((session) => session.name === sessionName);
                if (session) {
                    session.messages.splice(messageIndex, 1);
                    set(() => ({ sessions: get().sessions }));
                }
            },
            retry(bot: '', provider: '', model: '', isStreamApi = true) {
                const text = get().lastUserMessage(bot).text;
                if ((get().lastMessage(bot).id === get().lastBotMessage(bot).id) && get().getSession(bot).clearContextIndex !== get().getSession(bot).messages.length) {
                    // If the last message is a reply from the bot and the context is not cleared yet, replace the last two messages,
                    // Otherwise resend the last conversation
                    get().deleteMessage(bot, get().getSession(bot).messages.length - 1);
                    get().deleteMessage(bot, get().getSession(bot).messages.length - 1);
                }
                get().onUserInput(text, provider, model, bot, isStreamApi);
            },
            async onUserInput(text, provider, model, sessionName, isStreamApi = true) {
                const sessionIndex = get().sessions.findIndex((session) => session.name === sessionName);
                const currSession = get().sessions[sessionIndex];
                if (!currSession) {
                    return;
                }
                // Get the historical context messages of the current session.
                // Note that the user may have cleared the context, so you need to filter out the messages that have been cleared.
                // Messages tagged with isError are also filtered out.
                const clearContextIndex = currSession.clearContextIndex || 0;
                const messages = currSession.messages.slice(clearContextIndex)
                    .filter((message) => message.isError !== true)
                    .map((message) => {
                        return {
                            text: message.text,
                            sender_type: message.sender_type,
                        };
                    });
                const messageIndex = currSession.messages.length + 1;
                const userMessage = createMessage({
                    text,
                    provider: 'user',
                    sender_type: 'user'
                });
                const botMessage = createMessage({
                    provider,
                    model,
                    text: '...',
                    sender_type: 'bot',
                    id: userMessage.id + 1,
                    stream: true,
                });
                get().onNewMessage(userMessage, sessionIndex);
                get().onNewMessage(botMessage, sessionIndex);
                scrollToBottom(`chat-wrapper-${currSession.id}`);

                const abortController = new AbortController();
                const controller = get().controller;
                controller[sessionName] = abortController;
                set(() => ({ controller: { ...controller } }));
                const chatPayload = {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({
                        ...getPayload(provider, model, text, messages),
                    }),
                };

                const url = getUrl(provider);
                let isStream = true;
                if (!isStreamApi) {
                    try {
                        const rsp = await fetchBotAnswer(url, getPayload(provider, model, text, messages), abortController.signal);
                        if (rsp.msgCode === '10000' && rsp.data) {
                            if (provider === 'google') {
                                // Google: The data format returned by the chat-stream interface is different and requires special processing
                                if (!rsp.data.candidates && rsp.data.filters) {
                                    botMessage.stream = false;
                                    get().updateMessage(sessionIndex, messageIndex, (message) => {
                                        message.stream = botMessage.stream;
                                        message.text = `${botMessage.text}\n > Oops... Something went wrong (°⌓°)`;
                                        message.isError = true;
                                    });
                                    return;
                                }
                                botMessage.text = rsp.data.candidates[0]?.content;
                            } else if (provider === 'claude') {
                                botMessage.text = rsp.data.completion;
                            } else {
                                botMessage.text = rsp.data;
                            }
                            botMessage.stream = false;
                            get().updateMessage(sessionIndex, messageIndex, (message) => {
                                message.text = botMessage.text;
                                message.stream = botMessage.stream;
                            });
                            // scroll to bottom after bot answer
                            scrollToBottom(`chat-wrapper-${currSession.id}`);
                        } else {
                            botMessage.stream = false;
                            get().updateMessage(sessionIndex, messageIndex, (message) => {
                                message.stream = botMessage.stream;
                                message.text = `${botMessage.text}\n > Oops... Something went wrong (°⌓°)`;
                                message.isError = true;
                            });
                        }
                    } catch (e) {
                        get().updateMessage(sessionIndex, messageIndex, (message) => {
                            message.stream = false;
                            message.text = `${botMessage.text}\n > Oops... Something went wrong (°⌓°)`;
                            message.isError = true;
                        });
                    } finally {
                        const oldController = get().controller;
                        delete oldController[sessionName];
                        set(() => ({ controller: { ...oldController } }));
                    }
                } else {
                    fetchEventSource(url, {
                        ...chatPayload,
                        signal: abortController.signal,
                        async onopen(res) {
                            const contentType = res.headers.get('content-type');

                            if (!contentType?.includes('text/event-stream')) {
                                isStream = false;
                            }

                            if (!res.ok) {
                                throw new Error(res.status + res.statusText);
                            }
                        },
                        onmessage: (event) => {
                            if (isStream && typeof event.data === 'string' && event.data.charAt(0) === '{') {
                                const data = JSON.parse(event.data);
                                if (data && data.success.toString() === 'true') {
                                    if (data.stop_reason === 'max_token') { // max_token means abnormal interruption
                                        botMessage.stream = false;
                                        get().updateMessage(sessionIndex, messageIndex, (message) => {
                                            message.stream = false;
                                            message.text = botMessage.text.concat(`\n > ${data.stop_reason}`);
                                        });
                                        return;
                                    }
                                    botMessage.stream = true;
                                    botMessage.text = botMessage.text.startsWith('...')
                                        ? botMessage.text.slice(3).concat(data.msg)
                                        : botMessage.text.concat(data.msg);
                                    scrollToBottom(`chat-wrapper-${currSession.id}`);
                                    get().updateMessage(sessionIndex, messageIndex, (message) => {
                                        message.text = botMessage.text;
                                        message.stream = botMessage.stream;
                                    });
                                }
                                if (data && data.success === 'false') {
                                    throw new Error(data.msg);
                                }
                            }
                        },
                        onerror(e) {
                            console.log(`[BOT] request error from ${model}: \n`, e);
                            botMessage.stream = false;
                            get().updateMessage(sessionIndex, messageIndex, (message) => {
                                message.stream = botMessage.stream;
                                message.text = e.message.includes('Please reduce the length of the messages.')
                                    ? e.message
                                    : `${botMessage.text}\n > Oops... Something went wrong (°⌓°)`;
                                message.isError = true;
                            });
                            const oldController = get().controller;
                            delete oldController[sessionName];
                            set(() => ({ controller: { ...oldController } }));
                            throw e;
                        },
                        onclose() {
                            botMessage.stream = false;
                            get().updateMessage(sessionIndex, messageIndex, (message) => {
                                message.stream = botMessage.stream;
                            });
                            const oldController = get().controller;
                            delete oldController[sessionName];
                            set(() => ({ controller: { ...oldController } }));
                            console.log('[BOT] answering closed. ');
                        }
                    });
                }
            },
            updateMessage(sessionIndex, messageIndex, updater) {
                const session = get().sessions[sessionIndex];
                const message = session.messages[messageIndex];
                message.date = new Date().toLocaleString();
                updater(message);
                set(() => ({ sessions: get().sessions }));
            },
            lastMessage(sessionName) {
                const session = get().sessions.find((session) => session.name === sessionName);
                if (!session) return createMessage({ text: '' });
                const messages = session?.messages;
                if (Array.isArray(messages) && messages.length > 0) {
                    return messages.slice(-1)[0];
                }
                return createMessage({ text: '' });
            },
            lastUserMessage(sessionName) {
                const session = get().sessions.find((session) => session.name === sessionName);
                if (!session) return createMessage({ text: '' });
                const messages = [...session.messages];
                if (Array.isArray(messages) && messages.length > 0) {
                    return messages.reverse().find((message) => message.sender_type === 'user');
                }
                return createMessage({ text: '' });
            },
            lastBotMessage(sessionName) {
                const session = get().sessions.find((session) => session.name === sessionName);
                if (!session) return createMessage({ text: '' });
                const messages = [...session.messages];
                if (Array.isArray(messages) && messages.length > 0) {
                    return messages.reverse().find((message) => message.sender_type === 'bot' && message.model !== 'admin');
                }
                return createMessage({ text: '' });
            },
            updateSession(sessionIndex, override) {
                const sessions = get().sessions;
                let session = sessions[sessionIndex];
                session = { ...session, ...override };
                sessions[sessionIndex] = session;
                set(() => ({ sessions }));
            },
            closeController(sessionName: string) {
                const controller = get().controller;
                const sessionController = controller?.[sessionName];
                if (sessionController) {
                    if (sessionController.abort) {
                        sessionController.abort();
                    }
                    delete controller[sessionName];
                    set(() => ({ controller: { ...controller } }));
                    const sessionIndex = get().sessions.findIndex((session) => session.name === sessionName);
                    const currSession = get().sessions[sessionIndex];
                    get().updateMessage(sessionIndex, currSession.messages.length - 1, (message) => {
                        message.stream = false;
                        message.text = message.text.concat('\n > Request canceled。');
                    });
                    scrollToBottom(`chat-wrapper-${currSession.id}`);
                }
            },
            clearAllData() {
                localStorage.removeItem('chat');
                set(() => ({ sessions: [createSession({ name: DEFAULT_BOT })] }));
                window.location.reload();
            },
        }),
        {
            name: 'chat',
            version: 2,
            migrate(persistedState, version) {
                const state = persistedState as any;
                const newState = JSON.parse(JSON.stringify(state)) as ChatStore;

                if (version < 2) {
                    newState.globalId = 0;
                    newState.sessions = [];

                    const oldSessions = state.sessions;
                    for (const oldSession of oldSessions) {
                        const newSession = createSession({ name: SERIAL_SESSION });
                        newSession.id = oldSession.id;
                        newSession.name = oldSession.name;
                        newSession.clearContextIndex = oldSession.clearContextIndex;
                        newSession.messages = [...oldSession.messages];
                        newState.sessions.push(newSession);
                    }
                }

                return newState;
            },
        }
    )
);
