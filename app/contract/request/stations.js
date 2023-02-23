'use strict';

const body = {
  stationsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  stationsBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 60,
      description: '部门名称',
    },
    desc: {
      type: 'string',
      required: false,
      max: 255,
      description: '描述',
    },
    longitude: {
      type: 'number',
      required: false,
      description: '经度',
    },
    latitude: {
      type: 'number',
      required: false,
      description: '纬度',
    },
    address: {
      type: 'string',
      required: false,
      max: 255,
      description: '地址信息',
    },
    img: {
      type: 'string',
      required: false,
      max: 255,
      description: '图片',
    },
    department_id: {
      type: 'number',
      required: true,
      description: '部门id',
    },
  },
};

module.exports = {
  ...body,
  stationsPutBodyReq: {
    ...body.stationsBodyReq,
    ...body.stationsId,
  },
};
