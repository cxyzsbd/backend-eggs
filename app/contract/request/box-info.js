'use strict';

const body = {
  boxInfoId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  boxInfoBodyReq: {
    label: {
      type: 'string',
      required: false,
      max: 255,
      description: '网关标签',
    },
    department: {
      type: 'string',
      required: false,
      max: 255,
      description: '部门ID/公司ID/组织ID',
    },
    longitude: {
      type: 'string',
      required: false,
      max: 16,
      description: 'localtion-longitude 经纬度',
    },
    latitude: {
      type: 'string',
      required: false,
      max: 16,
      description: '经纬度',
    },
    box_code: {
      type: 'string',
      required: true,
      max: 8,
      description: '用户侧用的编码',
    },
    machine_code: {
      type: 'string',
      required: true,
      max: 32,
      description: 'UUID 设备指纹',
    },
    box_model: {
      type: 'number',
      required: true,
      description: '产品型号',
    },
    online_status: {
      type: 'number',
      required: false,
    },
  },
};

module.exports = {
  ...body,
  boxInfoPutBodyReq: {
    ...body.boxInfoId,
    ...body.boxInfoBodyReq,
  },
};
