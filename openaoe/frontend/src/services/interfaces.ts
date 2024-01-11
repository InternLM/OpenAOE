import { ChatSession } from '@/store/chat.ts';

export interface ShareInfo {
    name: string;
    description: string;
    tags: string[];
    sessions: ChatSession[];
    userName: string;
    createTime: number;
}

export interface GenerateShareReqDto {
    questionId: string,
    name: string,
    description:string,
    tags: string[],
    sessions: ChatSession[],
    ttl: number
}

export interface GenerateShareRespDto {
    shareId: string
}

export interface CreateQuestionReqDto {
    name: string,
    description: string,
    tags: string[],
}

export interface QuestionListReqDto {
    keyword: string,
    pageNum: number,
    pageSize: number
}

export interface QuestionAnswerRespDto {
    id: string,
    title: string,
    description: string,
    tags: string[],
    uname: string,
    voteCount: number,
    answerCount: number,
    createTime: number,
    answers: Record<string, any>[];
}
