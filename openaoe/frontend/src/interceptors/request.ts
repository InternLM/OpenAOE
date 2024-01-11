import { noAuthorizationUrl } from '@config/auth';
import { getLang, Token } from '@utils/utils';

// *Interceptor函数：主要用来在请求发出前处理config，config由axios的请求拦截器提供
// *Interceptor函数运行规则：函数会依次从左到右执行，每个*Interceptor函数必须返回config，供下一个*Interceptor函数处理
// 好处：代码结构更清晰，每个函数专注做自己的事情，拿到config处理后return，达到逻辑解耦的目的

interface IAuth {
    Authorization?: string;
}

const validateAuthInterceptor = config => {
    const auth: IAuth = {};
    const noAuthApi = noAuthorizationUrl.find(url => config.url.endsWith(url));
    // 没找到就是需要token的api
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
