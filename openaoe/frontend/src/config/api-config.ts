/**
 *  Description: This file is used to define basic configuration of the model API
 *  TODO: Add more models' basic API configuration here.
 */

/**
 *   - role_meta：optional，若填，则 user_name=用户自定义, bot_name=用户自定义
 *   - model: optional
 *     - abab5-chat（default）
 *   - messages：是一个数组，按照时间顺序从早到晚排列，send_type=USER(不可改变) 表示用户输入，send_type=BOT（不可改变） 表示模型返回。prompt：当前用户的输入
 *   - type: optional，默认“text”， 流式返回数据的格式，
 *     - text:  “data: 字符串“
 *     - json:  data: {"success": "true/false", "msg": "字符串"}，当success=false，msg=错误原因
 * */
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
/**
 * - role_meta：optional，若填，则 user_name=user / system, bot_name=assistant
 * - model: optional
 *   - gpt-3.5-turbo（default）
 *   - gpt-3.5-turbo-0301
 * - messages：是一个数组，按照时间顺序从早到晚排列，send_type=user表示用户输入，send_type=bot表示模型返回。messages数组的数据来自于返回body的data.choices[0].message + 用户输入的prompt
 * - prompt：当前用户的输入
 * - type: optional，默认“text”， 流式返回数据的格式，
 *    - text:  “data: 字符串“
 *    - json:  data: {"success": "true/false", "msg": "字符串"}，当success=false，msg=错误原因
 * */
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
/**
 * - model-选填: chat-bison-001（default）
 * - prompt-必填： 用户输入词（必填，模型不支持中文prompt，如需中文支持，可使用3.5.1 baidu translate 转换成英文后再次调用）
 *   - messages：是一个列表，支持上下文
 *     - content：交互的文本
 *     - author：用户方默认是0（可自定义），大模型方是1
 * - temperature：范围 [0.0, 1.0]，默认 0.1（越高模型返回的文本越随机）
 * - candidate_count: 范围 [1, 8]，默认 1，  每次大模型返回的文本个数（针对单次用户的prompt）
 * */
const googlePalm = {
    model: 'chat-bison-001',
    prompt: {
        messages: []
    },
    temperature: 0.1,
    candidate_count: 1,
};
/**
 * - prompt: prompt
 * - model(Optional): 使用模型，枚举字符串
 *   - claude-1 (default)
 *   - claude-1-100k
 *   - claude-instant-1
 *   - claude-instance-1-100k
 *   - claude-1.3
 *   - claude-1.3-100k
 *   - claude-1.0
 *   - claude-instant-1.1-100k
 *   - claude-instant-1.0
 * - max_tokens(Optional): 整型，返回的tokens最大长度，默认为300
 * - temperature(Optional): 浮点数（取值范围：0-1.0），表示随机度，默认为1，越接近1返回越随机
 * */
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
/** - parameter
 *   - chat
 *     - temperature(optional)  取值为[0,1],默认为0.5. 核采样阈值。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高
 *     - max_tokens(optional) 取值为[1,4096]，默认为2048. 模型回答的tokens的最大长度
 *     - chat_id(optional) 用于关联用户会话
 * - payload
 *   - message
 *     - []text
 *       - role 枚举字符串
 *         - user 表示是用户的问题
 *         - assistant 表示AI的回复
 *       - content 所有content的累计tokens需控制8192以内，用户和AI的对话内容
 * */
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

const API_PREFIX = '/gw/alles-apin-hub';

const API = new Map();
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

export default API;
