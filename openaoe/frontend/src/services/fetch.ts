import API from '@constants/api.ts';
import { DEFAULT_BOT } from '@constants/models.ts';

export const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
    };
};
export const getUrl = (provider) => {
    return API.get(provider)?.url || API.get(DEFAULT_BOT).url;
};
export const getPayload = (provider: string, model: string, prompt: string, messages: { text: string; sender_type: string; }[]) => {
    const payload = { ...API.get(provider) || API.get(DEFAULT_BOT) };
    delete payload.url;
    payload.model = model;
    if (provider === 'openai') {
        payload.prompt = prompt;
        payload.messages = messages;
    }
    if (provider === 'internlm') {
        payload.prompt = prompt;
        payload.messages = messages;
    }
    if (provider === 'gpt-4') {
        payload.prompt = prompt;
        payload.messages = messages;
    }
    if (provider === 'minimax') {
        payload.prompt = prompt;
        payload.messages = messages.map((item) => {
            return {
                text: item.text,
                sender_type: item.sender_type === 'user' ? 'USER' : 'BOT',
            };
        });
        payload.messages.push({
            text: prompt,
            sender_type: 'USER',
        });
    }
    if (provider === 'google') {
        // FIXME: Messages must alternate between authors.
        const defaultMessage = {
            content: 'Hi! How can I help you today?',
            author: '1'
        };
        const formatMessage = messages.map((item) => {
            return {
                content: item.text,
                author: item.sender_type === 'user' ? '0' : '1',
            };
        });
        formatMessage.push({
            content: prompt,
            author: '0',
        });
        formatMessage.unshift(defaultMessage);
        payload.prompt.messages = formatMessage;
    }
    if (provider === 'baidu' || provider === 'claude') {
        const formatMessage = messages.map((item) => {
            return {
                role: item.sender_type,
                content: item.text,
            };
        });
        formatMessage.push({
            role: 'user',
            content: prompt,
        });
        payload.messages = formatMessage;
    }
    if (provider === 'spark') {
        const formatMessage = messages.map((item) => {
            return {
                role: item.sender_type,
                content: item.text,
            };
        });
        formatMessage.push({
            role: 'user',
            content: prompt,
        });
        payload.payload.message.text = formatMessage;
    }
    return payload;
};
