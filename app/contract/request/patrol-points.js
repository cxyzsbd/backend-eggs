'use strict';

const body = {
  patrolPointsId: {
    sn: { type: 'string', required: true, description: '编号' },
  },
  patrolPointsBodyReq: {
    asset_sn: {
      type: 'string',
      max: 30,
      required: false,
      description: '资产编号，资产生成巡点才有',
    },
    name: {
      type: 'string',
      max: 60,
      required: true,
      description: '巡点名称',
    },
    type: {
      type: 'number',
      required: true,
      description: '类型',
    },
    responsible: {
      type: 'string',
      max: 30,
      required: false,
      description: '负责人',
    },
    responsible_contact: {
      type: 'string',
      max: 30,
      required: false,
      description: '负责人联系方式',
    },
    address: {
      type: 'string',
      max: 255,
      required: false,
      description: '地址',
    },
    networking: {
      type: 'number',
      required: true,
      enum: [ 1, 2 ],
      description: '是否物联(1：是；2：否)',
    },
    desc: {
      type: 'string',
      max: 300,
      required: false,
      description: '描述',
    },
  },
};

module.exports = {
  ...body,
  patrolPointsPutBodyReq: {
    ...body.patrolPointsId,
    ...body.patrolPointsBodyReq,
  },
};
