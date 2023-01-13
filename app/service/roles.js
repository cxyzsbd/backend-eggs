'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class RoleService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    // 如果请求者不是用户id为1的超级管理员，则不返回id为1的超级管理员角色
    // if (ctx.currentRequestData.userInfo.id !== 1) {
    //   if (where[Op.and]) {
    //     where[Op.and].push({ id: { [Op.ne]: 1 } });
    //   } else {
    //     where[Op.and] = [{ id: { [Op.ne]: 1 } }];
    //   }
    // }
    const total = await ctx.model.Roles.count({ where });
    const data = await ctx.model.Roles.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
      distinct: true,
      include: [
        {
          as: 'department',
          model: ctx.model.Departments,
        },
      ],
    });
    return {
      data,
      pageNumber,
      pageSize,
      total,
    };
  }

  async findOne(id) {
    const { ctx } = this;
    return await ctx.model.Roles.findOne({ where: { id } });
  }

  async create(payload) {
    const { ctx } = this;
    const { department_id } = ctx.request.header;
    payload.department_id = department_id;
    return await ctx.model.Roles.create(payload);
  }

  async update(payload) {
    const { ctx } = this;
    return await ctx.model.Roles.update(payload, { where: { id: payload.id } });
  }

  async destroy(payload) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    try {
      const res = await ctx.model.Roles.destroy({ where: { id: payload.id }, transaction });
      await ctx.model.RoleMenus.destroy({ where: { role_id: payload.id }, transaction });
      await ctx.model.RolePermissions.destroy({ where: { role_id: payload.id }, transaction });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async updateIsDefault(payload) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    await ctx.model.Roles.update({ is_default: 0 }, { where: { is_default: 1 }, transaction });
    const res = await ctx.model.Roles.update({ is_default: 1 }, { where: { id: payload.id }, transaction });
    if (res && res[0] === 1) {
      await transaction.commit();
      return true;
    }
    await transaction.rollback();
    return false;
  }
}

module.exports = RoleService;
