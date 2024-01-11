import React, { useEffect, useState } from 'react';
import Chat from '@pages/chat/components/chat/chat.tsx';
import ModelList from '@pages/chat/components/model-list/model-list.tsx';
import PromptInput from '@pages/chat/components/prompt-input/prompt-input.tsx';
import Loading from '@components/loading/loading.tsx';
import ShareOperation from '@pages/chat/components/share-opertion/share-operation.tsx';
import styles from './chat.module.less';
import { useShareStore } from '@/store/share.ts';

const useHasHydrated = () => {
    const [hasHydrated, setHasHydrated] = useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => {
            setHasHydrated(true);
        }, 1500);
    }, []);

    return hasHydrated;
};
const ChatPage: React.FC = () => {
    const shareStore = useShareStore();

    if (!useHasHydrated()) {
        return (
            <Loading />
        );
    }

    return (
        <div className={styles.home}>
            <div className={styles.homeChats}>
                <Chat />
            </div>
            {(shareStore.isSharing || shareStore.isPreview) ? (
                <ShareOperation />
            ) : (
                <>
                    {/* 输入框 */}
                    <PromptInput />
                    {/* 可选模型列表 */}
                    <ModelList />
                </>
            )}
        </div>
    );
};

export default ChatPage;
