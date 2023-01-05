'use strict';

const body = {
  toolsId: {
    id: { type: 'number', required: true, description: 'id' },
  },
  toolsBodyReq: {
    name: {
      type: 'string',
      required: true,
      max: 60,
      description: '名称',
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
    category: {
      type: 'string',
      required: false,
      max: 60,
      description: '分类',
    },
    inventory: {
      type: 'number',
      required: false,
      description: '库存',
    },
    desc: {
      type: 'string',
      required: true,
      max: 255,
      description: '描述',
    },
  },
  toolsInventoryBodyReq: {
    tool_id: {
      type: 'number',
      required: true,
      description: '工具id',
    },
    receiving_record_id: {
      type: 'number',
      required: false,
      description: '领用记录id',
    },
    operator: {
      type: 'string',
      required: false,
      max: 60,
      description: '操作人',
    },
    operator_contact: {
      type: 'string',
      required: false,
      max: 60,
      description: '操作人联系方式',
    },
    operating_time: {
      type: 'string',
      required: true,
      description: '操作时间',
    },
    quantity: {
      type: 'number',
      required: true,
      max: 255,
      description: '数量',
    },
    type: {
      type: 'number',
      required: true,
      enum: [ 1, 2, 3, 4 ],
      description: '操作类型(1:入库；2：出库；3：领用；4：归还)',
    },
    remark: {
      type: 'string',
      required: true,
      max: 300,
      description: '备注',
    },
  },
};

module.exports = {
  ...body,
  toolsPutBodyReq: {
    ...body.toolsBodyReq,
    ...body.toolsId,
  },
};
