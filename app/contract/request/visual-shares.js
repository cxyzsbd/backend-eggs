'use strict';

const body = {
  visualSharesId: {
    id: { type: 'string', required: true, description: 'id' },
  },
  visualSharesBodyReq: {
    visual_id: {
      type: 'string',
      max: 100,
      required: true,
      description: '可视化id',
    },
    type: {
      type: 'number',
      required: true,
      emun: [ 1, 2 ],
      description: '可视化类型(1:大屏；2：流程图)',
    },
    invalid_time: {
      type: 'string',
      required: false,
      description: '失效时间',
    },
    is_share: {
      type: 'number',
      required: true,
      emun: [ 0, 1 ],
      description: '分享开关（1：分享；0关闭）',
    },
    share_pass: {
      type: 'string',
      max: 20,
      required: false,
      description: '分享密码，明文',
    },
  },
  downloadDataBodyReq: {
    param_type: {
      type: 'number',
      required: true,
      enum: [ 1, 2 ],
      description: '点属性参数类型，1：id;2:长属性名',
    },
    param_arr: {
      type: 'array',
      itemType: 'object',
      required: true,
      description: '',
      example: '[{"id": 1,"value": 100},{"id": 2,"value": 101 }],或者type=2时,[{"long_attr": "焦化厂/柴油发电机组/温度","value": 100},{"long_attr": "焦化厂/柴油发电机组/湿度","value": 101 }]',
    },
  },
};

module.exports = {
  ...body,
  visualSharesPutBodyReq: {
    ...body.visualSharesId,
    ...body.visualSharesBodyReq,
  },
};
