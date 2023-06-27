'use strict';

const body = {
  deviceTagsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  deviceTagsBodyReq: {
    device_id: {
      type: 'string',
      max: 20,
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
      type: 'number',
      enum: [ 1, 2, 3, 4 ],
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
  deviceTagsDataReq: {
    device_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '设备id',
    },
    attr_ids: {
      type: 'array',
      itemType: 'number',
      required: false,
      description: '属性id集合，不传查设备下所有属性',
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
