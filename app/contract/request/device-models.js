'use strict';

const body = {
  deviceModelsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  deviceModelsBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 60,
      description: '名称',
    },
    type: {
      type: 'string',
      required: false,
      max: 20,
      description: '设备类型',
    },
    brand: {
      type: 'string',
      required: false,
      max: 20,
      description: '设备厂家/品牌',
    },
    model: {
      type: 'string',
      required: false,
      max: 20,
      description: '型号',
    },
    desc: {
      type: 'string',
      required: false,
      max: 255,
      description: '描述',
    },
    img: {
      type: 'string',
      required: false,
      max: 255,
      description: '照片url',
    },
  },
  deviceModelTagsBodyReq: {
    tags: {
      type: 'array',
      required: false,
      itemType: 'object',
      example: [{ tag: 'tag1', attr_desc: '温度' }, { tag: 'tag2', attr_desc: '湿度' }],
      description: '模型关联数据',
    },
  },
};

module.exports = {
  ...body,
  deviceModelsPutBodyReq: {
    ...body.deviceModelsId,
    ...body.deviceModelsBodyReq,
  },
};
