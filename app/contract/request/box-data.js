'use strict';

const body = {
  boxDataBodyReq: {
    param_type: {
      type: 'number',
      required: true,
      enum: [ 1, 2 ],
      description: '点属性参数类型，1：id;2:长属性名',
    },
    param_arr: {
      type: 'array',
      itemType: 'string',
      required: true,
      description: '属性数组',
    },
  },
};

module.exports = {
  ...body,
};
