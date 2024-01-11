import React from 'react';
import { Language, getLang } from '@utils/utils';

function noop(l: Language) {
    return undefined;
}

export const LangDefault = {
    locale: getLang(),
    setLocale: noop
};

export const GlobalLangeContext = React.createContext(LangDefault);
