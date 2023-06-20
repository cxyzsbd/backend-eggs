'use strict';

const body = {
  stationYzVisualsId: {
    station_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '站点id',
    },
  },
  stationYzVisualsBodyReq: {
    station_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '站点id',
    },
    visual_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '可视化工程id',
    },
    visual_name: {
      type: 'string',
      max: 255,
      required: false,
      description: '可视化名称',
    },
    thumbnail: {
      type: 'string',
      max: 255,
      required: false,
      description: '可视化缩略图',
    },
  },
};

module.exports = {
  ...body,
};
