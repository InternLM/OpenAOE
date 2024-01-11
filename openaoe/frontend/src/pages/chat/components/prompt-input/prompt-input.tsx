import {
    ALL_MODELS, PARALLEL_MODE, SERIAL_MODE, SERIAL_SESSION
} from '@constants/models.ts';
import { message } from 'sea-lion-ui';
import React, {
    useEffect, useLayoutEffect, useState
} from 'react';
import {
    getCaretElement, getCaretPosition, getNeedEventCallback, setCaretPos
} from '@utils/utils.ts';
import { Configs, ConfigState } from '@constants/configs.ts';
import classNames from 'classnames';
import send from '@assets/imgs/send.png';
import { handleChangeModel } from '@pages/chat/components/model-list/model-list.tsx';
import sanitizeHtml from 'sanitize-html';
import { useChatStore } from '@/store/chat.ts';
import { useBotStore } from '@/store/bot.ts';
import { useConfigStore } from '@/store/config.ts';
import styles from './prompt-input.module.less';

const BOT_PLACEHOLDER = {
    default: 'Press # to toggle chat mode, and ENTER to send',
    google: 'Google does not support Chinese',
};

const promptConfig = {
    PromptName: 'Enter prompt\'s name firstly and submit it.',
    PromptContent: 'Enter prompt\'s content and submit it.',
};

const PromptInput = () => {
    const chatStore = useChatStore();
    const botStore = useBotStore();
    const configStore = useConfigStore();
    const editorRef = React.useRef<HTMLDivElement>(null);
    const hiddenRef = React.useRef<HTMLDivElement>(null);
    const [configs, setConfigs] = useState(Configs);

    /** 控制命令和筛选项 */
    // 用于控制config窗口的显示
    const [showConfig, setShowConfig] = useState(false);
    // 用于控制输入的prompt
    const [currPrompt, setCurrPrompt] = useState('');
    // 用于控制当前选中的model
    const [currModel, setCurrModel] = useState('');
    // 用于控制当前选中的model
    const [currConfig, setCurrConfig] = useState<ConfigState>(null);
    // 用于控制当前高亮的config
    const [chosenConfig, setChosenConfig] = useState(0);
    const [configFilter, setConfigFilter] = useState('');

    /** 控制输入框的样式及内容 */
    const [placeholder, setPlaceholder] = useState(BOT_PLACEHOLDER.default);
    const [templateName, setTemplateName] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [caretPosition, setCaretPosition] = useState(0);
    const [isComposing, setIsComposing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    /** 清洗输入的内容, 高亮内容不需要输入
     * @param html html文本内容
     * 使用hiddenRef作为中介，解决换行符缺失的bug
     */
    const cleanInput = (html: string) => {
        html = html.replace(/<span class="modelName">.*?<\/span>/g, '');
        hiddenRef.current.innerHTML = html;
        return hiddenRef.current.innerText || '';
    };

    /** 无害化处理, 防止xss攻击
     * @param content innerHTML
     * @param updateCaretFlag 是否更新光标位置
     */
    const handleContentChange = (content: string, updateCaretFlag = true) => {
        if (content === editorContent) {
            return;
        }

        const sanitizeConf = {
            allowedTags: ['b', 'i', 'a', 'p', 'text', 'br', 'div', 'span', 'img'],
            allowedAttributes: { a: ['href'], span: ['class'], img: ['src'] }
        };

        if (updateCaretFlag) {
            // 保存光标位置， 用于后续更正光标位置
            const position = getCaretPosition(editorRef.current);
            setCaretPosition(position);
        }

        setEditorContent(sanitizeHtml(content, sanitizeConf));
    };

    /** 选择某个config */
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

    /** chat 模式下，给bot发送消息 */
    const handleSendMessage = () => {
        if (currPrompt.trim()) {
            setCurrPrompt('');
            handleContentChange('');
            // 发送消息
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
     * 处理键盘事件, 包括上下键选择prompt, model, config, 偶尔需要拦截输入
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
                    // 选中了某个config
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
        // 如果config窗口打开的话, 处理上下键选择config
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
        // 如果prompt窗口或者model窗口打开的话, 处理esc键关闭窗口
        if (showConfig && keyValue === 'Escape') {
            setShowConfig(false);
        }
        //  删除光标前面高亮的内容
        if (keyValue === 'Backspace') {
            const caretPrevElement = getCaretElement() as HTMLSpanElement;
            if (caretPrevElement && caretPrevElement.nodeName === 'SPAN' && caretPrevElement.className === 'modelName') {
                const content = editorContent;
                const target = `<span class="modelName">${ caretPrevElement.textContent }</span>`;
                setCaretPosition(caretPosition - caretPrevElement.textContent.length + 1);
                handleContentChange(content.replace(target, ''), false);
            }
        }
    };

    /**
     * editable div 输入事件, 内容变化时更新currPrompt
     * @param e
     */
    const onKeyUp = (e) => {
        if (isComposing) {
            return;
        }
        const target = e.target as HTMLDivElement;
        setCurrPrompt(cleanInput(target.innerHTML));
        const content = target.innerHTML;
        handleContentChange(content);
    };

    const onInput = (e) => {
        setIsEmpty(!e.target.textContent.length);
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
        if (currModel && configStore.mode === SERIAL_MODE) {
            // 如果是serial模式，更新当前高亮的model
            // 响应点击选择模型的变化
            const model = botStore.currentBot;
            let newContent = editorContent;
            newContent = newContent.replace(
                `<span class="modelName">@${ currModel }</span>`,
                `<span class="modelName">@${ model }</span>`
            );
            setCurrModel(model);
            handleContentChange(newContent);
        }
        // TODO 如果是parallel模式，通过点击模型头像删除某个model时，需要把对应的高亮删除
    }, [botStore.currentBot]);

    useEffect(() => {
        if (showConfig) {
            // 如果 # 后面继续输入 ，就更新configFilter
            setConfigFilter(currPrompt.split('#').slice(-1)[0]);
        }
    }, [currPrompt]);

    useEffect(() => {
        if (currConfig) {
            if (currConfig.name === 'Prompt') {
                setPlaceholder(templateName ? promptConfig.PromptContent : promptConfig.PromptName);
            } else {
                setPlaceholder(currConfig.description);
            }
        } else {
            setPlaceholder(BOT_PLACEHOLDER[botStore.currentBot] || BOT_PLACEHOLDER.default);
        }
    }, [currConfig, templateName, botStore.currentBot]);

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
                {/* FIXME 上一个问题没有结束时，应该禁言输入框 */}
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
                    onKeyUp={onKeyUp}
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
            {/* 用于解决cleanInput的空格符消失bug， 实际上在页面上不显示 */}
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
