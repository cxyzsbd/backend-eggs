module.exports = () => {
  return async function errorHandler(ctx, next) {
    const { id } = ctx.params;
    const { dayjs } = ctx.app.utils.tools;
    console.log('params', ctx.params);
    const { sharepass } = ctx.request.header;
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
    // 校验密码
    console.log('url===========', ctx.request.url);
    if (ctx.request.url === `/api/v1/visual-shares/${id}/configs` && share_pass && (!sharepass || share_pass.toLowerCase() !== sharepass.toLowerCase())) {
      ctx.body = { message: '分享验证码错误' };
      ctx.status = 400;
      return false;
    }
    ctx.request.header = { ...ctx.request.header, visualId: visual_id, configPath: config_path, viaualType: type };
    await next();
  };
};
