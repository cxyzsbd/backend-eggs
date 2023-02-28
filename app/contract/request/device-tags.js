'use strict';

const body = {
  deviceTagsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  deviceTagsBodyReq: {
    device_id: {
      type: 'number',
      min: 1,
      required: true,
      description: '设备id',
    },
    name: {
      type: 'string',
      max: 20,
      required: true,
      description: '属性名称',
    },
    type: {
      type: 'string',
      max: 20,
      required: false,
      description: '类型',
    },
    desc: {
      type: 'string',
      max: 60,
      required: false,
      description: '描述',
    },
    unit: {
      type: 'string',
      max: 20,
      required: false,
      description: '单位',
    },
    range: {
      type: 'string',
      max: 100,
      required: false,
      description: '范围',
    },
    boxcode: {
      type: 'string',
      required: false,
      max: 20,
      description: '点位所属盒子访问码',
    },
    tagname: {
      type: 'string',
      max: 255,
      required: false,
      description: '关联实际点位长点名',
    },
  },
};

module.exports = {
  ...body,
  deviceTagsPutBodyReq: {
    ...body.deviceTagsId,
    ...body.deviceTagsBodyReq,
  },
};
