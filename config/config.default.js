/* eslint valid-jsdoc: "off" */

'use strict';
const { v4: uuidv4 } = require('uuid');
const I18n = require('i18n');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1670465853068_2903';

  // add your middleware config here
  config.middleware = [ 'jwtVerify', 'errorHandler' ];

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

  // 将部分目录挂载到app上
  config.customLoader = {
    utils: {
      directory: 'app/utils',
      inject: 'app',
    },
    enum: {
      directory: 'app/enum',
      inject: 'app',
    },
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.jwt = {
    expire: 2 * 60 * 60,
    refresh_expire: '7d',
    secret: 'FDD693602F380E24', // "lkys"MD5加密16位大
  };

  I18n.configure({
    locales: [ 'zh-CN' ],
    defaultLocale: 'zh-CN',
    directory: __dirname + '/locale',
  });

  config.validate = {
    convert: true,
    // widelyUndefined:true,
    translate() {
      const args = Array.prototype.slice.call(arguments);
      return I18n.__.apply(I18n, args);
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
