'use strict';

const BaseController = require('../base-controller');

/**
* @controller 保养 maintenances
*/

class MaintenancesController extends BaseController {
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
  * @summary 保养列表
  * @description 获取所有保养
  * @request query string name
  * @request query number pageSize
  * @request query number pageNumber
  * @router get maintenances
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.maintenancesPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.maintenances.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 保养
  * @description 获取某个 保养
  * @router get maintenances/:id
  * @request path string *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.maintenancesId, ctx.params);
    const res = await service.maintenances.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 保养
  * @description 创建 保养
  * @router post maintenances
  * @request body maintenancesBodyReq
  */
  async create() {
    const { ctx, app } = this;
    const { dayjs } = app.utils.tools;
    const params = ctx.request.body;
    const { company_id } = ctx.request.header;
    ctx.validate(ctx.rule.maintenancesBodyReq, params);
    ctx.logger.info('保养参数:', params);
    // 特殊参数单独校验
    if (params.cycle !== 1) {
      // 1.非单次保养，需要判断每次保养持续时间参数
      if (!params.duration || !params.duration_unit) {
        this.BAD_REQUEST({ message: '非单次保养情况，单次保养持续时间参数必传' });
        return false;
      }
      const cycleTime = Number(params.duration) * this.durationUnitCover(params.duration_unit);
      ctx.logger.info('cycleTime', cycleTime);
      // 2.计算单次持续时间不能大于保养计划总时间
      const totalTime = dayjs(params.end_time).diff(dayjs(params.start_time), 'second');
      ctx.logger.info('totalTime', totalTime);
      if (cycleTime > totalTime) {
        this.BAD_REQUEST({ message: '单次保养时间不能大于保养计划总时长' });
        return false;
      }
    }
    // 任务开始前多久提醒的时间应小于1天(单次保养则要小于保养时长)
    // let tempTime = params.cycle === 1 ? dayjs(params.start_time).diff(dayjs(params.end_time), 'second') : 24 * 60 * 60;
    if (params.remind_time < 24 * 60 * 60) {
      this.BAD_REQUEST({ message: '提前提醒时间要大于等于1天' });
      return false;
    }
    ctx.logger.info('保养项参数======:', params.targets);
    const res = await ctx.service.maintenances.create(params);
    ctx.logger.info('保养插入数据结果:', res);
    // 判断是否要立即执行推送，如果是则调用推送方法，不是则生成一个倒计时任务
    // 提醒时间
    const remindTime = dayjs(params.start_time).subtract(Number(params.remind_time), 'second');
    ctx.logger.info('保养remindTime:', remindTime);
    if (dayjs(remindTime).isAfter(dayjs())) {
      ctx.logger.info('保养提醒时间还没到，生成倒计时提醒任务:', remindTime);
      const diff = dayjs(remindTime).diff(dayjs(), 'second');
      ctx.logger.info('保养提醒时间倒计时时间:', diff);
      let key = `MAINTENANCE__${res.id}__${company_id}`;
      const redisPub = app.redis.clients.get('iom');
      redisPub.set(key, 1);
      redisPub.expire(key, diff);
    } else {
      ctx.logger.info('保养提醒时间实际上已过:', remindTime);
      app.utils.iom.maintenancePush(res.id, company_id);
    }
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 保养
  * @description 更新 保养
  * @router put maintenances/:id
  * @request path string *id eg:1
  * @request body maintenancesPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.maintenancesPutBodyReq, params);
    // 判断保养是否有暂停,暂停状态才能编辑
    const maintenance = await ctx.model.Maintenances.findOne({
      where: {
        id: params.id,
      },
      raw: true,
    });
    if (maintenance && maintenance.status !== 2) {
      this.BAD_REQUEST({ message: '停用状态下才可编辑' });
      return false;
    }
    const res = await service.maintenances.update(params);
    res ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 保养
  * @description 删除 保养
  * @router delete maintenances/:id
  * @request path string *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    ctx.validate(ctx.rule.maintenancesId, params);
    const res = await service.maintenances.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 暂停 保养计划
  * @description 暂停 保养计划
  * @router patch maintenances/:id/stop
  * @request path string *id eg:1
  */
  async stop() {
    const { ctx, service, app } = this;
    const { company_id } = ctx.request.header;
    let params = ctx.params;
    ctx.validate(ctx.rule.maintenancesId, params);
    const maintenance = await ctx.model.Maintenances.findOne({
      where: {
        id: params.id,
      },
      raw: true,
    });
    if (!maintenance) {
      this.NOT_FOUND({ message: '计划不存在' });
      return false;
    }
    if (maintenance.status !== 1) {
      this.BAD_REQUEST({ message: '该状态不能进行暂停操作' });
      return false;
    }
    // 修改状态
    const res = await service.maintenances.update({
      status: 2,
      id: params.id,
    });
    // 清除倒计时任务
    let key = `MAINTENANCE__${params.id}__${company_id}`;
    const redisPub = app.redis.clients.get('iom');
    redisPub.del(key);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 启动 保养计划
  * @description 启动 保养计划
  * @router patch maintenances/:id/start
  * @request path string *id eg:1
  */
  async start() {
    const { ctx, service, app } = this;
    const { dayjs } = app.utils.tools;
    const { company_id } = ctx.request.header;
    let params = { ...ctx.params, ...ctx.request.body };
    ctx.validate(ctx.rule.maintenanceStartBodyReq, params);
    const maintenance = await ctx.model.Maintenances.findOne({
      where: {
        id: params.id,
      },
      raw: true,
    });
    if (!maintenance) {
      this.NOT_FOUND({ message: '计划不存在' });
      return false;
    }
    if (maintenance.status !== 2) {
      this.BAD_REQUEST({ message: '停用状态下才可启动' });
      return false;
    }
    // 修改状态
    const res = await service.maintenances.update({
      next_time: params.next_time,
      status: 1,
      id: params.id,
    });
    if (res && res[0] !== 0) {
      // 判断是否要立即执行推送，如果是则调用推送方法，不是则生成一个倒计时任务
      // 提醒时间
      const remindTime = dayjs(params.next_time).subtract(Number(maintenance.remind_time), 'second');
      if (dayjs(remindTime).isAfter(dayjs())) {
        const diff = dayjs(remindTime).diff(dayjs(), 'second');
        let key = `MAINTENANCE__${maintenance.id}__${company_id}`;
        const redisPub = app.redis.clients.get('iom');
        redisPub.set(key, 1);
        redisPub.expire(key, diff);
      } else {
        app.utils.iom.maintenancePush(maintenance.id, company_id);
      }
    }
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }
}

module.exports = MaintenancesController;
