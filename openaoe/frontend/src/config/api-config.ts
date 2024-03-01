/**
 *  Description: This file is used to define basic configuration of the model API
 *  These configurations are used as default request payload for the model API.
 *  Add more models' basic API configuration here.
 */

const minimax = {
    model: 'abab5-chat',
    prompt: '',
    messages: [],
    role_meta: {
        user_name: 'USER',
        bot_name: 'BOT'
    },
    stream: true,
    type: 'json'
};

const openai = {
    model: 'gpt-3.5-turbo',
    prompt: '',
    messages: [],
    role_meta: {
        user_name: 'user',
        bot_name: 'assistant'
    },
    type: 'json'
};

const googlePalm = {
    model: 'chat-bison-001',
    prompt: {
        messages: []
    },
    temperature: 0.1,
    candidate_count: 1,
};

const claude = {
    prompt: '',
    model: 'claude-1',
    max_tokens: 5000
};
const baidu = {
    messages: [
        {
            role: 'user',
            content: 'hi'
        },
        {
            role: 'assistant',
            content: 'hi'
        },
    ],
    stream: false,
    user: 'pjlab-alles-apin',
};

const spark = {
    parameter: {
        chat: {
            temperature: 0.5,
            max_tokens: 1024,
            chat_id: 'user1'
        }
    },
    payload: {
        message: {
            text: []
        }
    }
};

const internlm = {
    model: 'internlm-chat-7b',
    prompt: '',
    messages: [],
    role_meta: {
        user_name: 'user',
        bot_name: 'assistant'
    },
    stream: true
};

const mistral = {
    model: 'mistral',
    prompt: '',
    messages: [],
    role_meta: {
        user_name: 'user',
        bot_name: 'assistant'
    },
    stream: true
};

const API_PREFIX = '';

const API = new Map();
/** Set API configuration for each provider. */
API.set('minimax', {
    url: `${API_PREFIX}/v1/minimax/v1/text/chat-stream`,
    ...minimax
});
API.set('openai', {
    url: `${API_PREFIX}/v1/openai/v1/text/chat-stream`,
    ...openai
});
API.set('google', {
    url: `${API_PREFIX}/v1/google/v1/palm/chat`,
    ...googlePalm
});
API.set('claude', {
    url: `${API_PREFIX}/v1/claude/v1/text/chat-stream`,
    ...claude
});
API.set('spark', {
    url: `${API_PREFIX}/v1/xunfei/v1/spark/chat`,
    ...spark
});
API.set('internlm', {
    url: `${API_PREFIX}/v1/internlm/v1/chat/completions`,
    ...internlm
});
API.set('mistral', {
    url: `${API_PREFIX}/v1/mistral/v1/mistral/chat`,
    ...mistral
});

export default API;
