'use strict';

const body = {
  yzRolesId: {
    id: { type: 'string', required: true, description: 'id' },
  },
  yzRolesBodyReq: {
    name: {
      type: 'string',
      max: 60,
      required: true,
    },
  },
  saveUserYzRolesBodyReq: {
    user_id: { type: 'string', required: true, description: 'id' },
    roles: {
      type: 'array',
      itemType: 'number',
      required: true,
      description: '角色id集合',
    },
  },
};

module.exports = {
  ...body,
  yzRolesPutBodyReq: {
    ...body.yzRolesId,
    ...body.yzRolesBodyReq,
  },
};
