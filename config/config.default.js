/* eslint valid-jsdoc: "off" */

'use strict';
const { v4: uuidv4 } = require('uuid');
const I18n = require('i18n');
const {
  REDIS_CONFIG,
  DB_CONFIG,
  DATA_FORWARD_URL,
  CPP_FORWARD_URL,
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

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1670465853068_2903';

  // add your middleware config here
  config.middleware = [ 'jwtVerify', 'auth', 'validateSuperUser', 'operationRecords', 'errorHandler' ];
  // 只对 /api/v1 前缀的 url 路径生效
  config.errorHandler = {
    ignore: [
      '/doc',
      '/swagger*',
      '/api/v1/visual-shares/*/details',
      '/api/v1/visual-shares/*/configs',
      '/api/v1/visual-shares/*/data',
    ],
  };
  config.jwtVerify = {
    ignore: [
      '/api/v1/users/login',
      '/api/v1/users/refresh-token',
      '/doc',
      '/swagger*',
      '/api/v1/wx-mini/login',
      '/api/v1/wx-mini/bind',
      '/api/v1/alarms',
      '/api/v1/kingdee/validate-user',
      '/api/v1/visual-shares/*/details',
      '/api/v1/visual-shares/*/configs',
      '/api/v1/visual-shares/*/data',
    ],
  };
  config.auth = {
    ignore: [
      '/doc',
      '/swagger*',
      '/api/v1/visual-shares/*/details',
      '/api/v1/visual-shares/*/configs',
      '/api/v1/visual-shares/*/data',
    ],
  };
  config.validateSuperUser = {
    match: '/api/v1/super-user',
  };
  config.operationRecords = {
    ignore: [
      '/doc',
      '/swagger*',
      '/api/v1/cpp-forward/showtask',
      '/api/v1/visual-shares/*/details',
      '/api/v1/visual-shares/*/configs',
      '/api/v1/visual-shares/*/data',
    ],
  };

  // 项目启动端口号
  config.cluster = {
    listen: {
      path: '',
      port: 3000,
    },
  };

  config.swaggerdoc = {
    basePath: '/api/v1/',
    dirScanner: './app/controller',
    apiInfo: {
      title: 'lkys doc',
      description: '每个列表接口都支持prop_order和order参数方便自定义字段排序，例如按时间倒序排序可以传prop_order=create_at;order=DESC即可',
      version: '2.0.0',
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
  config.signSecret = 'FDD693602F380E24';

  config.redis = {
    clients: {
      default: { // 默认库
        port: REDIS_CONFIG.PORT, // Redis port
        host: REDIS_CONFIG.HOST, // Redis host
        password: REDIS_CONFIG.PASSWORD,
        db: 9,
      },
      io: { // websocket相关
        port: REDIS_CONFIG.PORT, // Redis port
        host: REDIS_CONFIG.HOST, // Redis host
        password: REDIS_CONFIG.PASSWORD,
        db: 1,
      },
      iom: { // 运维相关
        port: REDIS_CONFIG.PORT, // Redis port
        host: REDIS_CONFIG.HOST, // Redis host
        password: REDIS_CONFIG.PASSWORD,
        db: 2,
      },
      permissions: { // 所有权限
        port: REDIS_CONFIG.PORT, // Redis port
        host: REDIS_CONFIG.HOST, // Redis host
        password: REDIS_CONFIG.PASSWORD,
        db: 3,
      },
      departments: { // 所有部门
        port: REDIS_CONFIG.PORT, // Redis port
        host: REDIS_CONFIG.HOST, // Redis host
        password: REDIS_CONFIG.PASSWORD,
        db: 4,
      },
      attrs: {
        port: REDIS_CONFIG.PORT, // Redis port
        host: REDIS_CONFIG.HOST, // Redis host
        password: REDIS_CONFIG.PASSWORD,
        db: 5,
      },
      camera_photos: {
        port: REDIS_CONFIG.PORT, // Redis port
        host: REDIS_CONFIG.HOST, // Redis host
        password: REDIS_CONFIG.PASSWORD,
        db: 6,
      },
      companys: {
        port: REDIS_CONFIG.PORT, // Redis port
        host: REDIS_CONFIG.HOST, // Redis host
        password: REDIS_CONFIG.PASSWORD,
        db: 7,
      },
      common: {
        port: REDIS_CONFIG.PORT, // Redis port
        host: REDIS_CONFIG.HOST, // Redis host
        password: REDIS_CONFIG.PASSWORD,
        db: 8,
      },
    },
    agent: true,
  };

  // socket.io
  exports.io = {
    init: {}, // passed to engine.io
    namespace: {
      '/': {
        connectionMiddleware: [ 'connection' ],
        packetMiddleware: [ 'packet' ],
      },
    },
    redis: { // websocket相关
      port: REDIS_CONFIG.PORT, // Redis port
      host: REDIS_CONFIG.HOST, // Redis host
      password: REDIS_CONFIG.PASSWORD,
      db: 1,
    },
  };

  config.sequelize = {
    datasources: [
      {
        delegate: 'model',
        baseDir: 'model/model',
        dialect: 'mysql',
        timezone: '+08:00',
        database: DB_CONFIG.DATABASE1,
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
        database: DB_CONFIG.DATABASE2,
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

  // 数据转发基础路径
  config.dataForwardBaseUrl = DATA_FORWARD_URL;
  config.cppForwardBaseUrl = CPP_FORWARD_URL;

  // 是否金蝶平台
  config.isKingdee = true;

  config.multipart = {
    fileSize: '50mb', // 文件大小限制
    fileExtensions: [ '.doc', '.xls', '.docx', '.json', '.png', 'jpg', '.jpeg', '.rar', '.zip', '.txt', '.pdf', '.gif' ], // 上传文件类型扩展
  };

  config.bodyParser = {
    formLimit: '30mb',
    jsonLimit: '30mb',
    textLimit: '30mb',
    enable: true,
    encoding: 'utf8',
    strict: true,
    queryString: {
      arrayLimit: 100,
      depth: 5,
      parameterLimit: 1000,
    },
    enableTypes: [ 'json', 'form', 'text' ],
    extendTypes: {
      text: [ 'text/xml', 'application/xml' ],
    },
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    socketOnlineUserRoomName: 'SOCKET_ONLINE_ROOM', // 所有用户在线房间
    socketDepartmentRoomNamePrefix: 'SOCKET_DEPARTMENT_ROOM_', // 部门房间前缀
    socketCompanyRoomNamePrefix: 'SOCKET_COMPANY_ROOM_', // 公司房间前缀
    socketCompanyAdminPrefix: 'SOCKET_COMPANY_ADMIN_ROOM_', // 公司管理员房间前缀
    socketUserPrefix: 'SOCKET_USER_ROOM_', // 单个用户房间
    IORedisUserKeyPrefix: 'SOCKET_USER_', // redis存用户socketId前缀
    ALARM_PUSH_EVENT_NAME: 'alarms', // 报警推送事件名
  };

  return {
    ...config,
    ...userConfig,
  };
};
