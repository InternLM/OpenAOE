import axios from 'axios';
import qs from 'qs';
import { BaseURL, ApiPrefix } from '@config/base-url';
import { requestInterceptors } from '@interceptors/request';
import { responsetInterceptors, responsetErrorInterceptors } from '@interceptors/response';
import { compose } from '@utils/utils';

export const instance = axios.create({
    method: 'get',
    timeout: 60000,
    responseType: 'json',
    paramsSerializer: params => qs.stringify(params, { indices: false })
});

export interface IMeta {
    isAllResponseBody?: boolean;
    isIgnoreError?: boolean;
    isIgnoreGatewayError?: boolean;
}

export interface IRespData {
    data: any;
    msg: string;
    msgCode: string;
}

const MetaDataMap = new Map();

const inBuildHandleMetaResponseInterceptors = (response) => {
    let meta = {};
    if (MetaDataMap.has(response.config.url)) {
        meta = MetaDataMap.get(response.config.url);
        MetaDataMap.delete(response.config.url);
    }
    return {
        ...response,
        __meta: meta
    };
};

const inBuildHandleMetaResponseErrorInterceptors = error => {
    let meta = {};
    if (MetaDataMap.has(error.config.url)) {
        meta = MetaDataMap.get(error.config.url);
        MetaDataMap.delete(error.config.url);
    }
    return {
        ...error,
        __meta: meta
    };
};

responsetInterceptors.unshift(inBuildHandleMetaResponseInterceptors);
responsetErrorInterceptors.unshift(inBuildHandleMetaResponseErrorInterceptors);

const handleRequestInterceptors = compose(...requestInterceptors);
const handleResponsetInterceptors = compose(...responsetInterceptors);
const handleResponsetErrorInterceptors = compose(...responsetErrorInterceptors);

instance.interceptors.request.use(
    handleRequestInterceptors,
    err => (Promise.reject(err))
);

instance.interceptors.response.use(handleResponsetInterceptors, handleResponsetErrorInterceptors);

export const ajax = (api, {
    method = 'GET',
    params = {}, // url query参数
    data = {}, // http body 参数
    ...rest
}): Promise<any> => {
    const url = `${BaseURL}${api}`;

    switch (method.toLowerCase()) {
    case 'get':
        return instance.get(url, { params, ...rest });
    case 'delete':
        return instance.delete(url, { params, data, ...rest });
    case 'post':
        return instance.post(url, data, { params, ...rest });
    case 'put':
        return instance.put(url, data, { params, ...rest });
    default:
        return Promise.resolve({
            then: resolve => resolve({
                msgCode: '300',
                msg: 'Method Not Allowed',
                traceId: '-1',
                total: 0,
                status: 405,
                data: {}
            })
        });
    }
};

export const request = <T = any>(api: string, options: any = {}, prefix = ApiPrefix): Promise<T> => {
    const needPrefix = prefix;
    const fullApi = (`${needPrefix}/${api}`).replace(/\/\//g, '/');
    if (options.meta) {
        MetaDataMap.set(fullApi, options.meta);
        delete options.meta;
    }
    return ajax(fullApi, options);
};

export default ajax;
