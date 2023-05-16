const Service = require('egg').Service;

class WxMiniProgramService extends Service {
  async getUserByUnionid(unionid) {
    return await this.ctx.model.UserWechatInfo.findOne({
      where: { unionid },
    });
  }
  async bind(payload) {
    const { ctx } = this;
    const { unionid } = payload;
    const UserWechatInfo = ctx.model.UserWechatInfo;
    const user_wechat_info = await UserWechatInfo.findOne({ where: { unionid } });
    if (user_wechat_info) {
      ctx.logger.error('用户微信绑定bind==================', user_wechat_info);
      return await UserWechatInfo.update(payload, { where: { unionid } });
    }
    ctx.logger.error('微信用户绑定bind，没有绑定数据，新建==================');
    return await UserWechatInfo.create(payload);
  }
  // 公众号取消关注
  async gh_unsubscribe(gh_openid) {
    const { ctx } = this;
    const UserWechatInfo = ctx.model.UserWechatInfo;
    const user_wechat_info = await UserWechatInfo.findOne({
      where: { gh_openid },
      raw: true,
    });
    if (user_wechat_info) {
      if (user_wechat_info.mini_openid) {
        // 更新
        await UserWechatInfo.update({
          gh_openid: '',
        }, { where: { gh_openid } });
      } else {
        UserWechatInfo.destroy({ where: { gh_openid } });
      }
    }
  }
}
module.exports = WxMiniProgramService;
