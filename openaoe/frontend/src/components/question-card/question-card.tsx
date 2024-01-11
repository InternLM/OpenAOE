import React from 'react';
import { formatTime } from '@utils/utils.ts';
import { useNavigate } from 'react-router-dom';
import styles from './question-card.module.less';

export interface QuestionCardProps {
    id: string;
    name: string;
    description: string;
    userName: string;
    tags: string[];
    createTime: number;
    voteCount: number;
    answerCount: number;
}

const QuestionCard = (props: QuestionCardProps) => {
    const {
        id,
        name,
        description,
        userName,
        tags,
        createTime,
        voteCount,
        answerCount,
    } = props;
    const time = formatTime(createTime);
    const navigate = useNavigate();
    const handleGoAnswer = () => {
        if (!id) {
            return;
        }
        navigate(`/answer/${id}`);
    };
    return (
        <div className={styles.shareInfo}>
            <div
                className={styles.name}
                onClick={handleGoAnswer}
            >
                {name}
            </div>
            <div className={styles.desc}>{description || ''}</div>
            <div className={styles.tags}>
                {tags?.map((item) => (
                    <span className={styles.tag}>{item}</span>
                ))}
            </div>
            <div className={styles.footer}>
                <span className={styles.answer}>
                    <strong>{answerCount}</strong>
                    {` ${answerCount > 1 ? 'answers' : 'answer'}`}
                </span>
                /
                <span className={styles.vote}>
                    <strong>{voteCount}</strong>
                    {` ${voteCount > 1 ? 'votes' : 'vote'}`}
                </span>
                <div className={styles.username}>{`@${userName} asked at ${time}`}</div>
            </div>
        </div>
    );
};

export default QuestionCard;
