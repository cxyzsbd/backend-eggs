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
  * @request query string *ch
  * @request query string *domain
  */
  async validateUser() {
    const { ctx, app, service } = this;
    ctx.logger.warn('金蝶校验用户', ctx.request);
    ctx.logger.warn('金蝶校验用户body', ctx.request.body);
    ctx.logger.warn('金蝶校验用户query', ctx.query);
    ctx.logger.warn('金蝶校验用户params', ctx.params);
    const { ch, domain } = ctx.query;
    const rule = {
      ch: {
        type: 'string',
        required: true,
      },
      domain: {
        type: 'string',
        required: true,
      },
    };
    ctx.validate(rule, ctx.query);
    console.log('query====================', ctx.query);
    let params = {};
    try {
      const key = app.utils.tools.md5(domain).slice(0, 16);
      params = JSON.parse(await app.utils.tools.aesDecrypt(ch, key));
    } catch (error) {
      this.UNAUTHORIZED({ message: '应用id不匹配' });
      ctx.logger.error(error);
    }
    console.log('params=================', params);
    const { clientId: client_id, clientSecret: client_secret, authCode: auth_code, adminUser: a, rootOrgId: b } = params;
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
          // 只有在金蝶那边是管理员并且在平台没有设置角色的情况下给用户添加管理员角色
          if (a) {
            ctx.logger.warn('金蝶校验用户是管理员', a);
            const userRole = await ctx.model.UserRoles.findAll({ where: { user_id }, raw: true });
            if (!userRole || !userRole.length) {
              ctx.logger.warn('金蝶校验用户是管理员在平台没有角色', userRole);
              const createRoleRes = await ctx.model.UserRoles.create({ user_id, role_id: 1 });
              ctx.logger.warn('金蝶校验用户是管理员在平台没有角色添加管理员角色', createRoleRes);
            }
          }
          // if (!a) {
          //   ctx.logger.warn('金蝶校验用户不是管理员', a);
          //   const userRole = await ctx.model.UserRoles.findOne({ where: { user_id, role_id: 1 }, raw: true });
          //   if (userRole) {
          //     ctx.logger.warn('金蝶校验原角色是管理员,删除角色');
          //     await ctx.model.UserRoles.destroy({ where: { user_id, role_id: 1 } });
          //   }
          // } else {
          //   ctx.logger.warn('金蝶校验用户是管理员', a);
          //   const userRole = await ctx.model.UserRoles.findAll({ where: { user_id }, raw: true });
          //   const AdminRole = userRole.filter(item => item.role_id === 1);
          //   if (!AdminRole || !AdminRole.length) {
          //     ctx.logger.warn('金蝶校验原角色不是管理员，增加管理员角色', AdminRole);
          //     if (userRole && userRole.length) {
          //       ctx.logger.warn('金蝶校验原角色不是管理员，修改角色', userRole);
          //       await ctx.model.UserRoles.update({
          //         role_id: 1,
          //       }, {
          //         where: {
          //           id: userRole[0].id,
          //         },
          //       });
          //     } else {
          //       ctx.logger.warn('金蝶校验原角色不是管理员，创建角色', userRole);
          //       await ctx.model.UserRoles.create({ user_id, role_id: 1 });
          //     }
          //   }
          // }
          // 更新登录时间
          await service.users.update({ id: user_id, last_login });
          await app.utils.tools.redisCacheUserinfo(user_id);
          ctx.rotateCsrfSecret();
          this.SUCCESS({
            access_token: accessToken,
            refresh_token,
            is_super_user,
            expire_time: expires_in,
            csrf_token: ctx.csrf,
            kingdee_access_token: access_token,
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
            kingdee_access_token: access_token,
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

  /**
  * @apikey
  * @summary 登出
  * @description 登出
  * @router post kingdee/logout
  * @request query string *ch
  * @request query string *domain
  */
  async logout() {
    const { ctx, app, service } = this;
    ctx.logger.warn('金蝶用户登出', ctx.request);
    ctx.logger.warn('金蝶用户登出query', ctx.query);
    const { ch, domain, kingdee_access_token } = ctx.query;
    const rule = {
      ch: {
        type: 'string',
        required: true,
      },
      domain: {
        type: 'string',
        required: true,
      },
      kingdee_access_token: {
        type: 'string',
        required: true,
      },
    };
    ctx.validate(rule, ctx.query);
    let params = {};
    try {
      const key = app.utils.tools.md5(domain).slice(0, 16);
      params = JSON.parse(await app.utils.tools.aesDecrypt(ch, key));
    } catch (error) {
      this.UNAUTHORIZED({ message: '应用id不匹配' });
      ctx.logger.error(error);
    }
    const { clientId: client_id, clientSecret: client_secret } = params;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await app.utils.tools.sha1Encrypt(`${client_id}${client_secret}${timestamp}${domain}`);
    try {
      const res = await ctx.curl(`https://api.kingdee.com/auth/oauth2/logout?client_id=${client_id}&signiture=${signature}&timestamp=${timestamp}&redirect_uri=${domain}&access_token=${kingdee_access_token}`, {
        method: 'GET',
        rejectUnauthorized: false,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          accesstoken: kingdee_access_token,
        },
      }).catch(err => {
        ctx.logger.error(err);
        return false;
      });
      ctx.logger.error('金蝶登出结果===============', res);
      this.SUCCESS(res);
    } catch (error) {
      ctx.logger.error(error);
    }
  }
}

module.exports = KingdeeController;
