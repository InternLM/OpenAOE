import React, { useEffect, useState } from 'react';
import {
    Button, Input, message, Modal
} from 'sea-lion-ui';
import classNames from 'classnames';
import { createQuestion, generateShare, getQuestionList } from '@services/share.ts';
import { copyToClipboard } from '@pages/chat/components/chat/chat.tsx';
import { getNeedEventCallback } from '@utils/utils.ts';
import useClickOutside from '@hooks/useClickOutside.tsx';
import styles from './share-opeeation.module.less';
import { useShareStore } from '@/store/share.ts';

export const Tag = ({ tag, handleClickTag }) => {
    const [chosen, setChosen] = useState(false);
    return (
        <div
            key={tag}
            className={classNames(styles.tag, { [styles.chosen]: chosen })}
            onClick={() => {
                setChosen(!chosen);
                handleClickTag(tag);
            }}
        >
            {tag}
        </div>
    );
};

const ShareOperation: React.FC = () => {
    const shareStore = useShareStore();
    const questionRef = React.useRef(null);
    const containerRef = React.useRef(null);
    const [open, setOpen] = useState(false);
    const [questionName, setQuestionName] = useState('');
    const [desc, setDesc] = useState('');
    const [tags, setTags] = useState([]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [questionList, setQuestionList] = useState([]);
    const [originQuestions, setOriginQuestions] = useState([]);
    const [positionRect, setPositionRect] = useState(null);
    const [chosenQuestion, setChosenQuestion] = useState(null);
    const Tags = ['Knowledge Probing', 'FAQ', 'Classification', 'Information Extraction', 'Reasoning', 'Math', 'Code', 'Emotion'];
    const [loading, setLoading] = useState(false);

    const handleQuit = () => {
        // 退出分享模式
        shareStore.updateIsSharing(false);
        // 重置分享数据
        shareStore.reset();
    };

    const handlePreview = () => {
        if (shareStore.totalMessages === 0) {
            message.warning('Please select at least one message');
        } else {
            // 进入preview模式
            shareStore.updateIsPreview(true);
        }
    };

    const handleOpen = () => {
        if (shareStore.totalMessages === 0) {
            message.warning('Please select at least one message');
        } else {
            // 打开分享窗口
            setOpen(true);
        }
    };

    const handleShare = async () => {
        if (!questionName || loading) {
            return;
        }

        const isNewQuestion = !chosenQuestion || chosenQuestion.title !== questionName;
        let questionId = chosenQuestion?.id;
        setLoading(true);

        if (isNewQuestion) {
            // create question
            try {
                const rsp = await createQuestion({
                    name: questionName,
                    description: desc,
                    tags,
                });
                if (rsp.msgCode === '10000') {
                    questionId = rsp.data.id;
                } else {
                    message.error('Create new question failed');
                }
            } catch (error) {
                console.log(error);
            }
        }

        // 生成分享id
        try {
            if (!chosenQuestion || chosenQuestion.title !== questionName) {
                const rsp = await createQuestion({
                    name: questionName,
                    description: desc,
                    tags,
                });
                questionId = rsp.data.id;
            }
            const rsp = await generateShare({
                questionId,
                name: '',
                description: desc,
                tags,
                sessions: shareStore.chosenChats,
                ttl: 7
            });
            if (rsp.msgCode === '10000') {
                const { shareId } = rsp.data;
                // 退出分享模式
                shareStore.updateIsSharing(false);
                shareStore.updateIsPreview(false);
                // 重置分享数据
                shareStore.reset();
                setOpen(false);
                // 复制链接
                copyToClipboard(`${window.location.origin}/share/${shareId}`);
                message.success('Share and copy successfully');
            } else {
                message.error(`Share failed${rsp.msg}`);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleClickTag = (tag) => {
        if (tags.includes(tag)) {
            setTags(tags.filter((item) => item !== tag));
        } else {
            setTags([...tags, tag]);
        }
    };

    const handleClickQuestion = (question) => {
        setChosenQuestion(question);
        setQuestionName(question.title);
        setPositionRect(null);
        if (questionRef.current) {
            questionRef.current.blur();
        }
    };

    const handleKeyDown = (e) => {
        const questionLength = questionList.length;
        if (positionRect && e.key === 'ArrowUp') {
            const index = questionIndex === 0 ? questionLength - 1 : questionIndex - 1;
            setQuestionIndex(index);
        }
        if (positionRect && e.key === 'ArrowDown') {
            const index = questionIndex === questionLength - 1 ? 0 : questionIndex + 1;
            setQuestionIndex(index);
        }
        if (positionRect && e.key === 'Enter') {
            handleClickQuestion(questionList[questionIndex]);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const rsp = await getQuestionList({
                    keyword: '',
                    pageNum: 1,
                    pageSize: 100,
                });
                if (rsp && Array.isArray(rsp.data)) {
                    setOriginQuestions(rsp.data);
                }
            } catch (e) {
                console.log(e);
            }
        })();
    }, []);

    useEffect(() => {
        if (!open) {
            setQuestionName('');
            setChosenQuestion(null);
            setPositionRect(null);
            setDesc('');
            setTags([]);
        }
    }, [open]);

    useEffect(() => {
        const list = originQuestions.filter((item) => item.title.includes(questionName));
        setQuestionList(list);
    }, [questionName, originQuestions]);

    useClickOutside(containerRef, () => {
        setPositionRect(null);
        setChosenQuestion('');
    });

    return (
        <div className={styles.homeShare}>
            <div>
                {`${shareStore.totalSessions} session(s), ${shareStore.totalMessages} message(s) selected`}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {!shareStore.isPreview ? (
                    <Button
                        btnType="secondary"
                        onClick={handleQuit}
                    >
                        Quit
                    </Button>

                ) : (
                    <Button
                        btnType="secondary"
                        onClick={() => {
                            // 返回分享模式
                            shareStore.updateIsPreview(false);
                        }}
                    >
                        Return
                    </Button>
                )}
                {!shareStore.isPreview && (
                    <Button
                        btnType="primary"
                        className={styles.shareBtn}
                        onClick={handlePreview}
                    >
                        Preview
                    </Button>
                )}
                <Button
                    btnType="primary"
                    className={styles.shareBtn}
                    onClick={handleOpen}
                >
                    Share Now
                </Button>
            </div>
            <Modal
                open={open}
                closeable={false}
                onClose={null}
                className={styles.modal}
                title="Info Settings"
                okText="Share and Copy"
                cancelText="Cancel"
                onOk={handleShare}
                onCancel={() => setOpen(false)}
            >
                <div>You are sharing an answer for:</div>
                <div
                    style={{ position: 'relative' }}
                    ref={containerRef}
                >
                    {/* 允许用户自定义输入 */}
                    <Input
                        maxLength={1000}
                        ref={questionRef}
                        value={questionName}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (questionRef.current) {
                                setPositionRect({
                                    left: questionRef.current.offsetLeft,
                                    top: questionRef.current.offsetTop,
                                    width: questionRef.current.offsetWidth,
                                });
                            }
                        }}
                        onChange={(e) => setQuestionName(e.target.value)}
                    />
                    {!(chosenQuestion || questionName) && <div className={styles.error}>Please enter a question</div>}
                    {positionRect && questionList.length > 0 && (
                        <div
                            className={styles.questionList}
                            style={{
                                left: positionRect.left - 12,
                                top: positionRect.top + 34,
                            }}
                        >
                            {questionList
                                .map((item, index) => {
                                    return (
                                        <div
                                            className={classNames(styles.questionItem, { [styles.chosenItem]: questionIndex === index })}
                                            key={item.id}
                                            title={item.title}
                                            {...getNeedEventCallback(() => handleClickQuestion(item))}
                                        >
                                            {item.title}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
                <div style={{ marginTop: 12 }}>Description:</div>
                <Input
                    maxLength={200}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                />
                <div className={styles.tags}>
                    {Tags.map((tag) => (
                        <Tag key={tag} tag={tag} handleClickTag={handleClickTag} />
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default ShareOperation;
