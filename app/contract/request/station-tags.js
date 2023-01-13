'use strict';

const body = {
  stationTagsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  stationTagsBodyReq: {
    station_id: {
      type: 'number',
      required: true,
      description: '站点id',
    },
    boxcode: {
      type: 'string',
      required: true,
      max: 20,
      description: '盒子访问码',
    },
    tagname: {
      type: 'string',
      required: true,
      max: 255,
      description: '点名',
    },
    attr_desc: {
      type: 'string',
      required: true,
      max: 60,
      description: '属性描述',
    },
  },
};

module.exports = {
  ...body,
  stationTagsPutBodyReq: {
    ...body.stationTagsBodyReq,
    ...body.stationTagsId,
  },
};
