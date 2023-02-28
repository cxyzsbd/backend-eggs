// 小程序配置
const WX_XCX_CONFIG = {
  APPID: 'wx0b37bb94242747ae',
  APP_SECRET: '18640fd56cd22b0a06cd3bc7d1c9a299',
};
const WX_GZH_CONFIG = {
  REDIS_ACCESS_TOKEN_KEY: 'WX_ACCESS_TOKEN',
  ASE_KEY: '49jWGT7w2DJM69TpfZ01mKThJGrA8CH4j6i36o8Vyye',
  WX_GZH_TOKEN: 'linhoon',
  // 消息模板
  WORK_ORDER_TEMPLATE_ID: 'MyNthiRgHIk-wT3VE5sUI2GSoGjlWDZ8_mb9dw_-eMg', // 工单提醒
  INSPECTION_TEMPLATE_ID: '_KE115iADg3kVUvCledvF-HUfGQ85mw52YgPONx0PaI', // 巡检提醒
  WORK_ORDER_APPROVER_ID: 'U-XIVmdrkTJS6sgStvArkE0xR2PJcLqrBwTBsSz13MU', // 工单审批提醒
  WORK_ORDER_APPROVER_RESULT_ID: 'pf6682uQuDBq4xFTpnAMIivcg4xAwv9Qyg8pAKP5Hoc', // 审批结果
  NEW_TASK_TEMPLATE_ID: '', // 新任务提醒
};

// 数据库配置
const DB_CONFIG = {
  DATABASE: 'lkys_new',
  HOST: '42.192.189.220',
  PORT: '30306',
  USERNAME: 'root',
  PASSWORD: 'mySQL13test14',
};
// REDIS
const REDIS_DEFAULT = {
  default: { // 默认库
    port: 31379, // Redis port
    host: '42.192.189.220', // Redis host
    password: 'mySQL13test14',
    db: 0,
  },
  io: { // websocket相关
    port: 31379, // Redis port
    host: '42.192.189.220', // Redis host
    password: 'mySQL13test14',
    db: 1,
  },
  iom: { // 运维相关
    port: 31379, // Redis port
    host: '42.192.189.220', // Redis host
    password: 'mySQL13test14',
    db: 2,
  },
  permissions: { // 所有权限
    port: 31379, // Redis port
    host: '42.192.189.220', // Redis host
    password: 'mySQL13test14',
    db: 3,
  },
  departments: { // 所有部门
    port: 31379, // Redis port
    host: '42.192.189.220', // Redis host
    password: 'mySQL13test14',
    db: 4,
  },
  attrs: {
    port: 31379, // Redis port
    host: '42.192.189.220', // Redis host
    password: 'mySQL13test14',
    db: 5,
  },
};

const DATA_FORWARD_URL = 'http://42.192.189.220:30350';

module.exports = {
  WX_GZH_CONFIG,
  WX_XCX_CONFIG,
  DB_CONFIG,
  REDIS_DEFAULT,
  DATA_FORWARD_URL,
};
