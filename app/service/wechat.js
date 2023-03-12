const Service = require('egg').Service;

class WxMiniProgramService extends Service {
  async getUserByUnionid(unionid) {
    return await this.ctx.model.UserWechatInfo.findOne({
      where: { unionid },
    });
  }
  async bind(payload) {
    const { ctx } = this;
    return await ctx.model.UserWechatInfo.upsert(payload);
  }
  // 公众号取消关注
  async gh_unsubscribe(gh_openid) {
    const { ctx } = this;
    const user_wechat_info = await ctx.model.UserWechatInfo.findOne({
      where: { gh_openid },
    });
    if (user_wechat_info) {
      if (user_wechat_info.mini_openid) {
        // 更新
        await user_wechat_info.update({
          gh_openid: '',
        });
      } else {
        user_wechat_info.destroy();
      }
    }
  }
}
module.exports = WxMiniProgramService;
