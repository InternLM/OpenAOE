import jsCookie from 'js-cookie';
import { isMobile } from 'sea-lion-ui';

// TODO

export const compose = (...args: any[]) => {
    const fns = args.map(arg => {
        return typeof arg === 'function' ? arg : () => arg;
    });

    return (...innerArgs: any) => {
        let index = 0;
        let result;
        result = fns.length === 0 ? innerArgs : fns[index++](...innerArgs);

        while (index < fns.length) {
            result = fns[index++](result);
        }

        return result;
    };
};

export type Language = 'zh-CN' | 'en-US';
export const LanguageKey = 'locale';

export const loadLang = () => {
    const storeLang = window.localStorage.getItem(LanguageKey);
    if (storeLang) {
        return storeLang === 'en-US' ? 'en-US' : 'zh-CN';
    }
    // default lang: English
    localStorage.setItem(LanguageKey, 'en-US');
    return 'en-US';
};

let currentLang: Language = loadLang();
const saveLang = (lang: Language) => {
    window.localStorage.setItem(LanguageKey, lang);
    return lang;
};

export const getLang = () => currentLang;
export const setLang = (lang: Language) => {
    currentLang = saveLang(lang);
};

// 用javascript删除某一个cookie的方法，该方法传入要删除cookie的名称
export const removeCookie = (cookieName: string) => {
    const cookies = document.cookie.split(';');// 将所有cookie键值对通过分号分割为数组
    // 循环遍历所有cookie键值对
    for (let i = 0; i < cookies.length; i++) {
        // 有些cookie键值对前面会莫名其妙产生一个空格，将空格去掉
        const _cookieName = cookies[i].split('=')[0].trim();
        // 比较每个cookie的名称，找到要删除的那个cookie键值对
        if (_cookieName === cookieName) {
            const exp = new Date();// 获取客户端本地当前系统时间

            // 将exp设置为客户端本地时间1分钟以前，将exp赋值给cookie作为过期时间后，就表示该cookie已经过期了, 那么浏览器就会将其立刻删除掉
            exp.setTime(exp.getTime() - 60);

            // 设置要删除的cookie的过期时间，即在该cookie的键值对后面再添加一个expires键值对
            // 并将上面的exp赋给expires作为值(注意expires的值必须为UTC或者GMT时间，不能用本地时间）
            // 那么浏览器就会将该cookie立刻删除掉
            document.cookie = `${cookies[i]};expires=${exp.toUTCString()};path=/;domain=${import.meta.env.VITE_COOKIE_DOMAIN}`;

            // 注意document.cookie的用法很巧妙，在对其进行赋值的时候是设置单个cookie的信息，但是获取document.cookie的值的时候是返回所有cookie的信息
            break;// 要删除的cookie已经在客户端被删除掉，跳出循环
        }
    }
};

export const Token = {
    tokenKey: 'x_token',
    cookieTokenKey: 'uaa-token',
    getFromCookie() {
        return jsCookie.get(this.cookieTokenKey);
    },

    storage(token: string | null | undefined) {
        if (token === undefined || token === null) {
            localStorage.removeItem(this.tokenKey);
            return false;
        }
        localStorage.setItem(this.tokenKey, token);
        return true;
    },

    update(token: string | null) {
        const oldToken = localStorage.getItem(this.tokenKey);
        if (oldToken !== token) {
            this.storage(token);
        }
    },

    get() {
        const currentToken = this.getFromCookie() as (string | null);

        this.update(currentToken);
        return currentToken || localStorage.getItem(this.tokenKey);
    },

    has() {
        return !!this.get();
    },

    removeAll() {
        removeCookie(this.cookieTokenKey);
        removeCookie('ssouid');
        localStorage.removeItem(this.tokenKey);
    }
};

export const jumpLogin = () => {
    return '/login';
};

export function debounce(func, delay = 50) {
    let timer: any = null;
    return (...args) => {
        if (timer) {
            clearTimeout(timer);
        } else {
            func.apply(this, args);
        }
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
export const autoScroll = (id: string) => {
    const chatWrapper = document.getElementById(id);
    if (chatWrapper) {
        chatWrapper.scrollTo({ top: 999999, behavior: 'smooth' });
    }
};

export const scrollToBottom = debounce((id) => autoScroll(id), 50);

export const getNeedEventCallback = (onClick, onTouchEnd = null) => {
    if (isMobile) {
        return {
            onTouchEnd: onTouchEnd || onClick
        };
    }
    return {
        onClick: onClick || onTouchEnd
    };
};

export function getCaretElement() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
            return range.startContainer.parentNode;
        }
        return range.startContainer;
    }
    return null;
}

export const getCaretPosition = (element) => {
    if (element === null) return 0;
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(element);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        return preSelectionRange.toString().length;
    }
    return 0;
};

/**
 * Set caret position in contenteditable element
 * @param {Element} editableDiv editable div element
 * @param {number} position caret position
 */
export function setCaretPos(editableDiv, position) {
    let charIndex = 0;
    const range = document.createRange(); // create new range object
    range.setStart(editableDiv, 0); // 选择适当的节点（根据position值）

    // 遍历所有的子节点，有文本节点就直接设置，有其他元素节点就再进一步遍历其子节点
    // eslint-disable-next-line consistent-return
    function nodeSearch(node) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i];
            if (childNode.nodeType === Node.TEXT_NODE) {
                if (charIndex + childNode.length >= position) {
                    // 找到了需要设置的准确位置
                    range.setStart(childNode, position - charIndex);
                    range.collapse(true); // 折叠到起始位置
                    return true; // 返回true，表示结束搜索
                }
                charIndex += childNode.length;
            } else {
                const found = nodeSearch(childNode);
                if (found) {
                    return true;
                }
            }
        }
    }

    // 调用递归函数，探索所有的子节点
    nodeSearch(editableDiv);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
