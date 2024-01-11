import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getShareInfo } from '@services/share.ts';
import { ShareInfo } from '@services/interfaces.ts';
import { CopyCode } from '@pages/chat/components/chat/chat.tsx';
import { ALL_MODELS, CLEAR_CONTEXT } from '@constants/models.ts';
import classNames from 'classnames';
import { isMobile } from 'sea-lion-ui';
import ReactMarkdown from 'react-markdown';
import RemarkMath from 'remark-math';
import RemarkGfm from 'remark-gfm';
import RemarkBreaks from 'remark-breaks';
import RehypeKatex from 'rehype-katex';
import CodeBlock from '@components/code-block/code-block.tsx';
import { autoScroll } from '@utils/utils.ts';
import styles from '@pages/chat/components/chat/chat.module.less';
import like from '@assets/imgs/like.png';
import QuestionCard from '@components/question-card/question-card.tsx';
// import data from '@emoji-mart/data';
// import Picker from '@emoji-mart/react';
import Dropdown from '@components/dropdown';
import shareStyles from './share.module.less';
import { useConfigStore } from '@/store/config.ts';
import { ChatMessage as ChatMessageProps, ChatSession as ChatSessionProps } from '@/store/chat.ts';

function ChatMessage(props: { message: ChatMessageProps }) {
    const [showDate, setShowDate] = useState(false);
    const { message } = props;
    const isUser = message.sender_type === 'user';
    const className = classNames(
        styles.messageWrapper,
        isUser ? styles.chatUser : styles.chatBot,
    );
    const configStore = useConfigStore();

    const model = ALL_MODELS.find((m) => m.name === (message.model || 'user'));

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
                                alt={model.name}
                            />
                        </div>
                    )}
                    {/* 消息主体 */}
                    <div
                        title={message.model || configStore.username}
                        className={className}
                        style={{ borderRadius: !isUser ? '1px 10px 10px 10px' : '10px 1px 10px 10px' }}
                    >
                        {showDate && (
                            <div className={styles.chatOperations}>
                                <div>
                                    {model.name}
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
                        {showDate && (
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

function ShareSession(props: { session: ChatSessionProps }) {
    const { session } = props;

    useEffect(() => {
        autoScroll(`chat-wrapper-${session.id}`);
    }, [session.messages.length]);

    return (
        <div className={styles.sessionWrapper}>
            <div className={styles.chat} id={`chat-wrapper-${session.id}`}>
                {Array.isArray(session.messages) && session.messages.map((message) => {
                    return (
                        <div key={message.id} className={styles.messageItem}>
                            <ChatMessage
                                key={message.id}
                                message={message}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const ShareContent = (props: { id }) => {
    const { id } = props;
    const [sessions, setSessions] = useState([]);
    const [shareInfo, setShareInfo] = useState<ShareInfo>(null);

    const [emoji, setEmoji] = useState('😅');

    useEffect(() => {
        (async () => {
            if (id) {
                try {
                    const rsp = await getShareInfo(id);
                    if (Array.isArray(rsp?.sessions)) {
                        setSessions(rsp.sessions);
                    }
                    setShareInfo(rsp);
                } catch (error) {
                    console.log(error);
                }
            }
        })();
    }, [id]);

    return (
        <div className={shareStyles.share}>
            {/* {shareInfo && ( */}
            {/*    <QuestionCard */}
            {/*        id="" */}
            {/*        name={shareInfo.name} */}
            {/*        description={shareInfo.description} */}
            {/*        userName={shareInfo.userName} */}
            {/*        tags={shareInfo.tags} */}
            {/*        createTime={shareInfo.createTime} */}
            {/*        answerCount={1} */}
            {/*        voteCount={1} */}
            {/*    /> */}
            {/* )} */}
            {Array.isArray(sessions) && sessions.map((session) => {
                return (
                    <ShareSession
                        key={session.id}
                        session={session}
                    />
                );
            })}
            <div className={shareStyles.shareOperation}>
                {/* <Dropdown */}
                {/*    placement="left-bottom" */}
                {/*    trigger={['click']} */}
                {/*    content={( */}
                {/*        <Picker */}
                {/*            data={data} */}
                {/*            onEmojiSelect={(emoji) => { */}
                {/*                setEmoji(emoji.native); */}
                {/*            }} */}
                {/*            locale="en" */}
                {/*            previewPosition="none" */}
                {/*        /> */}
                {/*    )} */}
                {/* > */}
                {/* </Dropdown> */}
                <div className={shareStyles.like}>
                    {emoji}
                </div>
            </div>
        </div>
    );
};

const SharePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    return (
        <ShareContent id={id} />
    );
};

export default SharePage;
