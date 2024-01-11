import { getQuestionList } from '@services/share.ts';
import { animate, init } from '@pages/home/black-hole.js';
import React, { useEffect, useRef, useState } from 'react';
import AskQuestion from '@pages/home/components/ask-question/ask-question.tsx';
import QuestionCard from '@components/question-card/question-card.tsx';
import search from '@assets/imgs/search.png';
import { useNavigate } from 'react-router-dom';
import Loading from '@components/loading/loading.tsx';
import styles from './home.module.less';

const Home = () => {
    const navigate = useNavigate();
    const spaceRef = useRef(null);
    const [keyword, setKeyword] = useState('');
    const [answerList, setAnswerList] = useState([]);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleSearch = async () => {
        try {
            setLoading(true);
            const rsp = await getQuestionList({
                keyword,
                pageNum: 1,
                pageSize: 10,
            });
            if (rsp && Array.isArray(rsp.data)) {
                setAnswerList(rsp.data);
                setLoading(false);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            handleSearch();
        }
    };

    const handleGoChat = () => {
        navigate('/chat');
    };

    useEffect(() => {
        handleSearch();
    }, [refreshFlag]);

    useEffect(() => {
        if (spaceRef.current) {
            const wrapper = spaceRef.current;
            if (wrapper.firstChild) {
                wrapper.removeChild(wrapper.firstChild);
            }
            // init();
            // animate();
        }
    }, [spaceRef]);

    return (
        <div className={styles.home}>
            <div className={styles.banner} ref={spaceRef} id="black-hole" />
            <div className={styles.searchWrapper}>
                <div className={styles.search}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Find your answer"
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div style={{ cursor: 'pointer' }} onClick={handleSearch}>
                        <img src={search} alt="search" />
                    </div>
                </div>
                <div
                    className={styles.btn}
                    onClick={handleGoChat}
                >
                    Chat
                </div>
                <AskQuestion callback={() => setRefreshFlag(!refreshFlag)} />
            </div>
            <div className={styles.answerWrapper}>
                {loading && <Loading />}
                {!loading && answerList.map((item) => {
                    return (
                        <QuestionCard
                            id={item.id}
                            name={item.title}
                            description={item.description}
                            userName={item.uname}
                            tags={item.tags}
                            createTime={item.createTime}
                            answerCount={item.answerCount}
                            voteCount={item.voteCount}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Home;
