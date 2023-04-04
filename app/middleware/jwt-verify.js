module.exports = options => {
  return async function jwt_verify(ctx, next) {
    const { url, header: { authorization }, body } = ctx.request;
    const { user_id } = ctx.query;
    // 判断接口路径是否在白名单（在 “router 中使用中间件”中不需要验证这一步）
    const regUrl = url.slice(0, (url.indexOf('?') > 0 ? url.indexOf('?') : url.length));
    // const isInWhiteList = whiteList.includes(regUrl);
    // 实时数据、历史数据、实时报警、历史报警、数据下置等接口如果无token情况下，传递签名，签名校验通过也可放行
    const dataApiList = [ '/api/v1/box-data/data', '/api/v1/box-data/his-data', '/api/v1/box-data/alarm', '/api/v1/box-data/his-alarm', '/api/v1/box-data/down-data' ];
    // 有用户id并且数据相关接口，通过用户校验
    if (user_id && dataApiList.includes(regUrl)) {
      const userInfo = await ctx.app.utils.tools.getRedisCacheUserinfo(user_id);
      // console.log('userInfo', userInfo);
      if (!userInfo) {
        ctx.status = 401;
        ctx.body = {
          message: '用户不存在',
        };
        return false;
      }
      const { state, id, department_id, company_id } = userInfo;
      if (!department_id && department_id !== 0) {
        ctx.status = 403;
        ctx.body = {
          message: '该用户未分配部门',
        };
        return false;
      }
      if (state !== 1) {
        ctx.status = 401;
        ctx.body = {
          message: '账号被停用',
        };
        return false;
      }
      // 将公共参数放到请求头
      ctx.request.header = { ...ctx.request.header, request_user: id, department_id, company_id };
      await next();
      return false;
    }
    // 无用户信息并且是数据相关接口且参数类型是id型则无需校验用户
    if (!user_id && dataApiList.includes(regUrl) && body.param_type && body.param_type === 1) {
      await next();
      return false;
    }
    // 拿到前端传过来的 token
    const token = authorization;
    if (token) {
      // 解密token
      const secret = ctx.app.config.jwt.secret;
      try {
        const decoded = ctx.app.jwt.verify(token, secret) || 'false';
        // console.log('decoded=================', decoded);
        // if (Number(decoded.is_configer) === 1) {
        //   const { CONFIGER_PREFIX, CONFIGER_CHECK_TIME } = ctx.app.config;
        //   const defaultRedis = ctx.app.redis.clients.get('default');
        //   defaultRedis.set(`${CONFIGER_PREFIX}${decoded.user_id}`, 1);
        //   defaultRedis.expire(`${CONFIGER_PREFIX}${decoded.user_id}`, CONFIGER_CHECK_TIME);
        // }
        if (decoded !== 'false' && decoded.type === 'access_token') {
          // 根据用户id获取公司id
          const user = await ctx.app.utils.tools.getRedisCacheUserinfo(decoded.user_id);
          if (!user) {
            ctx.status = 401;
            ctx.body = {
              message: '用户不存在',
            };
            return false;
          }
          const { state, id, department_id, company_id } = user;
          if (!department_id && department_id !== 0) {
            ctx.status = 403;
            ctx.body = {
              message: '该用户未分配部门',
            };
            return false;
          }
          if (state !== 1) {
            ctx.status = 401;
            ctx.body = {
              message: '账号被停用',
            };
            return false;
          }
          // 将公共参数放到请求头
          ctx.request.header = { ...ctx.request.header, request_user: id, department_id, company_id };
          await next();
        } else {
          ctx.status = 401;
          ctx.body = {
            message: '无效token',
          };
        }
      } catch (error) {
        console.log('error=============', error);
        // 解析失败情况
        ctx.status = 401;
        ctx.body = {
          message: '无效token',
        };
      }
    } else {
      ctx.status = 401;
      ctx.body = {
        code: -1,
        message: '无Token',
      };
    }
  };
};
