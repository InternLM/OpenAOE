import { noAuthorizationUrl } from '@config/auth';
import { getLang, Token } from '@utils/utils';

/**
 * {Interceptor}: mainly used to process config before the request is issued. `config` is provided by the request interceptor of `axios`
 * Operation rules: The function will be executed from left to right in sequence. Each *Interceptor function must return config for the next *Interceptor function to process.
 * Benefits: The code structure is clearer, each function focuses on doing its own thing, and returns after processing the config, achieving the purpose of logical decoupling.
*/
interface IAuth {
    Authorization?: string;
}

const validateAuthInterceptor = config => {
    const auth: IAuth = {};
    const noAuthApi = noAuthorizationUrl.find(url => config.url.endsWith(url));
    // need authorization if not in the whitelist
    if (!noAuthApi) {
        const token = Token.get();
        if (token) {
            // auth.Authorization = `Bearer ${token}`;
        }
    }

    return {
        ...config,
        headers: {
            lang: getLang(),
            ...config.headers,
            ...auth
        }
    };
};

const customConfigInterceptor = config => {
    return ({
        ...config,
        headers: {
            ...config.headers,
            'Client-Type': 'app',
            type: 0
        }
    });
};

export const requestInterceptors = [validateAuthInterceptor, customConfigInterceptor];
