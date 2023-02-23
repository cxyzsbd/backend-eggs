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
};

module.exports = {
  ...body,
  deviceModelsPutBodyReq: {
    ...body.deviceModelsId,
    ...body.deviceModelsBodyReq,
  },
};
