const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    devServer: {
        // proxy: 'http://127.0.0.1:8000',
        proxy: {
            '/api': {
                target: 'http://platform.gamingsea.top',
                // changeOrigin: true,
                // pathRewrite: {
                //     '^/api': ''
                // }
            }
        }
    },
    // 修改网页标题
    chainWebpack: config => {
        config.plugin('html').tap(args => {
            args[0].title = '邮件助手';
            return args;
        });
    },
})
