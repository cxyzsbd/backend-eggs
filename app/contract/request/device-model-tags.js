'use strict';

const body = {
  deviceModelTagsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  deviceModelTagsIds: {
    ids: { type: 'array', itemType: 'string', required: true, description: 'ids' },
  },
  deviceModelTagsBodyReq: {
    model_id: {
      type: 'string',
      required: true,
      max: 20,
      description: '模型id',
    },
    name: {
      type: 'string',
      required: true,
      max: 20,
      description: '属性名称',
    },
    desc: {
      type: 'string',
      required: false,
      max: 60,
      description: '属性描述',
    },
    type: {
      type: 'number',
      required: false,
      min: 1,
      max: 4,
      description: '类型(1:int;2:float;3:int;4:string)',
    },
    range: {
      type: 'string',
      required: false,
      max: 100,
      description: '范围',
    },
    unit: {
      type: 'string',
      required: false,
      max: 20,
      description: '单位',
    },
  },
};

module.exports = {
  ...body,
  deviceModelTagsPutBodyReq: {
    ...body.deviceModelTagsId,
    ...body.deviceModelTagsBodyReq,
  },
};
