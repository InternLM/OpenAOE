import React, { useCallback, useState, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import {
    getLang, Language, setLang
} from '@utils/utils';
import locales from '@/locales';
import { GlobalLangeContext } from './global-lang-context';

const GlobalLang: React.FC<any> = ({ children }) => {
    const [locale, setLocale] = useState<Language>(getLang());

    const setCurrentLocale = useCallback((lang: Language) => {
        setLocale(lang);
        setLang(lang);
    }, []);

    const value = useMemo(() => ({ locale, setLocale: setCurrentLocale }), [locale, setCurrentLocale]);

    return (
        <IntlProvider locale={locale} messages={locales[locale]}>
            <GlobalLangeContext.Provider value={value}>
                {children}
            </GlobalLangeContext.Provider>
        </IntlProvider>
    );
};

export default GlobalLang;
