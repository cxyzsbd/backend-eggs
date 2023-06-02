'use strict';

const body = {
  stationFlowFoldersId: {
    station_id: {
      type: 'string',
      required: true,
      description: '站点id',
    },
  },
  stationFlowFoldersBodyReq: {
    station_id: {
      type: 'string',
      required: true,
      description: '站点id',
    },
    flow_folder_id: {
      type: 'number',
      required: true,
      description: '流程图工程id',
    },
  },
};

module.exports = {
  ...body,
};
