'use strict';

const Service = require('egg').Service;

class YzRolesService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    let where = payload.where;
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const total = await ctx.model.YzRoles.count({ where });
    const data = await ctx.model.YzRoles.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      where,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total,
    };
  }

  async findUserYzRoles(payload) {
    const { ctx } = this;
    return await ctx.model.YzUserRoles.findAll({ where: { user_id: payload.user_id } });
  }

  async save(payload) {
    const { ctx } = this;
    const { user_id, roles } = payload;
    const transaction = await ctx.model.transaction();
    try {
      await ctx.model.YzUserRoles.destroy({
        where: {
          user_id,
        },
        transaction,
      });
      let rolesTemp = roles.map(role => {
        return {
          user_id,
          role_id: role,
        };
      });
      const res = await ctx.model.YzUserRoles.bulkCreate(rolesTemp, { transaction });
      await transaction.commit();
      return res;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }
}

module.exports = YzRolesService;
