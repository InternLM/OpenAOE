import {
    CreateQuestionReqDto, GenerateShareReqDto, QuestionAnswerRespDto, QuestionListReqDto, ShareInfo
} from '@services/interfaces.ts';
import { IRespData, request } from '@utils/ajax.ts';
import { getHeaders } from '@services/fetch.ts';

export async function generateShare(data: GenerateShareReqDto) {
    return request<IRespData>('/api/v1/share/generate', {
        method: 'POST',
        headers: getHeaders(),
        data,
        meta: {
            isAllResponseBody: true,
        }
    }, '/gw/openaoe-be');
}

export async function getShareInfo(shareId: string) {
    return request<ShareInfo>('/api/v1/share/get', {
        method: 'POST',
        headers: getHeaders(),
        data: {
            shareId
        }
    }, '/gw/openaoe-be');
}

export async function getShareList(keyword: string) {
    return request<ShareInfo>('/api/v1/share/search', {
        method: 'POST',
        headers: getHeaders(),
        data: {
            keyword
        }
    }, '/gw/openaoe-be');
}

export async function createQuestion(data: CreateQuestionReqDto) {
    return request<IRespData>('/api/v1/question/add', {
        method: 'POST',
        headers: getHeaders(),
        data,
        meta: {
            isAllResponseBody: true,
        }
    }, '/gw/openaoe-be');
}

export async function getQuestionList(data: QuestionListReqDto) {
    return request<IRespData>('/api/v1/question/search', {
        method: 'POST',
        headers: getHeaders(),
        data,
    }, '/gw/openaoe-be');
}

export async function getQuestionAnswer(questionId: string) {
    return request<QuestionAnswerRespDto>('/api/v1/question/answers', {
        method: 'POST',
        headers: getHeaders(),
        data: {
            questionId
        },
    }, '/gw/openaoe-be');
}
