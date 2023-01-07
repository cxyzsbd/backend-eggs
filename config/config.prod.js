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

  config.sequelize = {
    datasources: [
      {
        dialect: 'mysql',
        timezone: '+08:00',
        database: 'lkys_new',
        host: '192.168.1.118',
        port: '3306',
        username: 'root',
        password: 'lkys@401A',
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
    clients: {
      default: { // 默认库
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        password: '',
        db: 0,
      },
      io: { // websocket相关
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        password: '',
        db: 1,
      },
      iom: { // 运维相关
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        password: '',
        db: 2,
      },
      permissions: { // 所有权限
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        password: '',
        db: 3,
      },
      departments: { // 所有部门
        port: 6379, // Redis port
        host: '127.0.0.1', // Redis host
        password: '',
        db: 4,
      },
    },
  };

  // 数据转发基础路径
  config.dataForwardBaseUrl = '';

  return {
    ...config,
  };
};
