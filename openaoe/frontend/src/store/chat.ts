import { create } from 'zustand';
import { fetchEventSource } from '@fortaine/fetch-event-source';
import { persist } from 'zustand/middleware';
import { scrollToBottom } from '@utils/utils.ts';
import { getHeaders, getPayload, getUrl } from '@services/fetch.ts';
import { fetchBotAnswer } from '@services/home.ts';
import { DEFAULT_BOT, SERIAL_SESSION, STREAM_BOT} from '@constants/models.ts';
import { ALL_MODELS } from '@config/model-config.ts';

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
    name: string; // model name, 用来标识session，唯一
    bot: string; // bot name
    messages: ChatMessage[];
    isShow?: boolean;
    clearContextIndex?: number; // clear context after this index
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
    controller: AbortController | null;
    newSession: (sessionName: string) => void;
    removeSession: (sessionName: string) => void;
    getSession: (sessionName: string) => ChatSession;
    updateSession: (sessionIndex: number, override: Partial<ChatSession>) => void;
    onNewMessage: (message: ChatMessage, sessionIndex?: number) => void;
    deleteMessage: (sessionName: string, messageIndex: number) => void;
    onUserInput: (content: string, provider: string, model: string, sessionId: string) => Promise<void>;
    updateMessage: (
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: ChatMessage) => void,
    ) => void;
    lastMessage: (sessionName: string) => ChatMessage;
    lastBotMessage: (sessionName: string) => ChatMessage;
    lastUserMessage: (sessionName: string) => ChatMessage;
    closeController: (sessionName: string) => void;
    retry: (sessionName: string, model?: string) => void;

    clearAllData: () => void;
}

export const useChatStore = create<ChatStore>()(
    //  将chat数据使用persist中间件持久化到localStorage
    persist(
        (set, get) => ({
            hasStreaming: false,
            sessions: [createSession({ name: SERIAL_SESSION }), createSession({ name: DEFAULT_BOT })],
            currentSessionIndex: 0,
            globalId: 0,
            controller: null,
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
                console.log('[BOT] onNewMessage: ', message, sessionIndex);
                set(() => ({ sessions: get().sessions }));
            },
            deleteMessage(sessionName, messageIndex) {
                const session = get().sessions.find((session) => session.name === sessionName);
                if (session) {
                    session.messages.splice(messageIndex, 1);
                    set(() => ({ sessions: get().sessions }));
                }
            },
            retry(bot: '', model: '') {
                const modelName = model || get().lastBotMessage(bot).model || '';
                const provider = ALL_MODELS.find((bot) => bot.model === modelName).provider;
                const text = get().lastUserMessage(bot).text;
                if ((get().lastMessage(bot).id === get().lastBotMessage(bot).id) && get().getSession(bot).clearContextIndex !== get().getSession(bot).messages.length) {
                    // 如果最后一条消息是bot的回复且当前没有清空上下文
                    // 那么替换最后两条消息，否则重新发送最后一次对话
                    get().deleteMessage(bot, get().getSession(bot).messages.length - 1);
                    get().deleteMessage(bot, get().getSession(bot).messages.length - 1);
                }
                get().onUserInput(text, provider, modelName, bot);
            },
            async onUserInput(text, provider, model, sessionName) {
                const sessionIndex = get().sessions.findIndex((session) => session.name === sessionName);
                const currSession = get().sessions[sessionIndex];
                if (!currSession) {
                    return;
                }
                // 获取当前会话的历史上下文消息，注意用户有可能清除过上下文
                // 标识为Error的消息不会被发送到后端
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
                    provider: provider,
                    model: model,
                    text: '...',
                    sender_type: 'bot',
                    id: userMessage.id + 1,
                    stream: true,
                });
                get().onNewMessage(userMessage, sessionIndex);
                get().onNewMessage(botMessage, sessionIndex);
                scrollToBottom(`chat-wrapper-${currSession.id}`);

                const abortController = new AbortController();
                set(() => ({ controller: abortController }));
                const chatPayload = {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({
                        ...getPayload(provider, model, text, messages),
                    }),
                };

                const url = getUrl(provider);
                let isStream = true;
                if (!STREAM_BOT.includes(provider)) {
                    try {
                        const rsp = await fetchBotAnswer(url, getPayload(provider, model, text, messages), abortController.signal);
                        if (rsp.msgCode === '10000' && rsp.data) {
                            if (provider === 'google') {
                                // google 返回结构体不一致，需要特殊处理
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
                            // 机器人回复后，滚动到底部
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
                        set(() => ({ controller: null }));
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
                                if (data && data.success === 'true') {
                                    if (data.stop_reason === 'max_token') { // 如果是max_token，说明是异常中断
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
                            console.log('[BOT] request error: ', e);
                            botMessage.stream = false;
                            get().updateMessage(sessionIndex, messageIndex, (message) => {
                                message.stream = botMessage.stream;
                                message.text = e.message.includes('Please reduce the length of the messages.')
                                    ? e.message
                                    : `${botMessage.text}\n > Oops... Something went wrong (°⌓°)`;
                                message.isError = true;
                            });
                            set(() => ({ controller: null }));
                            throw e;
                        },
                        onclose() {
                            botMessage.stream = false;
                            get().updateMessage(sessionIndex, messageIndex, (message) => {
                                message.stream = botMessage.stream;
                            });
                            set(() => ({ controller: null }));
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
                if (controller) {
                    if (controller.abort) {
                        controller.abort();
                    }
                    set(() => ({ controller: null }));
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
