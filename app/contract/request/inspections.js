'use strict'

const body = {
  inspectionsId: {
    sn: {
      type: 'string',
      max: 30,
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
    duration: {
      type: 'number',
      required: true,
      description: '单次巡检持续时间，配合单位，默认1天',
    },
    duration_unit: {
      type: 'number',
      required: true,
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
      description: '是否启用：1:启用；0:停用',
    },
  },
}

module.exports = {
  ...body,
  inspectionsPutBodyReq: {
    ...body.inspectionsId,
    ...body.inspectionsBodyReq
  }
}
