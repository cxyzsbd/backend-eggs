// 小程序配置
const WX_XCX_CONFIG = {
  APPID: 'wx0b37bb94242747ae',
  APP_SECRET: '18640fd56cd22b0a06cd3bc7d1c9a299',
};
const WX_GZH_CONFIG = {
  REDIS_ACCESS_TOKEN_KEY: 'WX_ACCESS_TOKEN',
  ASE_KEY: '',
  WX_GZH_TOKEN: '',
  APPID: 'wx6fa6db3981713d40',
  APP_SECRET: 'b2bef9f8907200bb67648d272f7199a9',
  // 消息模板
  WORK_ORDER_TEMPLATE_ID: 'tQQ22FAxSslcOqbup7pBkvOIN6TI8tQn6lHMRY4E3eA', // 新工单提醒
  INSPECTION_TEMPLATE_ID: 'Qoe5IPhgWTzHOlRl27JsXN4FqndV8RMFYDYJq_6tcT4', // 巡检提醒
  WORK_ORDER_APPROVER_ID: 'nE9XNaJr9nV1FsaPoDz7SaXNKa4gZKELBuQZiBiV73g', // 工单审批提醒
  WORK_ORDER_APPROVER_RESULT_ID: 'X2ZlPKgzdL7mUFPc5ad_nQNkLMoFT9-Hau_5-uLYPlc', // 审批结果
  SYSTERM_ALARM_TEMPLATE_ID: '70-5tcDiCE3o7-5CUWO5N_FFtsEt_yNGRVsyMKDrU-A', // 系统报警
  NEW_TASK_TEMPLATE_ID: 'sv4whcn7CmEn-cqV2WiZV5baupWu3oMnP5to1fWZV5I', // 新任务提醒
};

// mysql
const DB_CONFIG = {
  DATABASE1: 'lkys_new',
  DATABASE2: 'cloudnative',
  HOST: process.env.LKYS_MYSQL_HOST,
  PORT: process.env.LKYS_MYSQL_PORT,
  USERNAME: process.env.LKYS_MYSQL_USERNAME,
  PASSWORD: process.env.LKYS_MYSQL_PASSWORD,
};
// redis
const REDIS_CONFIG = {
  PORT: process.env.LKYS_REDIS_PORT,
  HOST: process.env.LKYS_REDIS_URL,
  PASSWORD: process.env.LKYS_REDIS_PASSWORD,
};
const DATA_FORWARD_URL = `http://${process.env.LKYS_JAVAMQTT_HOST}:${process.env.LKYS_JAVAMQTT_PORT}/`;
const CPP_FORWARD_URL = `http://${process.env.LKYS_CALCENGINE_IP}:${process.env.LKYS_CALCENGINE_PORT}/`;
const YOUZHI_REQUEST_URL = `http://${process.env.LKYS_YOUZHI_IP}:${process.env.LKYS_YOUZHI_PORT}/`;

// const DB_CONFIG = {
//   DATABASE1: 'lkys_new',
//   DATABASE2: 'cloudnative',
//   HOST: '42.192.189.220',
//   PORT: '30306',
//   USERNAME: 'root',
//   PASSWORD: 'mySQL13test14',
// };
// const REDIS_CONFIG = {
//   PORT: 6379,
//   HOST: '127.0.0.1',
//   PASSWORD: '',
// };

// const DATA_FORWARD_URL = 'http://42.192.189.220:30530/';
// // const DATA_FORWARD_URL = 'http://192.168.20.222/';
// const CPP_FORWARD_URL = 'http://192.168.1.107:9999/';
// const YOUZHI_REQUEST_URL = 'http://124.222.168.174:28080/';

// 萤石云账号和秘钥
const YS_APP_KEY = {
  appKey: '4eba082f0eaa4ca4b64409526bb3f51b',
  appSecret: 'dd2caf4f132c6d985b62f8711a633b16',
};

module.exports = {
  WX_GZH_CONFIG,
  WX_XCX_CONFIG,
  DB_CONFIG,
  REDIS_CONFIG,
  DATA_FORWARD_URL,
  YS_APP_KEY,
  CPP_FORWARD_URL,
  YOUZHI_REQUEST_URL,
};
