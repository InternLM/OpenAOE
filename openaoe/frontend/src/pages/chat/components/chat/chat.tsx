import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import RemarkMath from 'remark-math';
import RemarkBreaks from 'remark-breaks';
import RehypeKatex from 'rehype-katex';
import RemarkGfm from 'remark-gfm';
import {
    isMobile, message
} from 'sea-lion-ui';
import CodeBlock from '@components/code-block/code-block.tsx';
import { autoScroll, getNeedEventCallback } from '@utils/utils.ts';
import {
    CLEAR_CONTEXT, PARALLEL_MODE, SERIAL_MODE, SERIAL_SESSION
} from '@constants/models.ts';
import { ALL_MODELS } from '@config/model-config.ts';
import ChatOperation from '@pages/chat/components/chat-operations/chat-operation.tsx';
import { useChatStore, ChatMessage as ChatMessageProps, ChatSession as ChatSessionProps } from '@/store/chat.ts';
import styles from './chat.module.less';
import { useConfigStore } from '@/store/config.ts';
import { useShareStore } from '@/store/share.ts';

export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        message.success('copied!');
    } catch (error) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            message.success('copied!');
        } catch (error) {
            message.error('copy failed');
        }
        document.body.removeChild(textArea);
    }
}
export function CopyCode(props: { children: any }) {
    const ref = useRef<HTMLPreElement>(null);
    const [showCopy, setShowCopy] = React.useState(false);

    const handleClickCopy = () => {
        if (ref.current) {
            const code = ref.current.innerText;
            copyToClipboard(code);
        }
    };

    return (
        <pre ref={ref}>
            <div
                onMouseOver={() => setShowCopy(true)}
                onFocus={() => setShowCopy(true)}
                onMouseLeave={() => setShowCopy(false)}
            >
                {/* show copy btn when hover code block */}
                {showCopy && (
                    <span
                        className={styles.copyCodeBtn}
                        {...getNeedEventCallback(handleClickCopy)}
                    />
                )}
                {props.children}
            </div>
        </pre>
    );
}

const RunningMario = () => {
    return <div id={styles.mario} />;
};
function ChatMessage(props: { message: ChatMessageProps, sessionInfo: {id: number, name: string, bot: string} }) {
    const [showDate, setShowDate] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const { message, sessionInfo } = props;
    const isUser = message.sender_type === 'user' || message.provider === 'user';
    const isSystem = message.provider === 'admin' && message.sender_type !== CLEAR_CONTEXT;
    const className = classNames(
        styles.messageWrapper,
        isUser ? styles.chatUser : styles.chatBot,
    );
    const configStore = useConfigStore();
    const shareStore = useShareStore();

    const model = ALL_MODELS.find((m) => m.model === (message.model || 'user'));

    const handleChecked = () => {
        setIsChecked(!isChecked);
        shareStore.updateChosenChats(sessionInfo.id, message, !isChecked, sessionInfo);
    };

    useEffect(() => {
        if (!shareStore.isSharing) {
            setIsChecked(false);
        }
    }, [shareStore.isSharing]);

    if (!model) {
        return null;
    }

    return (
        <div
            className={styles.message}
            style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}
            onMouseEnter={() => setShowDate(true)}
            onMouseLeave={() => setShowDate(false)}
        >
            {/* 分享模式下显示多选框 */}
            {(shareStore.isSharing && !shareStore.isPreview) && (
                <input
                    type="radio"
                    className={styles.chatCheckbox}
                    style={{ marginRight: isUser ? 'auto' : 'unset' }}
                    defaultChecked={false}
                    checked={isChecked}
                    disabled={isSystem}
                    onClick={handleChecked}
                />
            )}
            {(message.sender_type === CLEAR_CONTEXT) ? (
                <div className={styles.clearLine}>
                    Context cleared
                </div>
            ) : (
                <>
                    {/* 移动端不显示头像 */}
                    {!isMobile && !isUser && (
                        <div style={{ background: model.background }} className={styles.modelAvatar}>
                            <img
                                src={model.avatar}
                                className={styles.modelAvatarImg}
                                alt={model.model}
                            />
                        </div>
                    )}
                    {/* 消息主体 */}
                    <div
                        title={message.model || configStore.username}
                        className={className}
                        style={{ borderRadius: !isUser ? '1px 10px 10px 10px' : '10px 1px 10px 10px' }}
                    >
                        {message.stream && <RunningMario />}
                        {showDate && !shareStore.isSharing && (
                            <div className={styles.chatOperations}>
                                <div>
                                    {`${model.provider} - ${model.model}`}
                                </div>
                            </div>
                        )}
                        <ReactMarkdown
                            className={styles.markdownBlock}
                            remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
                            rehypePlugins={[RehypeKatex]}
                            components={{
                                code: CodeBlock,
                                pre: CopyCode,
                            }}
                        >
                            {message.text}
                        </ReactMarkdown>
                        {showDate && !shareStore.isSharing && (
                            <div
                                className={styles.chatDate}
                                style={{ right: isUser ? '0' : 'auto', left: isUser ? 'auto' : '0' }}
                            >
                                {message.date}
                            </div>
                        )}
                    </div>
                    {/* 移动端不显示头像 */}
                    {!isMobile && isUser && (
                        <div style={{ color: model.background, marginRight: 2 }} className={styles.modelAvatar}>
                            ME
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function ChatSession(props: { session: ChatSessionProps }) {
    const { session } = props;

    useEffect(() => {
        autoScroll(`chat-wrapper-${session.id}`);
    }, [session.messages.length]);

    return (
        <div className={styles.sessionWrapper}>
            <div className={styles.chat} id={`chat-wrapper-${session.id}`}>
                {Array.isArray(session.messages) && session.messages.length === 0 && (
                    <div className={styles.emptyChat}>
                        <div className={styles.emptyChatText}>
                            <span>Shortcuts</span>
                            <br />
                            <br />
                            <code>#</code>
                            {' - Change chat mode'}
                        </div>
                    </div>
                )}
                {Array.isArray(session.messages) && session.messages.map((message, index) => {
                    return (
                        <div key={message.id} className={styles.messageItem}>
                            <ChatMessage
                                key={message.id}
                                message={message}
                                sessionInfo={{
                                    id: session.id,
                                    name: session.name,
                                    bot: session.bot,
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            <ChatOperation modelName={session.name} />
        </div>
    );
}

const ChatPage: React.FC = () => {
    const chatStore = useChatStore();
    const configStore = useConfigStore();
    const shareStore = useShareStore();
    const { sessions } = chatStore;
    const { chosenChats, isPreview } = shareStore;

    return (
        <>
            <div className={styles.sessions}>
                {Array.isArray(sessions) && sessions.map((session) => {
                    if (configStore.mode === SERIAL_MODE && session.name !== SERIAL_SESSION) {
                        return null;
                    }
                    if ((configStore.mode === PARALLEL_MODE && session.name === SERIAL_SESSION) || !session.isShow) {
                        return null;
                    }
                    return (
                        <ChatSession
                            key={session.id}
                            session={session}
                        />
                    );
                })}
            </div>
            {isPreview && (
                <div className={styles.previewSessions}>
                    {Array.isArray(chosenChats) && chosenChats.map((share) => {
                        return (
                            <ChatSession
                                key={share.id}
                                session={share}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default ChatPage;
