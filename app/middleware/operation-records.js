'use strict';

module.exports = options => {
  return async function recordMiddleware(ctx, next) {
    const { request, query, params } = ctx;
    const { method, url } = request;
    const action = method.toLowerCase();
    if (action === 'get') {
      await next();
      return false;
    }
    const { request_user, company_id } = request.header;
    if (!request_user) {
      await next();
      return false;
    }
    const path = url.slice(0, (url.indexOf('?') > 0 ? url.indexOf('?') : url.length));
    const request_body = { ...request.body, ...params };
    if (request_body.configs) {
      delete request_body.configs;
    }
    let record = {
      user_id: request_user,
      company_id,
      request_body: JSON.stringify(request_body) || null,
      action,
      path,
    };
    const regUrl = `${action}:${path}`;
    let { permissionsAll } = await ctx.app.utils.tools.getRedisCachePublic('permissions');
    permissionsAll = permissionsAll.map(item => {
      const url = `${item.action.toLowerCase()}:${item.url}`;
      const regexp = /\{.*\}/g;// 匹配占位符,匹配{*}
      return { ...item, reg: new RegExp(url.replace(regexp, '\\\d+') + '$') };
    });
    const isInPermissions = permissionsAll.filter(item => item.reg.test(regUrl));
    if (isInPermissions && isInPermissions.length) {
      record.content = `${isInPermissions[0].name}-${isInPermissions[0].mark_name}`;
    }
    await next();
    // 从接口响应判断操作是否成功
    record.response_code = ctx.status;
    if ([ 200, 201 ].includes(record.response_code)) {
      await ctx.model.OperationRecords.create(record);
    }
  };
};
