'use strict';

const Service = require('egg').Service;

class KingdeeService extends Service {

  async create (payload) {
    const { ctx } = this;
    // console.log('用户参数', payload);
    const { uid, username, avatar = '', phone = '', email = '', state = 1, company_id = 1, role = null } = payload;
    const defaultPassword = 'e10adc3949ba59abbe56e057f20f883e';
    const transaction = await ctx.model.transaction();
    try {
      let user = await ctx.model.Users.create({
        username,
        avatar,
        password: defaultPassword,
        phone,
        email,
        state,
        company_id,
        department_id: Number(role) === 1 ? 0 : null,
      }, { transaction });
      await ctx.model.KingdeeUsers.findOrCreate({
        where: {
          kingdee_uid: uid,
          user_id: user.id,
        },
        transaction,
      });
      if (role) {
        // 设置角色
        await ctx.model.UserRoles.findOrCreate({
          where: {
            user_id: user.id,
            role_id: role,
          },
          transaction,
        });
      }
      await transaction.commit();
      return user;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async findOne (uid) {
    const { ctx } = this;
    return await ctx.model.KingdeeUsers.findOne({
      where: {
        kingdee_uid: uid,
      },
      include: [
        {
          model: ctx.model.Users,
          as: 'userinfo',
        },
      ],
    });
  }
}

module.exports = KingdeeService;
