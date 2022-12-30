'use strict';

const Service = require('egg').Service;

class InspectionsService extends Service {
  /**
   * 生成编号
   */
  async generateSn() {
    const { ctx, app } = this;
    const sn = await app.utils.tools.generateSn('XJ-JH');
    // 校验是否已存在
    const checkHas = await ctx.model.Inspections.count({
      where: { sn },
    });
    if (checkHas) {
      this.generateOrderNo('XJ-JH');
      return false;
    }
    return sn;
  }
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.Inspections.count({ where });
    const data = await ctx.model.Inspections.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total: count,
    };
  }

  async findOne(payload) {
    const { ctx } = this;
    return await ctx.model.Inspections.findOne({
      where: payload,
      include: [
        {
          as: 'handlers',
          model: ctx.model.Users,
          attributes: { exclude: [ 'password' ] },
        },
        {
          model: ctx.model.InspectionTasks,
        },
        {
          model: ctx.model.InspectionTargets,
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    const { request_user, department_id } = ctx.request.header;
    payload.sn = await this.generateSn();
    payload.creator = request_user;
    payload.department_id = department_id;
    payload.status = 1;
    const transaction = await ctx.model.transaction();
    try {
      // 创建巡检计划
      const res = await ctx.model.Inspections.create(payload, { raw: true, transaction });
      // 巡检人
      const handlersArr = payload.handlers.map(handler => {
        return {
          handler,
          sn: res.sn,
        };
      });
      await ctx.model.InspectionHandlers.bulkCreate(handlersArr, { transaction });
      // 巡检目标
      const targetArr = payload.targets.map(t => {
        return {
          inspection_sn: res.sn,
          patrol_point_sn: t.patrol_point_sn,
          items: t.items,
        };
      });
      await ctx.model.InspectionTargets.bulkCreate(targetArr);
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.Inspections.update(payload, { where: payload });
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.Inspections.destroy({ where: payload });
  }
}

module.exports = InspectionsService;
