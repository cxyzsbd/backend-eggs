'use strict';

const body = {
  wxLoginCodeReq: {
    code: { type: 'string', required: true, description: 'jscode' },
  },
  userLoginBodyReq: {
    username: {
      type: 'string',
      required: true,
      min: 2,
      max: 60,
      trim: true,
      example: 'username',
      description: '用户名',
    },
    password: {
      type: 'string',
      required: true,
      max: 64,
      trim: true,
      example: 'password',
      description: '用户密码',
    }
  }
};

module.exports = {
  ...body,
  wxBindBodyReq: {
    ...body.wxLoginCodeReq,
    ...body.userLoginBodyReq
  }
};
