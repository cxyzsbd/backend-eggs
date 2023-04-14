'use strict';

const body = {
  announcementsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  announcementsBodyReq: {
    title: {
      type: 'string',
      required: true,
      max: 100,
      description: '标题',
    },
    content: {
      type: 'string',
      required: true,
      description: '公告内容',
    },
    sort: {
      type: 'number',
      required: false,
      description: '优先级,越大优先级越高',
    },
    status: {
      type: 'number',
      required: false,
      enum: [ 1, 2 ],
      description: '状态（1：草稿，2：发布；）',
    },
    expire_at: {
      type: 'string',
      required: false,
      description: '过期时间',
    },
  },
  announcementMarkReadBodyReq: {
    ids: {
      type: 'array',
      required: true,
      itemType: 'number',
      description: '公告id集合',
    },
  },
};

module.exports = {
  ...body,
  announcementsPutBodyReq: {
    ...body.announcementsId,
    ...body.announcementsBodyReq,
  },
};
