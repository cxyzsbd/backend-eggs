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
  * @router get kingdee/validate-user
  * @request query string *auth_code "金蝶校验code"
  */
  async validateUser() {
    const { ctx, app, service } = this;
    ctx.logger.warn('金蝶校验用户', ctx.request);
    ctx.logger.warn('金蝶校验用户body', ctx.request.body);
    ctx.logger.warn('金蝶校验用户query', ctx.query);
    ctx.logger.warn('金蝶校验用户params', ctx.params);
    const { KINGDEE_PARAMS: { client_id, client_secret } } = app.utils.tools.globalConfig;
    const params = ctx.query;
    const rule = {
      auth_code: {
        type: 'string',
        required: true,
      },
      a: {
        type: 'string',
        required: true,
      },
      b: {
        type: 'string',
        required: true,
      },
    };
    ctx.validate(rule, params);
    const { auth_code, a, b } = params;
    console.log('params=================', params);
    try {
      const res = await ctx.curl(`https://api.kingdee.com/auth/user/auth_code/validation?client_id=${client_id}&client_secret=${client_secret}&auth_code=${auth_code}`, {
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
      if (res.data && res.data.errcode == '0') {
        const { uid, nickname, avatar, access_token, expires_in, source } = res.data.data;
        ctx.logger.warn('金蝶校验授权结果', res.data.data);
        // 2.在系统中查询用户关联表，看看金蝶用户是否在本系统有对用用户，如果没有则返回无权限
        const asyncUser = await service.kingdee.findOne(uid, true);
        ctx.logger.warn('金蝶校验关联表查询结果', asyncUser);
        // console.log('asyncUser=========', asyncUser);
        // console.log('userinfo=========', asyncUser.userinfo);
        if (asyncUser && asyncUser.userinfo) {
          // 生成token并返回
          let is_super_user = false;
          // if (!asyncUser.userinfo.company_id) {
          //   is_super_user = true;
          // }
          const { user_id } = asyncUser;
          const accessToken = app.jwt.sign({ user_id, type: 'access_token', is_super_user }, app.config.jwt.secret, { expiresIn: expires_in });
          const refresh_token = app.jwt.sign({ user_id, type: 'refresh_token', is_super_user }, app.config.jwt.secret, { expiresIn: app.config.jwt.refresh_expire });
          const last_login = app.utils.tools.dayjs().format('YYYY-MM-DD HH:mm:ss');
          // 更新登录时间
          await service.users.update({ id: user_id, last_login });
          await app.utils.tools.redisCacheUserinfo(user_id);
          this.SUCCESS({
            access_token: accessToken,
            refresh_token,
            is_super_user,
            expire_time: expires_in,
          });
          return false;
        }
        // 同步公司
        const [ company, created ] = await ctx.model.Companys.findOrCreate({
          where: {
            kingdee_company: b,
          },
          defaults: {
            name: '默认公司',
          },
        });
        ctx.logger.warn('金蝶校验查找或创建用户', company, created);
        // console.log('company====================', company);
        const role = a == 'true' ? 1 : '';
        ctx.logger.warn('金蝶校验用户角色', role);
        // console.log('role=================', role);
        // 同步用户
        const createRes = await service.kingdee.create({ uid, username: `${nickname}_${uid}`, avatar, company_id: company.id, role });
        ctx.logger.warn('金蝶校验同步用户结果', createRes);
        if (createRes) {
          const { id } = createRes;
          // 生成token并返回
          let is_super_user = false;
          const accessToken = app.jwt.sign({ user_id: id, type: 'access_token', is_super_user }, app.config.jwt.secret, { expiresIn: expires_in });
          const refresh_token = app.jwt.sign({ user_id: id, type: 'refresh_token', is_super_user }, app.config.jwt.secret, { expiresIn: app.config.jwt.refresh_expire });
          const last_login = app.utils.tools.dayjs().format('YYYY-MM-DD HH:mm:ss');
          // 更新登录时间
          await service.users.update({ id, last_login });
          await app.utils.tools.redisCacheUserinfo(id);
          this.SUCCESS({
            access_token: accessToken,
            refresh_token,
            is_super_user,
            expire_time: expires_in,
          });
        }
      } else {
        this.UNAUTHORIZED(res.data || { message: '无授权' });
        return false;
      }
    } catch (error) {
      ctx.logger.error(error);
      throw error;
    }
  }

  /**
  * @apikey
  * @summary 同步用户数据
  * @description 同步用户数据
  * @router post kingdee/synchronize-user
  * @request body kingdeeAddUserBodyReq
  */
  async synchronizeUser() {
    const { ctx, app, service } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.kingdeeAddUserBodyReq, params);
    console.log(ctx.request);
    // 判断用户是否已存在
    const user = await service.kingdee.findOne(params.uid);
    if (user) {
      // 存在
      this.SUCCESS({ message: '用户已存在' });
      return false;
    }
    // 不存在,添加
    const res = await service.kingdee.create(params);
    res ? this.SUCCESS() : this.SERVER_ERROR({ message: '同步失败' });
  }
}

module.exports = KingdeeController;
