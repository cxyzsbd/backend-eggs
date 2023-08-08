'use strict';

const body = {
  stationBindRelationsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  stationBindRelationsBodyReq: {
    station_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '站点id',
    },
    target_id: {
      type: 'string',
      max: 100,
      required: true,
      description: '目标id',
    },
    others: {
      type: 'object',
      required: false,
      description: '其他参数',
    },
    type: {
      type: 'number',
      min: 1,
      required: true,
      description: '绑定关系类型(1:摄像设备)',
    },
  },
  stationBindRelationsQueryReq: {
    station_id: {
      type: 'string',
      max: 20,
      required: false,
      description: '站点id',
    },
    target_id: {
      type: 'string',
      max: 100,
      required: false,
      description: '目标id',
    },
    others: {
      type: 'object',
      required: false,
      description: '其他参数',
    },
    type: {
      type: 'number',
      min: 1,
      required: true,
      description: '绑定关系类型(1:摄像设备)',
    },
  },
};

module.exports = {
  ...body,
  stationBindRelationsPutBodyReq: {
    ...body.stationBindRelationsBodyReq,
    ...body.stationBindRelationsId,
  },
};
