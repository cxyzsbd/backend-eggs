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
  DATABASE1: 'lkys_new',
  DATABASE2: 'cloudnative',
  HOST: '42.192.189.220',
  PORT: '30306',
  USERNAME: 'root',
  PASSWORD: 'mySQL13test14',
};
const REDIS_CONFIG = {
  PORT: 31379,
  HOST: '42.192.189.220',
  PASSWORD: 'mySQL13test14',
};
// const REDIS_CONFIG = {
//   PORT: 6379,
//   HOST: '127.0.0.1',
//   PASSWORD: '',
// };

const DATA_FORWARD_URL = 'http://42.192.189.220:30530/';

// 萤石云账号和秘钥
const YS_APP_KEY = {
  appKey: '4eba082f0eaa4ca4b64409526bb3f51b',
  appSecret: 'dd2caf4f132c6d985b62f8711a633b16',
};

// 金蝶用户系统校验参数
const KINGDEE_PARAMS = {
  client_id: '', // 应用id
  client_secret: '', // 应用安全码
};

module.exports = {
  WX_GZH_CONFIG,
  WX_XCX_CONFIG,
  DB_CONFIG,
  REDIS_CONFIG,
  DATA_FORWARD_URL,
  YS_APP_KEY,
  KINGDEE_PARAMS,
};
