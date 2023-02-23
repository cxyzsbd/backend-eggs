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
    tag: {
      type: 'string',
      required: true,
      max: 255,
      description: '点名',
    },
    attr_desc: {
      type: 'string',
      required: true,
      max: 20,
      description: '属性描述',
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
