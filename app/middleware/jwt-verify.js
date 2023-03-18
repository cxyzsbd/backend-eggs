const whiteList = [ '/api/v1/users/login', '/api/v1/users/refresh-token', '/doc', '/api/v1/wx-mini/login', '/api/v1/wx-mini/bind', '/api/v1/alarms', '/api/v1/kingdee/validate-user' ];

module.exports = options => {
  return async function jwt_verify(ctx, next) {
    const { method, url, header: { authorization } } = ctx.request;
    // 判断接口路径是否在白名单（在 “router 中使用中间件”中不需要验证这一步）
    const regUrl = url.slice(0, (url.indexOf('?') > 0 ? url.indexOf('?') : url.length));
    const isInWhiteList = whiteList.includes(regUrl);
    if (!isInWhiteList) {
      // 拿到前端传过来的 token
      const token = authorization;
      // 实时数据、历史数据、实时报警、历史报警、数据下置等接口如果无token情况下，传递签名，签名校验通过也可放行
      if ([ '/api/v1/box-data/data', '/api/v1/box-data/his-data', '/api/v1/box-data/alarm', '/api/v1/box-data/his-alarm', '/api/v1/box-data/down-data' ].includes(regUrl)) {
        const { sign, user_id } = ctx.query;
        if (sign) {
          if (user_id) {
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
            if (state !== 1) {
              ctx.status = 401;
              ctx.body = {
                message: '账号被停用',
              };
              return false;
            }
            // 将公共参数放到请求头
            ctx.request.header = { ...ctx.request.header, request_user: id, department_id, company_id };
          }
          let params = { ...ctx.query, ...ctx.request.body };
          console.log('params', params);
          let newParams = ctx.app.utils.tools.lodash.cloneDeep(params);
          delete newParams.sign;
          const verifySign = await ctx.app.utils.tools.getSign(newParams);
          console.log('verifySign', verifySign);
          if (verifySign === sign) {
            console.log('通过', ctx.request.header);
            await next();
            return false;
          }
        }
      }
      if (token) {
        // 解密token
        const secret = ctx.app.config.jwt.secret;
        try {
          const decoded = ctx.app.jwt.verify(token, secret) || 'false';
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
            if (state !== 1) {
              ctx.status = 401;
              ctx.body = {
                message: '账号被停用',
              };
              return false;
            }
            await ctx.app.redis.clients.get('io').set(`ONLINE_USER__${id}`, 1);
            await ctx.app.redis.clients.get('io').expire(`ONLINE_USER__${id}`, 5 * 60);
            await ctx.app.redis.clients.get('io').sadd('onlineUsers', id);
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
    } else {
      await next();
    }
  };
};
