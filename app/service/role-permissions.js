'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class _objectName_Service extends Service {
  async findAll(payload) {
    const { ctx, app } = this;
    const { pageSize, pageNumber, prop_order, order } = payload;
    const where = payload.where;
    const Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.RolePermissions.count({ where });
    const data = await ctx.model.RolePermissions.findAll({
      // limit: pageSize,
      // offset: (pageSize* (pageNumber - 1))>0?(pageSize* (pageNumber - 1)) : 0,
      where,
      order: Order,
    });
    return {
      data,
      // pageNumber,
      // pageSize,
      total: count,
    };
  }

  async findOne(id) {
    const { ctx } = this;
    return await ctx.model.RolePermissions.findOne({ where: { id } });
  }

  async create(payload) {
    const { ctx } = this;
    return await ctx.model.RolePermissions.findOrCreate({
      where: payload,
      defaults: payload,
    });
  }

  async update(payload) {
    const { ctx } = this;
    const RolePermissions = ctx.model.RolePermissions;
    const data = await RolePermissions.findByPk(payload.id);
    if (!data) return { _wrong_code: 'NOT_FOUND' };
    const res = await RolePermissions.findOne({
      where: {
        role_id: payload.role_id,
        permission_id: payload.permission_id,
        id: {
          [Op.not]: payload.id,
        },
      },
    });
    if (res) {
      return {
        _wrong_code: 'DATA_EXISTED',
      };
    }
    return await RolePermissions.update(payload, {
      where: { id: payload.id },
    });
  }

  async destroy(payload) {
    const { ctx } = this;
    const delData = await ctx.model.RolePermissions.findAll({
      where: { id: payload.ids },
    });
    return await ctx.model.RolePermissions.destroy({
      where: { id: payload.ids },
      delData,
    });
  }

  /**
   *  单角色批量添加多菜单
   * @param payload
   * @return {Promise<void>}
   */
  async bulkCreatePremissions(payload) {
    const { ctx } = this;
    // 先查询该角色包含哪些资源
    const permissions = await ctx.model.RolePermissions.findAll({
      where: {
        role_id: payload.role_id,
      },
      attributes: [ 'permission_id' ],
    });
    // 提取permission_id成数字数组
    const permission_ids = permissions.map(item => item.permission_id);
    // 筛选可以添加的数据
    const ids = payload.permission_ids.filter(id => !permission_ids.includes(id));
    const data = ids.map(e => {
      return { role_id: payload.role_id, permission_id: e };
    });
    return await ctx.model.RolePermissions.bulkCreate(data);
  }
  /**
   *  单角色批量删除多资源
   * @param payload
   * @param payload.role_id
   * @param payload.permission_ids
   * @return {Promise<void>}
   */
  async bulkDeletePermissions({ role_id, permission_ids }) {
    const { ctx } = this;
    return await ctx.model.RolePermissions.destroy({
      where: {
        role_id,
        permission_id: {
          [Op.in]: permission_ids,
        },
      },
    });
  }
}

module.exports = _objectName_Service;
