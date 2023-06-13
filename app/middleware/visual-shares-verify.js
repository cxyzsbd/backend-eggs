module.exports = () => {
  return async function errorHandler(ctx, next) {
    const { id } = ctx.params;
    const { dayjs } = ctx.app.utils.tools;
    const commonRedis = ctx.app.redis.clients.get('common');
    // console.log('params', ctx.params);
    const { ip, header: { authorization, sharepass, captchacode } } = ctx.request;
    // console.log('header==========', ctx.request.header);
    let user = {};
    if (authorization) {
      try {
        user = await ctx.app.utils.tools.decodeTokenInfo(authorization, 'access_token');
      } catch (error) {
        ctx.logger.error(error);
      }
    }
    const prefix = user.id || ip;
    let key = `captcha_count_vsv_${prefix}_${id}`;
    let captchaCount = await commonRedis.get(key) || 0;
    if (!id) {
      ctx.body = { message: '分享不存在' };
      ctx.status = 404;
      return false;
    }
    // 校验分享存不存在
    let visualShares = await ctx.service.cache.get('visualShares', 'common') || [];
    const shareDatas = visualShares.filter(item => item.id === id);
    console.log('shareDatas', shareDatas);
    if (!shareDatas || !shareDatas.length) {
      ctx.body = { message: '分享不存在' };
      ctx.status = 404;
      return false;
    }
    const { invalid_time, share_pass, visual_id, config_path, type } = shareDatas[0];
    // 校验过期
    if (invalid_time && dayjs(invalid_time) <= dayjs()) {
      ctx.body = { message: '分享已过期' };
      ctx.status = 400;
      return false;
    }
    if (captchaCount > 3) {
      if (!captchacode) {
        ctx.body = { message: '分享码错误次数过多,需要额外验证', errno: -62 };
        ctx.status = 400;
        return false;
      }
      // 校验验证码
      let captchakey = `captcha_vsv_${prefix}_${id}`;
      const captchaValue = await commonRedis.get(captchakey);
      if (!captchaValue) {
        ctx.body = { message: '验证码已失效', errno: -62 };
        ctx.status = 400;
        return false;
      }
      if (ctx.app.utils.tools.md5(captchaValue).toLowerCase() !== captchacode.toLowerCase()) {
        ctx.body = { message: '验证码验证失败', errno: -62 };
        ctx.status = 400;
        return false;
      }
      // 校验通过时
      await commonRedis.del(captchakey);
      await commonRedis.del(key);
      captchaCount = 0;
    }
    // 校验密码
    console.log('url===========', ctx.request.url);
    console.log('sharepass============', sharepass);
    console.log('sharepass123213213============', ctx.app.utils.tools.md5(share_pass));
    console.log('share_pass============', share_pass);
    if (ctx.request.url === `/api/v1/visual-shares/${id}/configs` && share_pass && (!sharepass || ctx.app.utils.tools.md5(share_pass) !== sharepass)) {
      commonRedis.set(key, Number(captchaCount) + 1);
      commonRedis.expire(key, 24 * 60 * 60);
      ctx.body = { message: '分享码错误' };
      ctx.status = 400;
      return false;
    }
    ctx.request.header = { ...ctx.request.header, visualId: visual_id, configPath: config_path, viaualType: type };
    await next();
  };
};
