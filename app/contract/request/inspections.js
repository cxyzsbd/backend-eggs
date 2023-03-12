'use strict';

const body = {
  inspectionsId: {
    id: {
      type: 'string',
      max: 20,
      required: true,
      description: '计划编号',
    },
  },
  inspectionsBodyReq: {
    name: {
      type: 'string',
      max: 60,
      required: true,
      description: '计划名称',
    },
    cycle: {
      type: 'number',
      required: true,
      enum: [ 1, 2, 3, 4, 5, 6, 7 ],
      description: '周期类型（1:单次；2:日；3:周；4:月；5:季度；6:半年；7年度）',
    },
    start_time: {
      type: 'string',
      required: true,
      description: '开始时间，首次执行时间',
    },
    end_time: {
      type: 'string',
      required: true,
      description: '结束时间',
    },
    next_time: {
      type: 'string',
      required: false,
      description: '下一次任务时间',
    },
    duration: {
      type: 'number',
      required: false,
      description: '单次巡检持续时间，配合单位，默认1天',
    },
    duration_unit: {
      type: 'number',
      required: false,
      description: '持续时间单位，1:天；2:小时',
    },
    desc: {
      type: 'string',
      max: 255,
      required: false,
      description: '描述',
    },
    state: {
      type: 'number',
      required: true,
      enum: [ 0, 1 ],
      description: '是否启用：1:启用；0:停用',
    },
    handlers: {
      type: 'array',
      required: true,
      example: [ 1, 2 ],
      itemType: 'number',
      description: '处理人集合',
    },
    remind_time: {
      type: 'number',
      required: true,
      description: '任务开始前多久通知，单位秒',
    },
    targets: {
      type: 'array',
      itemType: 'object',
      required: true,
      example: [
        {
          equipment_account_id: 1,
          items: [ '外观', '通电状态' ],
        },
        {
          equipment_account_id: 2,
          items: [ '外观', '通电状态' ],
        },
      ],
      description: '巡检目标',
    },
  },
};

module.exports = {
  ...body,
  inspectionsPutBodyReq: {
    ...body.inspectionsId,
    ...body.inspectionsBodyReq,
  },
  inspectionStartBodyReq: {
    ...body.inspectionsId,
    next_time: {
      type: 'string',
      required: true,
      description: '下一次任务时间',
    },
  },
};
