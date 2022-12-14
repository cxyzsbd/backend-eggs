'use strict';

const Service = require('egg').Service;
const Op = require('sequelize').Op;

class _objectName_Service extends Service {

  /**
   *  单用户批量添加多角色
   * @param payload
   * @return {Promise<void>}
   */
  async bulkCreateRoles(payload) {
    const { ctx } = this;
    payload = payload.role_ids.map(e => {
      return { user_id: payload.user_id, role_id: e };
    });
    return await ctx.model.UserRoles.bulkCreate(payload);
  }

  /**
   *  单用户批量删除多角色
   * @param payload
   * @return {Promise<void>}
   */
  async bulkDeleteRoles(payload) {
    const { ctx } = this;
    return await ctx.model.UserRoles.destroy({
      where: {
        user_id: payload.user_id,
        role_id: {
          [Op.in]: payload.role_ids,
        },
      },
    });
  }

  /**
   * 获取用户所有的角色
   * @param payload
   */
  async getUserRoles(payload) {
    const { ctx, app } = this;
    const res = await ctx.model.UserRoles.findAll({
      where: { user_id: payload.user_id },
      include: [
        {
          model: ctx.model.Roles,
          attributes: {
            exclude: [ 'create_at', 'update_at' ],
          },
        },
      ],
    });
    return res;
  }
}

module.exports = _objectName_Service;
