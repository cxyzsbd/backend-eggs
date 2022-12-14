/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1670465853068_2903';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 项目启动端口号
  config.cluster = {
    listen: {
      path: '',
      port: 3000,
    },
  };

  config.swaggerdoc = {
    basePath: '/',
    dirScanner: './app/controller',
    apiInfo: {
      title: 'lkys doc',
      description: 'lkys 接口文档',
      version: '1.9.0',
    },
    schemes: [ 'http' ],
    enable: true,
    routerMap: false,
    securityDefinitions: {
      apikey: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
      oauth2: {
        type: 'oauth2',
        tokenUrl: 'http://127.0.0.1:3000/api/v1/users/login',
        flow: 'password',
        scopes: {
          'write:access_token': 'write access_token',
          'read:access_token': 'read access_token',
        },
      },
    },
    enableSecurity: true,
  };

  return {
    ...config,
    ...userConfig,
  };
};
