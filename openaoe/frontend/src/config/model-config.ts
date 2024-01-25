import admin from '@assets/imgs/A.svg';

export const USER_INFO = {
    provider: 'user',
    model: 'user',
    avatar: 'user.png',
    border: '#71e875',
    background: '#71e875',
};

export const ADMIN_INFO = {
    provider: 'admin',
    model: 'admin',
    avatar: admin,
    border: '#4e6ef2',
    background: 'linear-gradient(rgb(255 255 255 / 80%) 0%, rgb(168 245 179) 100%)',
};

export const models = {
    'internlm-chat-7b': {
        provider: 'internlm',
        avatar: 'https://oss.openmmlab.com/frontend/OpenAOE/internlm.svg',
        background: 'linear-gradient(rgb(3 26 108 / 85%) 0%, rgb(29 60 161 / 85%) 100%)',
    },
    'gpt-3.5-turbo': {
        provider: 'openai',
        avatar: 'https://oss.openmmlab.com/frontend/OpenAOE/openai.svg',
        background: 'linear-gradient(180deg, rgba(156, 206, 116, 0.15) 0%, #1a8d15 100%)',
    },
    'gpt-4': {
        provider: 'openai',
        avatar: 'https://oss.openmmlab.com/frontend/OpenAOE/openai.svg',
        background: 'linear-gradient(180deg, rgba(156, 206, 116, 0.15) 0%, #08be00 100%)',
    },
    'claude-1': {
        provider: 'claude',
        avatar: 'https://oss.openmmlab.com/frontend/OpenAOE/claude.svg',
        background: 'linear-gradient(180deg, rgba(141, 90, 181, 0.15) 0%, rgba(106, 39, 123, 0.7) 53.12%, #663E9A 100%)',
    },
    'claude-1-100k': {
        provider: 'claude',
        avatar: 'https://oss.openmmlab.com/frontend/OpenAOE/claude.svg',
        background: 'linear-gradient(180deg, rgba(141, 90, 181, 0.15) 0%, rgba(106, 39, 123, 0.7) 53.12%, #663E9A 100%)',
    },
    'chat-bison-001': {
        provider: 'google',
        avatar: 'https://oss.openmmlab.com/frontend/OpenAOE/google-palm.webp',
        isStream: false,
        background: 'linear-gradient(180deg, rgba(181, 90, 90, 0.15) 0%, #fa5ab1 100%)',
    },
    'abab5-chat': {
        provider: 'minimax',
        avatar: 'https://oss.openmmlab.com/frontend/OpenAOE/minimax.png',
        background: 'linear-gradient(180deg, rgba(207, 72, 72, 0.15) 0%, rgba(151, 43, 43, 0.7) 53.12%, #742828 100%)',
    },
    spark: {
        provider: 'spark',
        avatar: 'https://oss.openmmlab.com/frontend/OpenAOE/spark.svg',
        isStream: false,
        background: 'linear-gradient(180deg, rgba(72, 72, 207, 0.15) 0%, #7498be 100%)',
    },
};
