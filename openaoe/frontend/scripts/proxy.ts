// docs: https://github.com/http-party/node-http-proxy#options
const ProxyConfig = {
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
