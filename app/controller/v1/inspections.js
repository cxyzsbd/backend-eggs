'use strict';

const BaseController = require('../base-controller');

/**
* @controller 巡检 inspections
*/

class InspectionsController extends BaseController {
  durationUnitCover(unit = 1) {
    let result = 0;
    switch (unit) {
      case 1: result = 24 * 60 * 60; break;
      case 2: result = 24 * 60 * 60; break;
      default : result = 24 * 60 * 60; break;
    }
    return result;
  }

  /**
  * @apikey
  * @summary 巡检列表
  * @description 获取所有巡检
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get inspections
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.inspectionsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.inspections.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 巡检
  * @description 获取某个 巡检
  * @router get inspections/:id
  * @request path string *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.inspectionsId, ctx.params);
    const res = await service.inspections.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 巡检
  * @description 创建 巡检
  * @router post inspections
  * @request body inspectionsBodyReq
  */
  async create() {
    const { ctx, app } = this;
    const { dayjs } = app.utils.tools;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.inspectionsBodyReq, params);
    // 特殊参数单独校验
    if (params.cycle !== 1) {
      // 1.非单次巡检，需要判断每次巡检持续时间参数
      if (!params.duration || !params.duration_unit) {
        this.BAD_REQUEST({ message: '非单次巡检情况，单次巡检持续时间参数必传' });
        return false;
      }
      const cycleTime = Number(params.duration) * this.durationUnitCover(params.duration_unit);
      // console.log('cycleTime', cycleTime);
      // 2.计算单次持续时间不能大于巡检计划总时间
      const totalTime = dayjs(params.start_time).diff(dayjs(params.end_time), 'second');
      // console.log('totalTime', totalTime);
      if (cycleTime > totalTime) {
        this.BAD_REQUEST({ message: '单次巡检时间不能大于结束巡检计划总时长' });
        return false;
      }
    }
    // 任务开始前多久提醒的时间应小于1天(单次巡检则要小于巡检时长)
    // let tempTime = params.cycle === 1 ? dayjs(params.start_time).diff(dayjs(params.end_time), 'second') : 24 * 60 * 60;
    if (params.remind_time < 24 * 60 * 60) {
      this.BAD_REQUEST({ message: '提前提醒时间要小于1天' });
      return false;
    }
    await ctx.service.inspections.create(params);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 巡检
  * @description 更新 巡检
  * @router put inspections/:id
  * @request path string *id eg:1
  * @request body inspectionsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.inspectionsPutBodyReq, params);
    const res = await service.inspections.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 巡检
  * @description 删除 巡检
  * @router delete inspections/:id
  * @request path string *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.inspectionsId, params);
    const res = await service.inspections.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }
}

module.exports = InspectionsController;
