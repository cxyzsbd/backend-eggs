'use strict';

const body = {
  stationAttrsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  stationAttrsBodyReq: {
    station_id: {
      type: 'number',
      required: true,
      description: '站点id',
    },
    attr_id: {
      type: 'number',
      required: true,
      description: '属性id',
    },
  },
};

module.exports = {
  ...body,
  stationAttrsPutBodyReq: {
    ...body.stationAttrsId,
    ...body.stationAttrsBodyReq,
  },
};
