// api base url for each environment
export const ApiBaseUrlMap = {
    development: '',
    staging: '',
    production: ''
};

// api prefix for each environment
export const ApiPrefixMap = {
    mock: '',
    development: '',
    staging: '',
    production: ''
};

export const Env = import.meta.env.VITE_NODE;

export const BaseURL = ApiBaseUrlMap[Env];

export const ApiPrefix = ApiPrefixMap[Env];
