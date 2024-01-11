import AOE from '@assets/imgs/AOE.svg';
import sun from '@assets/imgs/sun.png';
import moon from '@assets/imgs/moon.png';
import React, { useEffect, useState } from 'react';
import styles from './header.module.less';
import { useConfigStore } from '@/store/config.ts';

const Header = () => {
    const lightRef = React.useRef<HTMLSpanElement>(null);
    const darkRef = React.useRef<HTMLSpanElement>(null);
    const [imgLoaded, setImgLoaded] = useState(false);
    const configStore = useConfigStore();
    const navigateToHome = () => {
        window.location.href = '/';
    };
    const handleThemeChange = (theme = '') => {
        setTimeout(() => {
            configStore.updateTheme(theme || configStore.theme === 'light' ? 'dark' : 'light');
        }, 200);
    };

    useEffect(() => {
        // 判断系统是否开启了暗黑模式;
        // FIXME 这个根据系统设置的暗黑模式来切换主题的逻辑有问题
        // if (window.matchMedia('(prefers-color-scheme: dark)').matches && configStore.theme !== 'light') {
        //     handleThemeChange('dark');
        // } else {
        //     handleThemeChange('light');
        // }
    }, [configStore.theme]);

    useEffect(() => {
        document.body.setAttribute('data-theme', configStore.theme);
        if (lightRef.current && darkRef.current) {
            if (configStore.theme === 'light') {
                lightRef.current.classList.remove(styles.animateLight);
                darkRef.current.classList.remove(styles.animateDark);
            } else if (configStore.theme === 'dark') {
                lightRef.current.classList.add(styles.animateLight);
                darkRef.current.classList.add(styles.animateDark);
            }
        }
    }, [configStore.theme, imgLoaded]);
    return (
        <div className={styles.header}>
            <div className={styles.headerTitle} onClick={navigateToHome}>
                <img src={AOE} alt="AOE_LOGO" />
            </div>
            <div className={styles.headerOperation} onClick={() => handleThemeChange()}>
                <span ref={lightRef} className={styles.lightTheme}>
                    <img src={sun} alt="sun" onLoad={() => setImgLoaded(!imgLoaded)} />
                </span>
                <span ref={darkRef} className={styles.darkTheme}>
                    <img src={moon} alt="moon" onLoad={() => setImgLoaded(!imgLoaded)} />
                </span>
            </div>
        </div>
    );
};

export default Header;
