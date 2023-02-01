'use strict';

const body = {
  userId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  updatePasswordBody: {
    new_password: {
      type: 'string',
      required: true,
      description: '新密码',
    },
    old_password: {
      type: 'string',
      required: true,
      description: '老密码',
    },
  },
  updatePersonInfoBody: {
    username: {
      type: 'string',
      required: false,
      min: 2,
      max: 60,
      trim: true,
      example: 'Imfdj',
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
  },
  userBodyReq: {
    username: {
      type: 'string',
      required: true,
      min: 2,
      max: 60,
      trim: true,
      example: 'Imfdj',
      description: '用户名',
    },
    password: {
      type: 'string',
      required: true,
      max: 64,
      trim: true,
      example: '123123',
      description: '用户密码',
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
    department_id: {
      type: 'number',
      required: false,
      description: '部门id',
    },
    company_id: {
      type: 'number',
      required: false,
      description: '公司id',
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
  userLoginBodyReq: {
    username: {
      type: 'string',
      required: true,
      min: 2,
      max: 60,
      trim: true,
      example: 'Imfdj',
      description: '用户名',
    },
    password: {
      type: 'string',
      required: true,
      max: 64,
      trim: true,
      example: '123123',
      description: '用户密码',
    },
  },
};

module.exports = {
  ...body,
  userPutBodyReq: {
    ...body.userId,
    ...body.userBodyReq,
    roles: {
      type: 'array',
      required: false,
      itemType: 'number',
      example: [ 1, 2 ],
      description: '角色id，数组',
    },
  },
  userCreateBodyReq: {
    ...body.userBodyReq,
    roles: {
      type: 'array',
      required: true,
      itemType: 'number',
      example: [ 1, 2 ],
      description: '角色id，数组',
    },
  },
  userDelBodyReq: {
    id: {
      type: 'number',
      required: true,
      description: 'id',
      example: 1,
    },
  },
};
