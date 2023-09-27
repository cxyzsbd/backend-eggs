'use strict';

const body = {
  deviceModelsId: {
    id: { type: 'string', max: 20, required: true, description: 'id' },
  },
  deviceModelsIds: {
    ids: { type: 'array', itemType: 'string', required: true, description: 'ids' },
  },
  deviceModelsBodyReq: {
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
    kind: {
      type: 'number',
      required: false,
      min: 1,
      max: 2,
      description: '模型类型（1：设备模型；2：目录模型）',
    },
  },
  modelToDirectoryBodyReq: {
    kind: {
      type: 'number',
      required: true,
      min: 2,
      max: 3,
      description: '模型类型（2：目录；2：站点）',
    },
    directory_id: {
      type: 'string',
      max: 20,
      required: true,
      description: 'id',
    },
    model_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '模型id',
    },
    is_cover: {
      type: 'number',
      min: 0,
      max: 1,
      required: false,
      description: '是否覆盖：1:覆盖；0：不覆盖',
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
