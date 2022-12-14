'use strict';

const body = {
  roleId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  roleBodyReq: {
    name: {
      type: 'string',
      required: true,
      min: 1,
      max: 50,
      description: '角色姓名',
    },
  },
};

module.exports = {
  ...body,
  roleCreateReq: {
    ...body.roleBodyReq,
    // ...body.companyId
  },
  rolePutBodyReq: {
    ...body.roleId,
    ...body.roleBodyReq,
  },
  roleDelBodyReq: {
    id: {
      type: 'number',
      required: true,
      description: 'id',
      example: 1,
    },
  },
};
