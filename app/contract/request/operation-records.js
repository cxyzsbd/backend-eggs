'use strict';

const body = {
  operationRecordsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  operationRecordsBodyReq: {
    user_id: {
      type: 'number',
      required: true,
      description: '用户id',
    },
    operation_time: {
      type: 'string',
      required: true,
      description: '操作时间',
    },
    action: {
      type: 'string',
      required: true,
      description: '请求method',
    },
    path: {
      type: 'string',
      required: true,
      description: '请求url',
    },
    request_body: {
      type: 'string',
      required: false,
      description: '请求参数',
    },
    content: {
      type: 'string',
      required: false,
      description: '操作描述',
    },
    response_code: {
      type: 'string',
      required: false,
      description: '响应错误码',
    },
  },
};

module.exports = {
  ...body,
};
