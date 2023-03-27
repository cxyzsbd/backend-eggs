const BaseController = require('../controller/base-controller');
module.exports = () => {
  return async function errorHandler(ctx, next) {
    const { id } = ctx.params;
    const { dayjs } = ctx.app.utils.tools;
    const { sharePass } = ctx.request.header;
    if (!id) {
      BaseController.NOT_FOUND();
      return false;
    }
    // 校验分享存不存在
    let visualShares = await ctx.service.cache.get('visualShares', 'common') || [];
    const shareDatas = visualShares.filter(item => item.id === id);
    if (!shareDatas || !shareDatas.length) {
      BaseController.NOT_FOUND();
      return false;
    }
    const { invalid_time, share_pass } = shareDatas[0];
    // 校验过期
    if (invalid_time && dayjs(invalid_time) <= dayjs()) {
      BaseController.BAD_REQUEST({ message: '分享已过期' });
      return false;
    }
    // 校验密码
    if (!share_pass || !sharePass || share_pass !== sharePass) {
      BaseController.BAD_REQUEST({ message: '分享验证码错误' });
      return false;
    }
    await next();
  };
};
