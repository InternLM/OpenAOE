import { getHeaders } from '@services/fetch.ts';
import { IRespData, request } from '@utils/ajax.ts';

/**
 * Get bot answer
 * @param url
 * @param payload
 * @param abortSignal
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
