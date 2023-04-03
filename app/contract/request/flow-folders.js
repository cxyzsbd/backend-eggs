'use strict';

const body = {
  flowFoldersId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  flowFoldersBodyReq: {
    name: {
      type: 'string',
      max: 100,
      required: true,
      description: '文件夹名称',
    },
    // flow_id: {
    //   type: 'string',
    //   max: 100,
    //   required: false,
    //   description: '流程图id',
    // },
    station_id: {
      type: 'number',
      required: false,
      description: '站点id',
    },
  },
};

module.exports = {
  ...body,
  flowFoldersPutBodyReq: {
    ...body.flowFoldersId,
    ...body.flowFoldersBodyReq,
  },
  bindOrUnbindFlowsReq: {
    ...body.flowFoldersId,
    flow_ids: {
      type: 'array',
      itemType: 'string',
      required: true,
      description: '流程图id集合',
    },
  },
  flowFoldersSetDefaultFlowBodyReq: {
    ...body.flowFoldersId,
    flow_id: {
      type: 'string',
      required: true,
      description: '流程图id',
    },
  },
};
