'use strict';

const body = {
  userScreensId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  userScreensBodyReq: {
    screen_id: {
      type: 'string',
      required: true,
      max: 100,
      description: '大屏id',
    },
  },
};

module.exports = {
  ...body,
};
