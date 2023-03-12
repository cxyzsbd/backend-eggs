'use strict';

const body = {
  flowsId: {
    id: { type: 'string', max: 100, required: true, description: 'id' },
  },
  flowsBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 60,
      description: '名称',
    },
    desc: {
      type: 'string',
      required: false,
      max: 255,
      description: '描述',
    },
    image: {
      type: 'string',
      required: false,
      max: 255,
      description: '缩略图',
    },
    class: {
      type: 'string',
      required: false,
      max: 60,
      description: '类型',
    },
    tags: {
      type: 'array',
      required: false,
      itemType: 'string',
      description: '标签',
    },
    component: {
      type: 'number',
      required: false,
      description: '图纸类型:0：工程；1：组件',
    },
    is_publish: {
      type: 'number',
      enum: [ 0, 1 ],
      required: true,
      description: '是否发布:0：不发布；1：发布',
    },
    station_id: {
      type: 'number',
      required: false,
      description: '站点id',
    },
  },
};

module.exports = {
  ...body,
  flowsPutBodyReq: {
    ...body.flowsBodyReq,
    ...body.flowsId,
  },
};
