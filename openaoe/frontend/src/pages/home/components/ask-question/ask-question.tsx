import {
    Input, message, Modal
} from 'sea-lion-ui';
import React, { useEffect, useState } from 'react';
import { createQuestion } from '@services/share.ts';
import { Tag } from '@pages/chat/components/share-opertion/share-operation.tsx';
import styles from './ask-question.module.less';

const AskQuestion: React.FC<{callback?: () => void}> = ({ callback = null }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [tags, setTags] = useState([]);
    const Tags = ['Knowledge Probing', 'FAQ', 'Classification', 'Information Extraction', 'Reasoning', 'Math', 'Code', 'Emotion', 'Funny', 'Logical'];

    const handleOpen = () => {
        setOpen(true);
    };

    const handleShare = async () => {
        if (!name) {
            return;
        }
        try {
            const rsp = await createQuestion({
                name,
                description: desc,
                tags,
            });
            if (rsp.msgCode === '10000') {
                message.success('Ask question successfully');
                setOpen(false);
                if (callback) {
                    callback();
                }
            } else {
                message.error(`Ask failed: ${rsp.msg}`);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleClickTag = (tag) => {
        if (tags.includes(tag)) {
            setTags(tags.filter((item) => item !== tag));
        } else {
            setTags([...tags, tag]);
        }
    };

    useEffect(() => {
        if (!open) {
            setName('');
            setDesc('');
            setTags([]);
        }
    }, [open]);
    return (
        <>
            <div
                className={styles.btn}
                onClick={handleOpen}
            >
                Question
            </div>
            <Modal
                open={open}
                closeable={false}
                onClose={() => null}
                className={styles.modal}
                title="Question details"
                okText="Confirm"
                cancelText="Cancel"
                onOk={handleShare}
                onCancel={() => setOpen(false)}
            >
                <div>Question (Required):</div>
                <Input
                    maxLength={1000}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {!name && <div className={styles.error}>Please enter the question</div>}
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
        </>
    );
};

export default AskQuestion;
