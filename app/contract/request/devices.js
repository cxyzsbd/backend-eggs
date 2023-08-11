'use strict';

const body = {
  devicesId: {
    id: { type: 'string', max: 20, required: true, description: 'id' },
  },
  devicesIds: {
    ids: { type: 'array', itemType: 'string', required: true, description: 'ids' },
  },
  devicesBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 100,
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
    station_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '站点id',
    },
  },
  modelToDeviceBodyReq: {
    station_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '站点id',
    },
    model_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '模型id',
    },
    name: {
      type: 'string',
      required: true,
      max: 100,
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
  devicesPutBodyReq: {
    ...body.devicesBodyReq,
    ...body.devicesId,
  },
};
