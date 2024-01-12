import {
    ALL_MODELS, NON_BOT, PARALLEL_MODE, PARALLEL_MODEL_MAX, SERIAL_MODE
} from '@constants/models.ts';
import React from 'react';
import { getNeedEventCallback } from '@utils/utils.ts';
import { message } from 'sea-lion-ui';
import styles from './model-list.module.less';
import { BotState, useBotStore } from '@/store/bot.ts';
import { useChatStore } from '@/store/chat.ts';
import { useConfigStore } from '@/store/config.ts';

const resetScale = () => {
    document.querySelectorAll('.scale-avatar').forEach((li: HTMLDivElement) => {
        li.style.setProperty('--scale', '1');
    });
};


function ModelAvatar(props: {
    model: BotState
}) {
    const ref = React.useRef<HTMLDivElement>(null);
    const configStore = useConfigStore();
    const chatStore = useChatStore();
    const botStore = useBotStore();
    const [showName, setShowName] = React.useState(false);
    const showChosen = ((configStore.mode === PARALLEL_MODE && botStore.chosenBotNames.includes(props.model.model)) || (configStore.mode === SERIAL_MODE && botStore.currentBot === props.model.model));

    /**
     * 处理模型切换
     * @param model
     */
    function handleChangeModel(model) {
        // 多模型情况
        if (configStore.mode === PARALLEL_MODE) {
            if (botStore.chosenBotNames.includes(model)) {
                if (botStore.chosenBotNames.length === 1) {
                    message.warning('At least one model should be selected');
                    return;
                }
                botStore.removeBot(model);
                chatStore.removeSession(model);
            } else if (botStore.chosenBotNames.length === PARALLEL_MODEL_MAX) {
                message.warning('No more models can be selected');
            } else {
                botStore.addBot(model);
                chatStore.newSession(model);
            }
        } else {
            // 单模型情况
            botStore.updateCurrentBot(model);
        }
    }
    const handleMouseMove = (e) => {
        let item = e.target;
        if (e.target !== ref.current) {
            // run only when mouse move on the avatar
            item = e.target.parentNode;
        }
        const itemRect = item.getBoundingClientRect();
        const offset = Math.abs(e.clientX - itemRect.left) / itemRect.width;

        const prev = (item.previousElementSibling || null) as HTMLDivElement;
        const next = (item.nextElementSibling || null) as HTMLDivElement;

        const scale = 0.4;

        resetScale();

        if (prev) {
            prev.style.setProperty('--scale', `${1 + scale * Math.abs(offset - 1)}`);
        }

        item.style.setProperty('--scale', `${1 + scale}`);

        if (next) {
            next.style.setProperty('--scale', `${1 + scale * offset}`);
        }
        e.stopPropagation();
    };

    return (
        <div
            ref={ref}
            className={`${styles.modelAvatar} ${showChosen && styles.modelAvatarChosen} scale-avatar`}
            onMouseMove={handleMouseMove}
            onMouseOver={() => setShowName(true)}
            onMouseLeave={() => setShowName(false)}
            {...getNeedEventCallback(() => handleChangeModel(props.model.model))}
            onFocus={() => setShowName(true)}
        >
            {/* {botStore.chosenBotNames.includes(props.model.name) && ( */}
            {/*    <img */}
            {/*        openaoe={`${BASE_IMG_URL}chosen.svg`} */}
            {/*        className={styles.modelChosen} */}
            {/*        alt="chosen" */}
            {/*    /> */}
            {/* )} */}
            <img
                src={props.model.avatar}
                className={styles.modelAvatarImg}
                alt={props.model.provider}
            />
            {(showName || showChosen) && (
                <div className={styles.modelName}>
                    @
                    {props.model.model || props.model.provider}
                </div>
            )}
        </div>
    );
}

const ModelList = () => {
    return (
        <div className={styles.homeModels} onMouseLeave={resetScale}>
            {ALL_MODELS
                .filter((model) => (!NON_BOT.includes(model.provider)))
                .map((model) => {
                    return (
                        <ModelAvatar key={model.model} model={model} />
                    );
                })}
        </div>
    );
};

export default ModelList;