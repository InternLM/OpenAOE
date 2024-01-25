import {
    PARALLEL_MODE, PARALLEL_MODEL_MAX, SERIAL_MODE
} from '@constants/models.ts';
import { useContext, useRef, useState } from 'react';
import { getNeedEventCallback } from '@utils/utils.ts';
import { message } from 'sea-lion-ui';
import { GlobalConfigContext } from '@components/global-config/global-config-context.tsx';
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
    const ref = useRef<HTMLDivElement>(null);
    const configStore = useConfigStore();
    const chatStore = useChatStore();
    const botStore = useBotStore();
    const [showName, setShowName] = useState(false);
    const showChosen = ((configStore.mode === PARALLEL_MODE && botStore.chosenBotNames.includes(props.model.model)) || (configStore.mode === SERIAL_MODE && botStore.currentBot === props.model.model));

    /**
     * Change model, different mode has different behavior
     * @param model
     */
    function handleChangeModel(model) {
        // PARALLEL_MODE
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
            // SERIAL_MODE
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
            <img
                src={props.model.webui.avatar}
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
    const { models } = useContext(GlobalConfigContext);
    return (
        <div className={styles.homeModels} onMouseLeave={resetScale}>
            {models && Object.keys(models).map((modelName) => {
                return (
                    <ModelAvatar
                        key={modelName}
                        model={{ model: modelName, ...models[modelName] }}
                    />
                );
            })}
        </div>
    );
};

export default ModelList;
