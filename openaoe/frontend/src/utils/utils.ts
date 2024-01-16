import jsCookie from 'js-cookie';
import { isMobile } from 'sea-lion-ui';

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

export const removeCookie = (cookieName: string) => {
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
        const _cookieName = cookies[i].split('=')[0].trim();

        if (_cookieName === cookieName) {
            const exp = new Date();
            exp.setTime(exp.getTime() - 60);
            document.cookie = `${cookies[i]};expires=${exp.toUTCString()};path=/;domain=${import.meta.env.VITE_COOKIE_DOMAIN}`;

            break;
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
    range.setStart(editableDiv, 0);

    // Traverse all child nodes. If there is a text node, set it directly.
    // If there are other element nodes, then further traverse its child nodes.
    // eslint-disable-next-line consistent-return
    function nodeSearch(node) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i];
            if (childNode.nodeType === Node.TEXT_NODE) {
                if (charIndex + childNode.length >= position) {
                    range.setStart(childNode, position - charIndex);
                    range.collapse(true);
                    return true;
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

    // Call the function to explore all child nodes
    nodeSearch(editableDiv);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
