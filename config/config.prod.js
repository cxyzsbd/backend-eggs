/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');
const {
  DB_CONFIG,
  REDIS_DEFAULT,
  DATA_FORWARD_URL,
} = require('../global.config');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  config.logger = {
    level: 'WARN', // 避免记录数据库执行语句
    dir: path.join(__dirname, '../../logs'),
  };


  config.security = {
    csrf: {
      enable: false,
      ignore: ctx => ctx.app.config.security.domainWhiteList.includes(ctx.ip),
    },
    domainWhiteList: [ '127.0.0.1' ],
  };

  config.sequelize = {
    datasources: [
      {
        delegate: 'model',
        baseDir: 'model/model',
        dialect: 'mysql',
        timezone: '+08:00',
        database: DB_CONFIG.DATABASE,
        host: DB_CONFIG.HOST,
        port: DB_CONFIG.PORT,
        username: DB_CONFIG.USERNAME,
        password: DB_CONFIG.PASSWORD,
        app: true,
        define: {
          underscored: false, // 注意需要加上这个， egg-sequelize只是简单的使用Object.assign对配置和默认配置做了merge, 如果不加这个 update_at会被转变成 updateAt故报错
          // 禁止修改表名，默认情况下，sequelize将自动将所有传递的模型名称（define的第一个参数）转换为复数
          // 但是为了安全着想，复数的转换可能会发生变化，所以禁止该行为
          freezeTableName: true,
          timestamps: false,
        },
      },
      {
        delegate: 'models',
        baseDir: 'model/models',
        dialect: 'mysql',
        timezone: '+08:00',
        database: DB_CONFIG.DATABASE,
        host: DB_CONFIG.HOST,
        port: DB_CONFIG.PORT,
        username: DB_CONFIG.USERNAME,
        password: DB_CONFIG.PASSWORD,
        app: true,
        define: {
          underscored: false, // 注意需要加上这个， egg-sequelize只是简单的使用Object.assign对配置和默认配置做了merge, 如果不加这个 update_at会被转变成 updateAt故报错
          // 禁止修改表名，默认情况下，sequelize将自动将所有传递的模型名称（define的第一个参数）转换为复数
          // 但是为了安全着想，复数的转换可能会发生变化，所以禁止该行为
          freezeTableName: true,
          timestamps: false,
        },
      },
    ],
  };

  config.redis = {
    clients: REDIS_DEFAULT,
    agent: true,
  };

  // 数据转发基础路径
  config.dataForwardBaseUrl = DATA_FORWARD_URL;

  return {
    ...config,
  };
};
