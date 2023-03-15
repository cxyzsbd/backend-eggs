'use strict';

const BaseController = require('../base-controller');

/**
* @controller 金蝶对接 kingdee
*/

class KingdeeController extends BaseController {
  /**
  * @apikey
  * @summary 金蝶校验用户
  * @description 金蝶对接校验用户
  * @router post kingdee/validate-user
  * @request query string *auth_code "金蝶校验code"
  */
  async validateUser() {
    const { ctx, app } = this;
    const { KINGDEE_PARAMS: { client_id, client_secret } } = app.utils.tools.globalConfig;
    const params = ctx.query;
    const rule = {
      auth_code: {
        type: 'string',
        required: true,
      },
    };
    ctx.validate(rule, params);
    try {
      const res = await ctx.curl(`https://api.kingdee.com/auth/user/auth_code/validation?client_id=${client_id}&client_secret=${client_secret}&auth_code=${params.auth_code}`, {
        method: 'GET',
        rejectUnauthorized: false,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
        dataType: 'json',
      }).catch(err => {
        console.log(err);
        return false;
      });
      // 根据返回进行判断
      // 1.先判断用户授权是否通过
      if (res && res.errcode == '0') {
        const { uid, nickname, avatar, access_token, expires_in, source } = res.data;
        // 2.在系统中查询用户关联表，看看金蝶用户是否在本系统有对用用户，如果没有则返回无权限
        const user = await ctx.model.KingdeeUsers.findOne({
          where: {
            kingdee_uid: uid,
          },
        });
        if (!user) {
          this.UNAUTHORIZED({ message: '没有找到用户' });
          return false;
        }
        // 通过校验，下发access_token

      } else {
        this.UNAUTHORIZED({ message: '无授权' });
        return false;
      }
    } catch (error) {
      ctx.logger.error(error);
      throw error;
    }
  }
}

module.exports = KingdeeController;
