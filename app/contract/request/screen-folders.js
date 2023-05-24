'use strict';

const body = {
  screenFoldersId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  screenFoldersBodyReq: {
    name: {
      type: 'string',
      max: 100,
      required: true,
      description: '文件夹名称',
    },
    component: {
      type: 'number',
      required: false,
      description: '0:图纸；1：组件',
    },
  },
};

module.exports = {
  ...body,
  screenFoldersPutBodyReq: {
    ...body.screenFoldersId,
    ...body.screenFoldersBodyReq,
  },
  bindOrUnbindScreensReq: {
    ...body.screenFoldersId,
    screen_ids: {
      type: 'array',
      itemType: 'string',
      required: true,
      description: '大屏id集合',
    },
  },
  screenFoldersSetDefaultScreenBodyReq: {
    ...body.screenFoldersId,
    screen_id: {
      type: 'string',
      required: true,
      description: '大屏id',
    },
  },
};
