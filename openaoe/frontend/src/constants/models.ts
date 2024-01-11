import { BotState } from '@/store/bot.ts';
import minimax from '@/assets/imgs/minimax.png';
import openai from '@/assets/imgs/openai.svg';
import google from '@/assets/imgs/google-palm.webp';
import claude from '@/assets/imgs/claude.svg';
import admin from '@/assets/imgs/A.svg';
import spark from '@/assets/imgs/spark.svg';
import internlm from '@/assets/imgs/internlm.svg'

export const CLEAR_CONTEXT = 'clear_context';
export const NON_BOT = ['user', 'admin', CLEAR_CONTEXT];
export const SERIAL_MODE = 'serial';
export const PARALLEL_MODE = 'parallel';
export const SERIAL_SESSION = 'serial_session';
export const PARALLEL_MODEL_MAX = 3;
export const DEFAULT_BOT = 'gpt-3.5-turbo';
export const BASE_IMG_URL = 'https://oss.openmmlab.com/alles-bot/';
export const STREAM_BOT = ['openai', 'minimax', 'claude', 'gpt-4', 'internlm'];
export interface ModelState {
    name: string;
    model: string;
    avatar: string;
    background: string;
}
// 所有模型信息
// TODO read from config files
export const ALL_MODELS: BotState[] = [
    {
        provider: 'internlm',
        model: 'internlm-chat-7b',
        avatar: internlm,
        border: 'rgba(1,52,220,0.85)',
        background: 'linear-gradient(180deg, rgba(34,76,220,0.85) 0%, #0134DCD8 100%)',
    },
    {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        avatar: openai,
        border: '#1a8d15',
        background: 'linear-gradient(180deg, rgba(156, 206, 116, 0.15) 0%, #1a8d15 100%)',
    },
    {
        provider: 'openai',
        model: 'gpt-4',
        avatar: openai,
        border: '#4dd547',
        background: 'linear-gradient(180deg, rgba(156, 206, 116, 0.15) 0%, #08be00 100%)',
    },
    {
        provider: 'claude',
        model: 'claude-1',
        avatar: claude,
        border: '#8550ca',
        background: 'linear-gradient(180deg, rgba(141, 90, 181, 0.15) 0%, rgba(106, 39, 123, 0.7) 53.12%, #663E9A 100%)',
    },
    {
        provider: 'claude',
        model: 'claude-1-100k',
        avatar: claude,
        border: '#8550ca',
        background: 'linear-gradient(180deg, rgba(141, 90, 181, 0.15) 0%, rgba(106, 39, 123, 0.7) 53.12%, #663E9A 100%)',
    },
    {
        provider: 'google',
        model: 'chat-bison-001',
        avatar: google,
        border: '#ff85c7',
        background: 'linear-gradient(180deg, rgba(181, 90, 90, 0.15) 0%, #fa5ab1 100%)',
    },
    {
        provider: 'minimax',
        model: 'abab5-chat',
        avatar: minimax,
        border: '#be1313',
        background: 'linear-gradient(180deg, rgba(207, 72, 72, 0.15) 0%, rgba(151, 43, 43, 0.7) 53.12%, #742828 100%)',
    },
    // {
    //     provider: 'baidu',
    //     model: [''],
    //     avatar: baidu,
    //     border: '#4e6ef2',
    //     background: 'linear-gradient(180deg, rgba(39, 83, 123, 0.15) 0%, #2548df 100%)',
    // },
    {
        provider: 'spark',
        model: '',
        avatar: spark,
        border: '#6fa2db',
        background: 'linear-gradient(180deg, rgba(72, 72, 207, 0.15) 0%, #7498be 100%)',
    },
    {
        provider: 'admin',
        model: 'admin',
        avatar: admin,
        border: '#4e6ef2',
        background: 'linear-gradient(rgb(255 255 255 / 80%) 0%, rgb(168 245 179) 100%)',
    },
    {
        provider: 'user',
        model: 'user',
        avatar: 'user.png',
        border: '#71e875',
        background: '#71e875',
    },
];
