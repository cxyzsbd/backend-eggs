'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class UserSubAttrsService extends Service {
  async findAll(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    let where = payload.where;
    where.user_id = request_user;
    const data = await ctx.model.UserSubAttrs.findAll({
      where,
    });
    return data;
  }

  async bulkCreate(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    let tempArr = payload.attrs.map(attr => {
      return {
        user_id: request_user,
        attr_id: attr,
        type: payload.type,
      };
    });
    let isHaveArr = await ctx.model.UserSubAttrs.findAll({
      where: {
        [Op.or]: tempArr,
      },
    });
    tempArr = tempArr.filter(item => {
      let temp = isHaveArr.filter(attr => item.attr_id === attr.attr_id && item.type === attr.type);
      if (!temp.length) {
        return item;
      }
    });
    // console.log('tempArr', tempArr);
    if (tempArr.length) {
      return await ctx.model.UserSubAttrs.bulkCreate(tempArr);
    }
    return [];
  }

  async destroy(payload) {
    const { ctx } = this;
    const { request_user } = ctx.request.header;
    return await ctx.model.UserSubAttrs.destroy({ where: {
      attr_id: {
        [Op.in]: payload.attrs,
      },
      user_id: request_user,
    } });
  }
}

module.exports = UserSubAttrsService;
