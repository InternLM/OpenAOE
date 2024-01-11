import React from 'react';
import styles from './loading.module.less';

const Loading: React.FC = () => {
    return (
        <div className={styles.homeLoading}>
            <div className={styles.loadingIcon} />
        </div>
    );
};

export default Loading;
