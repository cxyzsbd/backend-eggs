'use strict';

const body = {
  notificationsId: {
    id: { type: 'string', required: true, description: 'id' },
  },
  notificationsBodyReq: {
    sender_id: {
      type: 'number',
      required: true,
      description: '发送人',
    },
    type: {
      type: 'number',
      required: true,
      description: '消息类型(1:工单；2：巡检；3：保养)',
    },
    content: {
      type: 'string',
      required: true,
      description: '内容',
    },
    is_read: {
      type: 'number',
      required: false,
      enum: [ 0, 1 ],
      description: '是否已读（1：已读；0：未读）',
    },
    target_id: {
      type: 'number',
      required: false,
      description: '目标id',
    },
  },
  notificationMarkReadBodyReq: {
    ids: {
      type: 'array',
      required: true,
      itemType: 'number',
      description: '消息id集合',
    },
  },
};

module.exports = {
  ...body,
  notificationsPutBodyReq: {
    ...body.notificationsId,
    ...body.notificationsBodyReq,
  },
};
