'use strict';

const body = {
  stationFilesId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  stationFilesBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 100,
      description: '文件名称',
    },
    desc: {
      type: 'string',
      required: false,
      max: 255,
      description: '描述',
    },
    url: {
      type: 'string',
      required: true,
      max: 255,
      description: '文件地址',
    },
    type: {
      type: 'string',
      required: false,
      description: '后缀名',
    },
    station_id: {
      type: 'string',
      max: 20,
      required: true,
      description: '站点id',
    },
  },
};

module.exports = {
  ...body,
  stationFilesPutBodyReq: {
    ...body.stationFilesBodyReq,
    ...body.stationFilesId,
  },
};
