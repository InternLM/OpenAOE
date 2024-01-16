import {
    PARALLEL_MODE, SERIAL_MODE, SERIAL_SESSION
} from '@constants/models.ts';
import { ALL_MODELS } from '@config/model-config.ts';
import { message } from 'sea-lion-ui';
import React, {
    useEffect, useLayoutEffect, useState
} from 'react';
import {
    getCaretPosition, getNeedEventCallback, setCaretPos
} from '@utils/utils.ts';
import { Configs, ConfigState } from '@constants/configs.ts';
import classNames from 'classnames';
import send from '@assets/imgs/send.png';
import sanitizeHtml from 'sanitize-html';
import { useChatStore } from '@/store/chat.ts';
import { useBotStore } from '@/store/bot.ts';
import { useConfigStore } from '@/store/config.ts';
import styles from './prompt-input.module.less';

const BOT_PLACEHOLDER = {
    default: 'Press # to toggle chat mode, and ENTER to send',
    google: 'Google does not support Chinese',
};

const PromptInput = () => {
    const chatStore = useChatStore();
    const botStore = useBotStore();
    const configStore = useConfigStore();
    const editorRef = React.useRef<HTMLDivElement>(null);
    const hiddenRef = React.useRef<HTMLDivElement>(null);
    const [configs, setConfigs] = useState(Configs);

    /** commands and input filters */
    const [showConfig, setShowConfig] = useState(false);
    const [currPrompt, setCurrPrompt] = useState('');
    const [currConfig, setCurrConfig] = useState<ConfigState>(null);
    const [chosenConfig, setChosenConfig] = useState(0);
    const [configFilter, setConfigFilter] = useState('');

    /** editor's style and content */
    const [placeholder, setPlaceholder] = useState(BOT_PLACEHOLDER.default);
    const [editorContent, setEditorContent] = useState('');
    const [caretPosition, setCaretPosition] = useState(0);
    const [isComposing, setIsComposing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    /** clean input
     * @param html innerHTML
     * Use hiddenRef as an intermediary to solve the bug of missing line breaks
     */
    const cleanInput = (html: string) => {
        html = html.replace(/<span class="modelName">.*?<\/span>/g, '');
        hiddenRef.current.innerHTML = html;
        return hiddenRef.current.innerText || '';
    };

    /** filter html tags to prevent XSS attacks
     * @param content innerHTML
     * @param updateCaretFlag whether to update caret position
     */
    const handleContentChange = (content: string, updateCaretFlag = true) => {
        if (content === editorContent) {
            return;
        }

        const sanitizeConf = {
            allowedTags: ['b', 'i', 'a', 'p', 'text', 'br', 'div', 'span', 'img'],
            allowedAttributes: {
                a: ['href'], span: ['class', 'id'], img: ['src'], div: ['class', 'id']
            }
        };

        if (updateCaretFlag) {
            // save caret position for later updation
            const position = getCaretPosition(editorRef.current);
            setCaretPosition(position);
        }

        setEditorContent(sanitizeHtml(content, sanitizeConf));
    };

    /** Chose config */
    const handleClickConfig = (config) => {
        if (config.name === 'Serial Mode') {
            configStore.updateMode(SERIAL_MODE);
            message.success('Change to serial mode!');
            handleContentChange('');
        } else if (config.name === 'Parallel Mode') {
            configStore.updateMode(PARALLEL_MODE);
            message.success('Change to parallel mode!');
            handleContentChange('');
        } else {
            setCurrConfig(config);
            handleContentChange('');
        }
        setCurrPrompt('');
        setShowConfig(false);
        setConfigFilter('');
    };

    /** Send message to model */
    const handleSendMessage = () => {
        if (currPrompt.trim()) {
            setCurrPrompt('');
            handleContentChange('');
            if (configStore.mode === SERIAL_MODE) {
                const provider = ALL_MODELS.find((model) => model.model === botStore.currentBot).provider;
                chatStore.onUserInput(currPrompt, provider, botStore.currentBot, SERIAL_SESSION);
            } else {
                botStore.chosenBotNames.forEach((botName) => {
                    const provider = ALL_MODELS.find((model) => model.model === botName).provider;
                    chatStore.onUserInput(currPrompt, provider, botName, botName);
                });
            }
        }
    };

    /**
     * handle event when press key, triggered when press key down(before input changed)
     * sometime need to prevent default
     * @param e
     */
    const onKeyDown = (e) => {
        const keyValue = e.key;
        if (isComposing) {
            return;
        }
        if (keyValue === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (currPrompt.trim()) {
                if (showConfig) {
                    handleClickConfig(configs[chosenConfig]);
                    return;
                }
                handleSendMessage();
            }
            setIsEmpty(true);
        }
        if (keyValue === '#' && !showConfig) {
            setShowConfig(true);
        }
        // Allow to select config when press up/down arrow
        if (showConfig) {
            const configLength = configs.length - 1;
            if (keyValue === 'ArrowUp') {
                setChosenConfig(chosenConfig === 0 ? configLength : chosenConfig - 1);
                e.preventDefault();
            } else if (keyValue === 'ArrowDown') {
                setChosenConfig(chosenConfig === configLength ? 0 : chosenConfig + 1);
                e.preventDefault();
            } else if (keyValue === 'Backspace' && currPrompt.slice(-1) === '#') {
                setShowConfig(false);
                setConfigFilter('');
            }
        }
        // Close config window when press ESC
        if (showConfig && keyValue === 'Escape') {
            setShowConfig(false);
        }
    };

    /**
     * editable div, update currPrompt when input content changed
     * @param e
     */
    const onInput = (e) => {
        setIsEmpty(!e.target.textContent.length);
        const target = e.target as HTMLDivElement;
        setCurrPrompt(cleanInput(target.innerHTML));
        const content = target.innerHTML;
        handleContentChange(content);
    };

    useEffect(() => {
        const newConfigs = Configs
            .filter((config) => config.name.toLowerCase().includes(configFilter.toLowerCase()));
        setChosenConfig(0);
        if (newConfigs.length === 0) {
            setShowConfig(false);
            setConfigs(Configs);
        } else {
            setConfigs(newConfigs);
        }
    }, [configFilter]);

    useEffect(() => {
        if (showConfig) {
            // update configFilter when more input content following #
            setConfigFilter(currPrompt.split('#').slice(-1)[0]);
        }
    }, [currPrompt]);

    useEffect(() => {
        if (currConfig) {
            setPlaceholder(currConfig.description);
        } else {
            setPlaceholder(BOT_PLACEHOLDER[botStore.currentBot] || BOT_PLACEHOLDER.default);
        }
    }, [currConfig, botStore.currentBot]);

    useLayoutEffect(() => {
        if (editorRef.current) {
            setCaretPos(editorRef.current, caretPosition);
        }
    }, [editorContent]);

    return (
        <>
            <div className={styles.homeInputWrapper}>
                {/** config list */}
                {showConfig && (
                    <div className={styles.homePromptWrapper}>
                        {configs.map((item, index) => {
                            return (
                                <div
                                    key={item.name}
                                    className={classNames(styles.prompt, { [styles.chosenPrompt]: index === chosenConfig })}
                                    {...getNeedEventCallback(() => handleClickConfig(item))}
                                >
                                    <div className={styles.modelItem}>
                                        {item.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {currConfig && (
                    <div className={styles.modelName}>
                        #
                        {currConfig.name}
                    </div>
                )}
                {/** prompt input box */}
                {/* TODO input should be disabled when there are generating answers */}
                <div
                    contentEditable
                    spellCheck
                    ref={editorRef}
                    id="prompt-textarea"
                    className={classNames(styles.promptEditor, { [styles.emptyEditor]: isEmpty })}
                    data-text={placeholder}
                    onKeyDown={onKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onInput={onInput}
                    onCompositionEnd={() => setIsComposing(false)}
                    dangerouslySetInnerHTML={{ __html: editorContent }}
                />
                {/** config submit button when Config mode */}
                {/** or show send/upload icon */}
                <img
                    className={styles.promptClip}
                    src={send}
                    alt="send-message"
                    {...getNeedEventCallback(handleSendMessage)}
                />
            </div>
            {/* Set for fixing bug caused by function cleanInput, invisible for users */}
            <div
                ref={hiddenRef}
                style={{
                    opacity: 0,
                    display: 'hidden',
                    position: 'fixed',
                    fontSize: 0
                }}
            />
        </>
    );
};

export default PromptInput;
