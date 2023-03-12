'use strict';

const body = {
  workOrdersId: {
    id: {
      type: 'string',
      max: 20,
      required: true,
      description: '工单编号',
    },
  },
  workOrdersBodyReq: {
    name: {
      type: 'string',
      max: 60,
      required: true,
      description: '任务名称',
    },
    type: {
      type: 'number',
      required: true,
      description: '工单类型',
    },
    level: {
      type: 'number',
      required: true,
      description: '优先级(1:一般；2:紧急；3:非常紧急；)',
    },
    end_time: {
      type: 'string',
      required: true,
      description: '截止时间',
    },
    desc: {
      type: 'string',
      max: 255,
      required: false,
      description: '描述',
    },
    commit_audios: {
      type: 'string',
      max: 500,
      required: false,
      description: '提交音频地址',
    },
    commit_imgs: {
      type: 'string',
      max: 500,
      required: false,
      description: '提交图片地址',
    },
  },
  workOrdersApprovalBodyReq: {
    approval_result: {
      type: 'number',
      required: true,
      description: '审核操作结果(1:通过：0不通过)',
    },
    not_pass_reason: {
      type: 'string',
      required: false,
      max: 255,
      comment: '审核不通过原因,审核不通过必填',
    },
    handler: {
      type: 'number',
      required: false,
      description: '处理人',
    },
  },
  workOrdersCompleteBodyReq: {
    handle_result: {
      type: 'number',
      required: false,
      description: '完成结果：1:解决；2:未解决',
    },
    remark: {
      type: 'string',
      required: false,
      description: '备注',
    },
    handle_audios: {
      type: 'string',
      max: 500,
      required: false,
      description: '处理音频地址',
    },
    handle_imgs: {
      type: 'string',
      max: 500,
      required: false,
      description: '处理图片地址',
    },
  },
};

module.exports = {
  ...body,
  workOrdersPutBodyReq: {
    ...body.workOrdersBodyReq,
    ...body.workOrdersId,
  },
};
