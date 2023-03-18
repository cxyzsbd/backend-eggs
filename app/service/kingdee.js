'use strict';

const Service = require('egg').Service;

class KingdeeService extends Service {

  async create(payload) {
    const { ctx } = this;
    const { uid, username, avatar = '', phone = '', email = '', state = 1 } = payload;
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
        company_id: 1,
      }, { transaction });
      await ctx.model.KingdeeUsers.findOrCreate({
        where: {
          kingdee_uid: uid,
          user_id: user.id,
        },
        transaction,
      });
      await transaction.commit();
      return user;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }

  async findOne(uid) {
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
