const BaseController = require('../base-controller');
const crypto = require('crypto');
const XML2JSON = require('xml2js');

/**
 * @controller 微信小程序
 */
class MiniProgramController extends BaseController {
  async getAccessToken () {
    const { app } = this;
    const res = await app.utils.wx.getWxAccessToken();
    this.SUCCESS(res);
  }
  /**
   * @apikey
   * @summary 微信小程序 登录
   * @description 微信小程序登录
   * @router post wx-mini/login
   * @request body wxLoginCodeReq
   */
  async login () {
    const { ctx, app, service } = this;
    ctx.validate(ctx.rule.wxLoginCodeReq, ctx.request.body);
    // 获取openid和unionid
    const wx_info = await app.utils.wx.jscode2session(ctx.request.body.code);
    const wx_user = await service.wechat.getUserByUnionid(wx_info.data.unionid);
    let isbind_user = true;
    if (!wx_user || !wx_user.user_id) {
      isbind_user = false;
      this.UNAUTHORIZED({ message: '没有绑定用户', isbind_user });
      return false;
    }
    const access_token = app.jwt.sign({ user_id: wx_user.user_id, type: 'access_token' }, app.config.jwt.secret, { expiresIn: app.config.jwt.expire });
    const refresh_token = app.jwt.sign({ user_id: wx_user.user_id, type: 'refresh_token' }, app.config.jwt.secret, { expiresIn: app.config.jwt.refresh_expire });
    // 生成token并返回
    const { username, email, phone, avatar } = await service.users.findOne({ id: wx_user.user_id }, []);
    const last_login = app.utils.tools.dayjs().format('YYYY-MM-DD HH:mm:ss');
    // 更新登录时间
    await service.users.update({ id: wx_user.user_id, last_login });
    ctx.rotateCsrfSecret();
    this.SUCCESS({
      access_token,
      refresh_token,
      csrf_token: ctx.csrf,
      userinfo: {
        username,
        email,
        phone,
        avatar,
        last_login,
        user_id: wx_user.user_id,
      },
      isbind_user,
    });
  }

  /**
   * @apikey
   * @summary 微信小程序 绑定
   * @description 微信小程序绑定用户
   * @router post wx-mini/bind
   * @request body wxBindBodyReq
   */
  async bind () {
    const { ctx, app, service } = this;
    const params = ctx.request.body;
    ctx.validate(ctx.rule.wxBindBodyReq, params);
    // 1.判断用户是否存在
    const user = await service.users.findOne({ username: params.username }, []);
    if (!user) {
      this.NOT_FOUND({ message: '用户不存在' });
      return false;
    }
    // 2.判断用户密码是否正确
    if (params.password !== user.password) {
      this.INVALID_REQUEST({ message: '密码不正确' });
      return false;
    }
    // 3.获取微信用户unionid和openid
    const wx_info = await app.utils.wx.jscode2session(ctx.request.body.code);
    // console.log('wx_info', wx_info);
    // 4.绑定
    const bindRes = await service.wechat.bind({
      user_id: user.id,
      mini_openid: wx_info.data.openid,
      unionid: wx_info.data.unionid,
    });
    if (!bindRes) {
      this.INVALID_REQUEST({ message: '绑定失败' });
      return false;
    }
    // 5.生成token并返回
    const token = app.jwt.sign({ user_id: user.id }, app.config.jwt.secret);
    const last_login = app.utils.tools.dayjs().format('YYYY-MM-DD HH:mm:ss');
    // 更新登录时间
    await service.users.update({ id: user.id, last_login });
    const { username, email, phone, avatar } = user;
    this.SUCCESS({
      token,
      userinfo: {
        username,
        email,
        phone,
        avatar,
        last_login,
      },
    });
  }

  /**
   * 关注公众号
   * 解析结果格式如下:
   *  {
   *     xml: {
   *      ToUserName: [ 'gh_5f53cfc9738b' ],
   *      FromUserName: [ 'oEE6B1hWWa8mRZdi24vV1lUscJJ8' ],
   *      CreateTime: [ '1658921208' ],
   *      MsgType: [ 'event' ],
   *      Event: [ 'unsubscribe' ],
   *      EventKey: [ '' ]
   *    }
   *  }
   */
  async subscribe () {
    const { ctx, app, service } = this;
    const params = ctx.request.query;
    const TOKEN = 'linhoon';
    const key = [ TOKEN, params.timestamp, params.nonce ].sort().join('');
    const sha1 = crypto.createHash('sha1');
    sha1.update(key);
    const sign = sha1.digest('hex');
    // 对比加密结果
    if (sign !== params.signature) {
      ctx.body = 'signature fail';
      return false;
    }
    if (ctx.request.method === 'GET') {
      ctx.body = params.echostr;
      return false;
    }
    // POST
    const body = ctx.request.body;
    const data = await XML2JSON.parseStringPromise(body.toString());
    const event = data.xml.Event[0];
    const FromUserName = data.xml.FromUserName[0];
    // 关注事件（subscribe）：用户关注公众号触发的事件。
    if (event === 'subscribe') {
      // 关注
      const wx_user_info_res = await app.utils.wx.wxUserInfoByOpenid(FromUserName);
      if (!wx_user_info_res) {
        return false;
      }
      const wx_user_info = wx_user_info_res.data;
      // console.log('wx_user_info_res', wx_user_info_res);
      // console.log('wx_user_info', wx_user_info);
      if (wx_user_info.subscribe) {
        // 只有关注状态下才能拿到用户信息
        // await service.wechat.bind({
        //   gh_openid: wx_user_info.openid || FromUserName,
        //   unionid: wx_user_info.unionid || 'o06sk5nnE7lOx_b1zyGUFWbzdV60'
        // })
        await service.wechat.bind({
          gh_openid: wx_user_info.openid,
          unionid: wx_user_info.unionid,
        });
      }
    }
    // 取消关注事件（unsubscribe）：用户取消关注公众号触发的事件。
    if (event === 'unsubscribe') {
      ctx.logger.error('unsubscribe================', event);
      // 取消关注
      // console.log('openid2', FromUserName);
      await service.wechat.gh_unsubscribe(FromUserName);
    }
    // 扫描带参二维码事件（SCAN）：用户扫描带有参数的二维码触发的事件。
    // 上报地理位置事件（LOCATION）：用户上报地理位置信息触发的事件。
    // 自定义菜单点击事件（CLICK）：用户点击自定义菜单触发的事件。
    // 模板消息发送完成事件（TEMPLATESENDJOBFINISH）：模板消息发送完成后触发的事件。
    // 点击菜单跳转链接事件（VIEW）：用户点击菜单跳转链接触发的事件。
    // 群发消息发送完成事件（MASSSENDJOBFINISH）：群发消息发送完成后触发的事件
    ctx.body = 'success';
  }
}
module.exports = MiniProgramController;
