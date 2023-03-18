'use strict';

const body = {
  kingdeeAddUserBodyReq: {
    uid: {
      type: 'number',
      required: true,
      description: '用户uid',
    },
    username: {
      type: 'string',
      required: true,
      min: 2,
      max: 60,
      trim: true,
      example: 'username',
      description: '用户名',
    },
    email: {
      type: 'string',
      required: false,
      max: 60,
      trim: true,
      format: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
      example: '1@qq.com',
      description: '邮箱',
    },
    phone: {
      type: 'string',
      required: false,
      min: 11,
      max: 15,
      example: '18836366969',
      description: '手机号',
    },
    avatar: {
      type: 'string',
      required: false,
      trim: true,
      example: '',
      description: '头像url',
    },
    state: {
      type: 'number',
      required: false,
      example: 1,
      min: 0,
      max: 1,
      description: '状态：0.停用、1.正常',
    },
  },
};

module.exports = {
  ...body,
};
