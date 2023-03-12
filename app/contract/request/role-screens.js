'use strict';

const body = {
  roleScreensId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  roleScreensBodyReq: {
    role_id: {
      type: 'number',
      required: true,
      description: '角色id',
    },
    action_type: {
      type: 'number',
      required: true,
      enum: [ 1, 2 ],
      description: '操作类型，1：添加；2：删除',
    },
    screen_ids: {
      type: 'array',
      required: true,
      itemType: 'string',
      example: [],
      description: '大屏id集合',
    },
  },
};

module.exports = {
  ...body,
};
