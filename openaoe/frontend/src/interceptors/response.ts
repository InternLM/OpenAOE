import { message } from 'sea-lion-ui';
import {
    Token, jumpLogin, getLang
} from '@utils/utils';

export const handleUnauth = () => {
    // Remove token when not authorized
    Token.removeAll();
};

const formatResponseData = response => {
    const resp = response.data;
    const meta = response.__meta;
    const isAllResponseBody = meta.isAllResponseBody;
    if (isAllResponseBody) {
        return resp;
    }
    return resp.data;
};

const handleErrorAlert = response => {
    const resp = response.data;
    const meta = response.__meta;
    const notIgnoreError = !meta.isIgnoreError;
    if (resp.success === false && notIgnoreError) {
        message.error(resp.msg);
    }
    return response;
};

const validateAuth = response => {
    const resp = response.data;
    if (resp && resp.msgCode === 'A0202') {
        handleUnauth();
    }
    return response;
};

const validateInvitation = response => {
    const resp = response.data;
    if (resp && resp.msgCode === 'C1600') {
        window.location.href = jumpLogin();
    }
    return response;
};

const showErrorMessage = (text, ignore = false) => {
    if (!ignore) {
        message.error(text);
    }
};

const handleErrorData = (error) => {
    if (error.response) {
        const meta = error.__meta;
        const ignore = meta.isIgnoreGatewayError;

        const code = error.response.status;
        console.log(error.code, 'error.....');
        switch (code) {
        case 401:
        case 403:
            handleUnauth();
            break;
        case 500:
            showErrorMessage(getLang() === 'zh-CN' ? '服务器没有响应，请稍后再试' : 'Sever error, please try again later.', ignore);
            break;
        default:
            if (error.code === 'ERR_NETWORK') {
                showErrorMessage(getLang() === 'zh-CN' ? '网络出错了，请稍后再试' : 'Network error, please try again later.', ignore);
            } else {
                showErrorMessage(`${code}: ${error.message || 'unknown error'}`, ignore);
            }
        }
    }
    // 可能是取消接口请求
    return Promise.reject(error);
};

export const responsetInterceptors = [validateAuth, validateInvitation, handleErrorAlert, formatResponseData];

export const responsetErrorInterceptors = [handleErrorData];
