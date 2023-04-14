'use strict';

const body = {
  equipmentAccountsId: {
    id: { type: 'string', required: true, description: 'id' },
  },
  equipmentAccountsBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 60,
      description: '名称',
    },
    type: {
      type: 'string',
      max: 20,
      required: false,
      description: '类型',
    },
    brand: {
      type: 'string',
      required: false,
      max: 60,
      description: '品牌',
    },
    model: {
      type: 'string',
      required: false,
      max: 60,
      description: '型号',
    },
    responsible: {
      type: 'string',
      required: false,
      max: 60,
      description: '负责人',
    },
    responsible_contact: {
      type: 'string',
      required: false,
      max: 60,
      description: '负责人联系方式',
    },
    install_date: {
      type: 'string',
      required: false,
      description: '安装时间',
    },
    address: {
      type: 'string',
      required: false,
      max: 300,
      description: '地址',
    },
    networking: {
      type: 'number',
      required: false,
      description: '是否物联(1：是；2：否)',
    },
    desc: {
      type: 'string',
      required: false,
      max: 300,
      description: '描述',
    },
    device_id: {
      type: 'number',
      required: false,
      description: '设备id，当台账是由设备生成是必有',
    },
    station_id: {
      type: 'number',
      required: false,
      description: '关联站点id',
    },
  },
};

module.exports = {
  ...body,
  equipmentAccountsPutBodyReq: {
    ...body.equipmentAccountsId,
    ...body.equipmentAccountsBodyReq,
  },
};
