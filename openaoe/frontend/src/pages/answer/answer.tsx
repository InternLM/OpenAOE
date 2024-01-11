import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuestionAnswer } from '@services/share.ts';
import { ShareContent } from '@pages/share/share.tsx';
import QuestionCard, { QuestionCardProps } from '@components/question-card/question-card.tsx';
import GoForIt from '@assets/imgs/GoForIt.jpg';
import { getNeedEventCallback } from '@utils/utils.ts';
import styles from './answer.module.less';

const Answer: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [answers, setAnswers] = useState([]);
    const [questionDetail, setQuestionDetail] = useState<QuestionCardProps>(null);

    const goChat = () => {
        navigate('/chat');
    };

    useEffect(() => {
        (async () => {
            if (id) {
                try {
                    const rsp = await getQuestionAnswer(id);
                    if (rsp && Array.isArray(rsp.answers)) {
                        setAnswers(rsp.answers);
                    }
                    if (rsp) {
                        setQuestionDetail({
                            id: rsp.id,
                            name: rsp.title,
                            description: rsp.description,
                            userName: rsp.uname,
                            tags: rsp.tags,
                            createTime: rsp.createTime,
                            voteCount: rsp.voteCount,
                            answerCount: rsp.answerCount,
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        })();
    }, [id]);
    return (
        <div className={styles.answer}>
            <QuestionCard {...questionDetail} />
            {!answers.length && (
                <div className={styles.answerEmpty}>
                    <img src={GoForIt} alt="" />
                    <div>No one answered yet, let&rsquo;s answer.</div>
                    <div className={styles.btn} {...getNeedEventCallback(goChat)}>Go Chat</div>
                </div>
            )}
            {answers.map((item) => (
                <ShareContent id={item.shareId} key={item.id} />
            ))}
        </div>
    );
};

export default Answer;
