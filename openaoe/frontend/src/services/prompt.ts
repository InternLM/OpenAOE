import { getHeaders } from '@services/fetch.ts';
import { IRespData, request } from '@utils/ajax.ts';

export async function createCustomPrompt(name: string, content: string) {
    const headers = getHeaders();
    return request<IRespData>('/api/v1/setting/createCustomPrompt', {
        method: 'POST',
        headers: {
            ...headers,
        },
        data: {
            name,
            content
        }
    }, '/gw/openaoe-be');
}

export async function listCustomPrompt() {
    const headers = getHeaders();
    return request<IRespData>('/api/v1/setting/listCustomPrompt', {
        method: 'GET',
        headers: {
            ...headers,
        },
    }, '/gw/openaoe-be');
}

export async function deleteCustomPrompt(id: string) {
    const headers = getHeaders();
    return request<IRespData>('/api/v1/setting/deleteCustomPrompt', {
        method: 'POST',
        headers: {
            ...headers,
        },
        data: {
            id: id.toString()
        },
        meta: {
            isAllResponseBody: true
        }
    }, '/gw/openaoe-be');
}
