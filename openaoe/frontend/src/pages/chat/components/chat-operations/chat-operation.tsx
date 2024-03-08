import { Tooltip } from 'sea-lion-ui';
import { getNeedEventCallback, scrollToBottom } from '@utils/utils.ts';
import { BASE_IMG_URL, CLEAR_CONTEXT, SERIAL_SESSION } from '@constants/models.ts';
import React, { useContext, useEffect } from 'react';
import { GlobalConfigContext } from '@components/global-config/global-config-context.tsx';
import styles from './chat-operation.module.less';
import { useConfigStore } from '@/store/config.ts';
import { createMessage, useChatStore } from '@/store/chat.ts';
import { useBotStore } from '@/store/bot.ts';

interface ChatOperationProps {
    modelName: string;
}

const EraserIcon = () => {
    const configStore = useConfigStore();
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_50_304)">
                <mask id="mask0_50_304" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
                    <path d="M20 0H0V20H20V0Z" fill="white" />
                </mask>
                <g mask="url(#mask0_50_304)">
                    <path
                        d="M18.659 10.0709L13.2991 2.95807L5.8894 8.54167L11.4582 15.4167L12.8564 14.4435L18.659 10.0709Z"
                        stroke={configStore.theme === 'light' ? 'black' : 'white'}
                        strokeWidth="1.66667"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M11.4582 15.4167L9.85879 16.6978L5.45733 16.6975L4.37379 15.2596L1.69385 11.7032L6.0415 8.427"
                        stroke={configStore.theme === 'light' ? 'black' : 'white'}
                        strokeWidth="1.66667"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M5.50244 16.6967H18.569"
                        stroke={configStore.theme === 'light' ? 'black' : 'white'}
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                    />
                </g>
            </g>
            <defs>
                <clipPath id="clip0_50_304">
                    <rect width="20" height="20" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};
const ClearIcon = () => {
    const configStore = useConfigStore();
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.33301 2.46417H11.6663V5.79752H17.9163V9.13086H2.08301V5.79752H8.33301V2.46417Z"
                stroke={configStore.theme === 'light' ? 'black' : 'white'}
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3.33301 16.6667H16.6663V9.16669H3.33301V16.6667Z"
                stroke={configStore.theme === 'light' ? 'black' : 'white'}
                strokeWidth="1.66667"
                strokeLinejoin="round"
            />
            <path
                d="M6.66699 16.624V14.1309"
                stroke={configStore.theme === 'light' ? 'black' : 'white'}
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10 16.624V14.124"
                stroke={configStore.theme === 'light' ? 'black' : 'white'}
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13.333 16.624V14.1309"
                stroke={configStore.theme === 'light' ? 'black' : 'white'}
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5 16.6667H15"
                stroke={configStore.theme === 'light' ? 'black' : 'white'}
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
const RetryIcon = () => {
    const configStore = useConfigStore();
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M15.3033 15.3033C13.9461 16.6605 12.0711 17.5 10 17.5C5.85787 17.5 2.5 14.1421 2.5 10C2.5 5.85787 5.85787 2.5 10 2.5C12.0711 2.5 13.9461 3.33947 15.3033 4.69671C15.9941 5.38754 17.5 7.08333 17.5 7.08333"
                stroke={configStore.theme === 'light' ? 'black' : 'white'}
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M17.5 3.33331V7.08331H13.75"
                stroke={configStore.theme === 'light' ? 'black' : 'white'}
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
const ChatOperation = (props: ChatOperationProps) => {
    const { models, streamModels } = useContext(GlobalConfigContext);
    const { modelName } = props;
    const chatStore = useChatStore();
    const { sessions } = chatStore;
    const currSession = sessions.find((session) => session.name === modelName);
    const botStore = useBotStore();

    /**
     * clear context for current session, then scroll to bottom automatically
     */
    const handleClearContext = () => {
        const sessionIdx = chatStore.sessions.findIndex((session) => session.name === modelName);
        const newSession = chatStore.sessions[sessionIdx];
        if (chatStore.lastMessage(newSession.name).sender_type === CLEAR_CONTEXT) return;

        newSession.clearContextIndex = newSession.messages.length || 0;
        chatStore.updateSession(sessionIdx, newSession);
        chatStore.onNewMessage(createMessage({
            model: 'admin',
            text: '',
            sender_type: CLEAR_CONTEXT,
            id: Date.now(),
            stream: false,
            isError: true,
        }), sessionIdx);
        scrollToBottom(`chat-wrapper-${newSession.id}`);
    };

    /**
     * clear history for current session
     */
    const handleClearHistory = () => {
        const sessionIdx = sessions.findIndex((session) => session.name === modelName);

        chatStore.updateSession(sessionIdx, { messages: [], clearContextIndex: 0 });
    };

    const handleStopStream = () => {
        chatStore.closeController(modelName);
    };

    const handleRetry = () => {
        const model = currSession.name === SERIAL_SESSION ? botStore.currentBot : chatStore.lastBotMessage(currSession.name).model;
        const provider = models[model]?.provider || '';
        const isStream = streamModels.includes(model);
        const webui = models[model]?.webui || { payload: { options: {} } }
        chatStore.retry(currSession.name, provider, model, isStream, webui);
    };

    useEffect(() => {
        return () => {
            // when component unmount, stop non-stop stream request
            handleStopStream();
        };
    }, []);
    return (
        <div className={styles.homeOperation}>
            {/** if the last message is generating，which means: stream=true */}
            {chatStore.lastMessage(modelName).stream && (
                <Tooltip title="Stop generating" className={styles.opBtn}>
                    <div {...getNeedEventCallback(handleStopStream)}>
                        <img
                            key="stop_generate"
                            src={`${BASE_IMG_URL}stop.png`}
                            className={styles.opImg}
                            alt="stop"
                        />
                    </div>
                </Tooltip>
            )}
            {/** if message list is not empty && stream=false */}
            {!!currSession.messages?.length && !chatStore.lastMessage(modelName).stream && (
                <>
                    <Tooltip title="Clear context" className={styles.opBtn}>
                        <div {...getNeedEventCallback(handleClearContext)}>
                            <EraserIcon />
                        </div>
                    </Tooltip>
                    <Tooltip title="Clear message history" className={styles.opBtn}>
                        <div {...getNeedEventCallback(handleClearHistory)}>
                            <ClearIcon />
                        </div>
                    </Tooltip>
                    <Tooltip title="Regenerate" className={styles.opBtn}>
                        <div
                            {...getNeedEventCallback(handleRetry)}
                        >
                            <RetryIcon />
                        </div>
                    </Tooltip>
                </>
            )}
        </div>
    );
};

export default ChatOperation;
