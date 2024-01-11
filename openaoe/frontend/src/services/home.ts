import { getHeaders } from '@services/fetch.ts';
import { IRespData, request } from '@utils/ajax.ts';

/**
 * 获取机器人回答
 * @param url 请求地址
 * @param payload 请求参数
 * @param abortSignal 取消信号
 */
export async function fetchBotAnswer(url: string, payload: any, abortSignal: AbortSignal) {
    const headers = getHeaders();
    return request<IRespData>(url, {
        method: 'POST',
        headers: { ...headers },
        data: payload,
        signal: abortSignal,
        meta: {
            isAllResponseBody: true,
        }
    });
}
