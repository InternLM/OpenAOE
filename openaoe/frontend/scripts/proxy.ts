// https://github.com/http-party/node-http-proxy#options
const ProxyConfig = {
    '/mock': {
        target: 'http://localhost:3000',
        pathRewrite: {
            '^/mock': ''
        },
        secure: false // 开启https
    },
    '/gw/openaoe-be': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: true,
        rewrite: path => {
            return path.replace('^', '');
        },
    },
};

export default ProxyConfig;
