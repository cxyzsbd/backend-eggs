'use strict';

const body = {
  departmentId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  departmentsBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 60,
      trim: true,
      example: '研发部',
      description: '部门名称',
    },
    parent_id: {
      type: 'number',
      required: true,
      min: 0,
      example: 0,
      description: '父ID',
    },
    sort: {
      type: 'number',
      required: false,
      max: 999999999,
      example: 0,
      description: '排序，越大越靠前',
    },
    type: {
      type: 'number',
      required: true,
      example: 3,
      description: '分类：（1：省级公司；2：市级公司；3：油库）',
    },
    contact_name: {
      type: 'string',
      required: false,
      description: '联系人',
    },
    contact: {
      type: 'string',
      required: false,
      description: '联系人电话',
    },
    desc: {
      type: 'string',
      required: false,
      description: '描述',
    },
    longitude: {
      type: 'number',
      required: false,
      description: '经度',
    },
    latitude: {
      type: 'number',
      required: false,
      description: '纬度',
    },
    address: {
      type: 'string',
      required: false,
      description: '地址信息',
    },
    adcode: {
      type: 'string',
      required: false,
      description: '油库虚拟访问码',
    },
  },
  configFileBody: {
    file: {
      type: 'object',
      required: true,
      description: '配置项',
    },
  },
};

module.exports = {
  ...body,
  departmentsPutBodyReq: {
    ...body.departmentId,
    ...body.departmentsBodyReq,
  },
  saveConfigFileBody: {
    ...body.departmentId,
    ...body.configFileBody,
  },
};
