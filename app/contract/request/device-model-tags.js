'use strict';

const body = {
  deviceModelTagsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  deviceModelTagsBodyReq: {
    model_id: {
      type: 'number',
      required: true,
      description: '模型id',
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
  },
};

module.exports = {
  ...body,
  deviceModelTagsPutBodyReq: {
    ...body.deviceModelTagsId,
    ...body.deviceModelTagsBodyReq,
  },
};
