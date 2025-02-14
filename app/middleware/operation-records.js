'use strict';

module.exports = () => {
  return async function recordMiddleware (ctx, next) {
    const { request, params } = ctx;
    const { method, url } = request;
    let client_ip = null;
    const realIp = ctx.request.get('x-real-ip');
    const xForwardedFor = ctx.request.get('x-forwarded-for');
    // 获取顺序: x-forwarded-for > x-real-ip > ip
    if (xForwardedFor && xForwardedFor.length) {
      client_ip = xForwardedFor.split(',')[0].trim();
    } else if (realIp && realIp.length) {
      client_ip = realIp;
    } else {
      client_ip = ctx.request.ip;
    }
    const action = method.toLowerCase();
    if (action === 'get') {
      await next();
      return false;
    }
    ctx.logger.error('client_ip=============', `x-real-ip:${ctx.request.get('x-real-ip')}`, `x-forwarded-for:${ctx.request.get('x-forwarded-for')}`, `ip:${ctx.request.ip}`);
    const { request_user, company_id, department_id } = request.header;
    if (!request_user) {
      await next();
      return false;
    }
    const path = url.slice(0, (url.indexOf('?') > 0 ? url.indexOf('?') : url.length));
    // 转发接口不用记录
    const reg1 = /^\/api\/v1\/box-data\/([\w-.\/]+)$/;
    const reg2 = /^\/api\/v1\/data-forward\/([\w-.\/]+)$/;
    const reg3 = /^\/api\/v1\/api-forward\/([\w-.\/]+)$/;
    const reg4 = /^\/api\/v1\/cpp-forward\/([\w-.\/]+)$/;
    if (reg1.test(path) || reg2.test(path) || reg3.test(path)) {
      await next();
      return false;
    }
    const request_body = { ...request.body, ...params };
    if (request_body.configs) {
      delete request_body.configs;
    }
    let record = {
      user_id: request_user,
      company_id,
      department_id,
      request_body: JSON.stringify(request_body) || null,
      action,
      path,
      client_ip,
    };
    if (reg4.test(path)) {
      record.request_body = null;
    }
    const regUrl = `${action}:${path}`;
    // console.log('regUrl', regUrl);
    let { permissionsAll } = await ctx.app.utils.tools.getRedisCachePublic('permissions');
    permissionsAll = permissionsAll.map(item => {
      const url = `${item.action.toLowerCase()}:${item.url}`;
      const regexp = /\{[^\/]*\}/g;// 匹配占位符,匹配{*}
      // console.log('reg===========', new RegExp(url.replace(regexp, '.*') + '$'));
      return { ...item, reg: new RegExp(url.replace(regexp, '[^\/]*') + '$') };
    });
    // console.log('permissionsAll', permissionsAll);
    const isInPermissions = permissionsAll.filter(item => item.reg.test(regUrl));
    // console.log('isInPermissions', isInPermissions);
    if (isInPermissions && isInPermissions.length) {
      // console.log('isInPermissions[0]', isInPermissions[0]);
      record.content = `${isInPermissions[0].mark_name}-${isInPermissions[0].name}`;
    }
    await next();
    // 从接口响应判断操作是否成功
    if (isInPermissions && isInPermissions.length) {
      record.response_code = ctx.status;
      record.response_body = ctx.body;
      await ctx.model.OperationRecords.create(record);
      // if ([ 200, 201 ].includes(record.response_code)) {
      //   await ctx.model.OperationRecords.create(record);
      // }
    }
  };
};
