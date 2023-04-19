'use strict';

const body = {
  maintenanceTasksId: {
    id: { type: 'string', required: true, description: '编号' },
  },
  maintenanceTasksBodyReq: {
    maintenance_id: {
      type: 'string',
      required: true,
      max: 20,
      description: '保养编号',
    },
    name: {
      type: 'string',
      required: true,
      max: 80,
      description: '任务名称',
    },
    start_time: {
      type: 'string',
      required: false,
      description: '开始时间',
    },
    end_time: {
      type: 'string',
      required: false,
      description: '结束时间',
    },
    status: {
      type: 'number',
      required: true,
      enum: [ 1, 2, 3, 4 ],
      description: '状态（1:待确认；2:已确认，执行中；3:已完成；）',
    },
  },
};

module.exports = {
  ...body,
  maintenanceTasksPutBodyReq: {
    ...body.maintenanceTasksId,
    ...body.maintenanceTasksBodyReq,
  },
  maintenancesubReslutsBodyReq: {
    ...body.maintenanceTasksId,
    equipment_account_id: {
      type: 'string',
      required: true,
      description: '保养目标id',
    },
    results: {
      type: 'object',
      required: true,
      description: '保养结果,如{"通电状态":"异常","运行状态":"异常","其他情况":"异常"}',
    },
    audios: {
      type: 'string',
      required: false,
      description: '音频',
    },
    imgs: {
      type: 'string',
      required: false,
      description: '图片',
    },
    remarks: {
      type: 'string',
      required: false,
      description: '备注',
    },
  },
};
