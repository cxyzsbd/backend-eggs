'use strict';

const body = {
  companysId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  companysBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 60,
      description: '公司名称',
    },
    platform_name: {
      type: 'string',
      required: false,
      max: 60,
      description: '平台名称',
    },
    connection_limit: {
      type: 'number',
      required: false,
      description: '连接数限制',
    },
    logo: {
      type: 'string',
      required: false,
      max: 255,
      description: 'logo',
    },
    desc: {
      type: 'string',
      required: false,
      max: 255,
      description: '描述',
    },
    time_limit: {
      type: 'string',
      required: false,
      description: '使用期限',
    },
  },
};

module.exports = {
  ...body,
  companysPutBodyReq: {
    ...body.companysId,
    ...body.companysBodyReq,
  },
};
