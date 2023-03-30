module.exports = () => {
  return async function(ctx, next) {
    const { method, url, header: { request_user } } = ctx.request;
    // console.log('requestbody=====================', body);
    // console.log('requestbody=====================', url);
    // 将当前请求处理成资源标准格式
    const regUrl = `${method.toLowerCase()}:${url.slice(0, (url.indexOf('?') > 0 ? url.indexOf('?') : url.length))}`;
    // 获取所有资源列表和角色资源绑定关系
    let { permissionsAll, role_permissions } = await ctx.app.utils.tools.getRedisCachePublic('permissions');
    // console.log('role_permissions====================', role_permissions);
    // 处理成正则表达式格式
    permissionsAll = permissionsAll.map(item => {
      const url = `${item.action.toLowerCase()}:${item.url}`;
      const regexp = /\{.*\}/g;// 匹配占位符,匹配{*}
      // 将返回的权限替换成改成正则表达式
      // return new RegExp(url.replace(regexp, '\\\d+') + '$');
      return new RegExp(url.replace(regexp, '.*') + '$');
    });
    const isInPermissions = permissionsAll.filter(item => item.test(regUrl));
    // console.log('isInPermissions=============',isInPermissions);
    if (isInPermissions && isInPermissions.length) {
      // const params = { ...body, ...ctx.query };
      // 获取用户所有权限
      const userInfo = await ctx.app.utils.tools.getRedisCacheUserinfo(request_user);
      let roles = userInfo.roles || [];
      roles = roles.map(item => item.id);
      // console.log('roles====================',roles);
      let permissions = [];
      // 根据roles去拿权限列表
      role_permissions.forEach(item => {
        if (roles.includes(item.id)) {
          // console.log('item========================',item);
          permissions = [ ...permissions, ...item.permissions ];
        }
      });
      // 将个人权限列表处理成正则表达式
      permissions = permissions.map(item => {
        const regexp = /\{.*\}/g;// 匹配占位符,匹配{*}
        const p = `${item.action.toLowerCase()}:${item.url}`;
        // 将返回的权限替换成改成正则表达式
        // return new RegExp(p.replace(regexp, '\\\d+') + '$');
        return new RegExp(p.replace(regexp, '.*') + '$');
      });
      let hasAuth = permissions.filter(item => item.test(regUrl));
      // console.log('hasAuth===============',hasAuth);
      if (!hasAuth || !hasAuth.length) {
        // 无权限
        ctx.status = 403;
        ctx.body = {
          code: -1,
          message: '无权限',
        };
        // await next()
      } else {
        // 有权限
        await next();
      }
    } else {
      // 在白名单，无需校验权限
      await next();
    }
  };
};
