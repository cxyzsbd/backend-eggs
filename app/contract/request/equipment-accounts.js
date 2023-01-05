'use strict';

const body = {
  equipmentAccountsId: {
    sn: { type: 'string', required: true, description: 'sn' },
  },
  equipmentAccountsBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 60,
      description: '名称',
    },
    type: {
      type: 'number',
      required: false,
      description: '类型（1：PLC；2：仪表；3：网关；4：传感器；5：其他）',
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
  },
};

module.exports = {
  ...body,
  equipmentAccountsPutBodyReq: {
    ...body.equipmentAccountsId,
    ...body.equipmentAccountsBodyReq,
  },
};
