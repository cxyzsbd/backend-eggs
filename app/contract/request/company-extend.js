'use strict';

const body = {
  companyExtendId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  companyExtendBodyReq: {
    remark: {
      type: 'object',
      required: true,
      description: '备注 任意json',
    },
    account: {
      type: 'string',
      required: false,
      max: 255,
      description: '账号',
    },
    password: {
      type: 'string',
      required: false,
      max: 255,
      description: 'password',
    },
    val_type: {
      type: 'number',
      required: false,
      description: '类型',
    },
  },
};

module.exports = {
  ...body,
  companyExtendPutBodyReq: {
    ...body.companyExtendId,
    ...body.companyExtendBodyReq,
  },
};
