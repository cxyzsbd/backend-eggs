'use strict';

const body = {
  userSubAttrsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  userSubAttrsBodyReq: {
    action_type: {
      type: 'number',
      required: true,
      enum: [ 1, 2 ],
      description: '操作类型，1：订阅；2：取消订阅',
    },
    type: {
      type: 'number',
      required: true,
      enum: [ 1, 2, 3 ],
      description: '1:报表；2：曲线；3：曲线对比',
    },
    attrs: {
      type: 'array',
      required: true,
      itemType: 'number',
      example: [],
      description: '订阅属性',
    },
  },
};

module.exports = {
  ...body,
};
