'use strict';

const body = {
  userAlarmTagsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  userAlarmTagsBodyReq: {
    type: {
      type: 'number',
      required: true,
      enum: [ 1, 2 ],
      description: '操作类型，1：绑定；2：解绑',
    },
    tags: {
      type: 'array',
      required: true,
      itemType: 'object',
      example: [
        {
          boxcode: 'A',
          tagname: 'B/C/D.ALMENAB',
        },
        {
          boxcode: 'A',
          tagname: 'B/C/D.ALMENAB',
        },
      ],
      description: '关注点位',
    },
  },
  userAlarmTagsQueryReq: {
    boxcode: {
      type: 'string',
      required: false,
      description: '访问码',
    },
    tagname: {
      type: 'string',
      required: false,
      description: '点名',
    },
  },
};

module.exports = {
  ...body,
};
