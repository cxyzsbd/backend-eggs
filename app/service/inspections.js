'use strict';

const Service = require('egg').Service;
const { Sequelize, Op } = require('sequelize');

class InspectionsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    where.company_id = company_id;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.Inspections.count({ where });
    const data = await ctx.model.Inspections.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
      attributes: {
        include: [
          [ Sequelize.col('creator_info.username'), 'creator_name' ],
        ],
      },
      include: [
        {
          model: ctx.model.Users,
          as: 'creator_info',
          attributes: [],
        },
      ],
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
      attributes: {
        include: [
          [ Sequelize.col('creator_info.username'), 'creator_name' ],
        ],
      },
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
          model: ctx.model.Users,
          as: 'creator_info',
          attributes: [],
        },
        {
          model: ctx.model.InspectionTargets,
          include: [
            {
              model: ctx.model.EquipmentAccounts,
              as: 'equipment_account',
            },
          ],
        },
      ],
    });
  }

  async create(payload) {
    const { ctx, app } = this;
    const { request_user, company_id } = ctx.request.header;
    payload.id = await app.utils.tools.SnowFlake();
    payload.creator = request_user;
    payload.company_id = company_id;
    payload.status = 1;
    const transaction = await ctx.model.transaction();
    try {
      // 创建巡检计划
      const res = await ctx.model.Inspections.create(payload, { transaction });
      // 巡检人
      const handlersArr = payload.handlers.map(handler => {
        return {
          handler,
          inspection_id: res.id,
        };
      });
      await ctx.model.InspectionHandlers.bulkCreate(handlersArr, { transaction });
      // 巡检目标
      const targetArr = payload.targets.map(t => {
        return {
          inspection_id: res.id,
          equipment_account_id: t.equipment_account_id,
          items: t.items,
        };
      });
      await ctx.model.InspectionTargets.bulkCreate(targetArr, { transaction });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async update(payload) {
    const { ctx, app } = this;
    const { lodash } = app.utils.tools;
    const {
      id,
      handlers = null,
      targets = null,
      name = null,
      cycle = null,
      start_time = null,
      end_time = null,
      next_time = null,
      duration = null,
      duration_unit = null,
      desc = null,
      status = null,
      remind_time = null,
    } = payload;
    let updateParams = { name, cycle, start_time, end_time, next_time, duration, duration_unit, desc, status, remind_time };
    let updateParamsNew = {};
    Object.keys(updateParams).forEach(key => {
      if (updateParams[key] !== null) {
        updateParamsNew[key] = updateParams[key];
      }
    });
    const transaction = await ctx.model.transaction();
    try {
      // 更新巡检计划
      let res = null,
        res1 = null,
        res2 = null;
      if (Object.keys(updateParamsNew).length) {
        res = await ctx.model.Inspections.update(updateParamsNew, {
          where: {
            id,
          },
          transaction,
        });
      }
      // 巡检人
      if (handlers) {
        const oldHandlers = await ctx.model.InspectionHandlers.findAll({
          where: {
            inspection_id: id,
          },
          raw: true,
          transaction,
        });
        const oldHandlerIds = oldHandlers.map(item => item.handler);
        const diffArr = lodash.difference(oldHandlerIds, handlers);
        let delArr = [],
          addArr = [];
        diffArr.forEach(h => {
          if (oldHandlerIds.includes(h)) {
            delArr.push(h);
          }
          if (handlers.includes(h)) {
            addArr.push(h);
          }
        });
        if (delArr.length) {
          res1 = await ctx.model.InspectionHandlers.destroy({
            where: {
              inspection_id: id,
              handler: {
                [Op.in]: delArr,
              },
            },
            transaction,
          });
        }
        if (addArr.length) {
          const addTempArr = addArr.map(h => {
            return {
              handler: h,
              inspection_id: id,
            };
          });
          res1 = await ctx.model.InspectionHandlers.bulkCreate(addTempArr, { transaction });
        }
      }
      // 巡检目标
      if (targets) {
        // 删除原目标
        await ctx.model.InspectionTargets.destroy({
          where: {
            inspection_id: id,
          },
          transaction,
        });
        // 插入新目标
        const targetArr = targets.map(t => {
          return {
            inspection_id: id,
            equipment_account_id: t.equipment_account_id,
            items: t.items,
          };
        });
        res2 = await ctx.model.InspectionTargets.bulkCreate(targetArr, { transaction });
      }
      await transaction.commit();
      return res || res1 || res2;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async destroy(payload) {
    const { ctx } = this;
    return await ctx.model.Inspections.destroy({ where: payload });
  }
}

module.exports = InspectionsService;
