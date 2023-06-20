const dayjs = require('dayjs');
const envConfig = require('../../global.config');
module.exports = class wxTools {
  constructor (app) {
    this.app = app;
    this.ctx = app.createAnonymousContext();
  }

  async getWxAccessToken (invalid_token = false, type = 'xcx') {
    console.log('type==============================', type);
    const { ctx, app } = this;
    // ctx.logger.error('type==============================', type);
    const ioRedis = app.redis.clients.get('io');
    const config =
      type === 'xcx' ? envConfig.WX_XCX_CONFIG : envConfig.WX_GZH_CONFIG;
    const { APPID, APP_SECRET, REDIS_ACCESS_TOKEN_KEY } = config;
    // ctx.logger.error('config==============================', config);
    if (!APPID || !APP_SECRET) {
      return false;
    }
    if (!invalid_token) {
      // 先从redis拿
      const access_token = await ioRedis.get(REDIS_ACCESS_TOKEN_KEY);
      // ctx.logger.error('access_token======================', access_token);
      // redis有则直接返回，没有就请求微信接口
      if (access_token) {
        return { access_token };
      }
      return this.getWxAccessToken(true, type);
    }
    const res = await ctx.curl(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APP_SECRET}`,
      {
        dataType: 'json',
      }
    );
    // ctx.logger.error('access_token接口返回-==================', res);
    // 将access_token存到redis
    if (res.data && res.data.access_token && res.data.expires_in) {
      await ioRedis.set(REDIS_ACCESS_TOKEN_KEY, res.data.access_token);
      await ioRedis.expire(
        REDIS_ACCESS_TOKEN_KEY,
        Number(res.data.expires_in) - 5 * 60
      ); // 存储时间按返回时间减5分钟
    }
    return res.data || null;
  }

  async jscode2session (code) {
    const { ctx } = this;
    const { APPID, APP_SECRET } = envConfig.WX_XCX_CONFIG;
    const wx_info = await ctx.curl(
      `https://api.weixin.qq.com/sns/jscode2session?grant_type=authorization_code&appid=${APPID}&secret=${APP_SECRET}&js_code=${code}`,
      {
        dataType: 'json',
      }
    );
    return wx_info;
  }
  // 公众号openid换unionid
  // 返回格式如下:
  // {
  //   "subscribe": 1,
  //   "openid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M",
  //   "language": "zh_CN",
  //   "subscribe_time": 1382694957,
  //   "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL",
  //   "remark": "",
  //   "groupid": 0,
  //   "tagid_list":[128,2],
  //   "subscribe_scene": "ADD_SCENE_QR_CODE",
  //   "qr_scene": 98765,
  //   "qr_scene_str": ""
  // }
  async wxUserInfoByOpenid (openid, invalid_token = false) {
    const { ctx } = this;
    const access_token_res = await this.getWxAccessToken(invalid_token, 'gzh');
    if (!access_token_res) {
      return false;
    }
    const user_info = await ctx.curl(
      `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${access_token_res.access_token}&openid=${openid}&lang=zh_CN`,
      {
        dataType: 'json',
        method: 'GET',
        contentType: 'json',
      }
    );
    // 全局只有一处获取token的情况可以不考虑失效，可能会无限回调
    // const verify = await this.access_token_invalid_verify(user_info)
    // if(verify) {
    //   return await this.wxUserInfoByOpenid(openid, verify)
    // }
    return user_info;
  }

  /**
   * token失效情况
      40001: 获取 access_token 时 AppSecret 错误，或者 access_token 无效。请开发者认真比对 AppSecret 的正确性，或查看是否正在为恰当的公众号调用接口
      40014: 不合法的 access_token ，请开发者认真比对 access_token 的有效性（如是否过期），或查看是否正在为恰当的公众号调用接口
      42001: access_token 超时，请检查 access_token 的有效期，请参考基础支持 - 获取 access_token 中，对 access_token 的详细机制说明
      42007: 用户修改微信密码， accesstoken 和 refreshtoken 失效，需要重新授权
   * @param {*} res
   * @return
   */
  async access_token_invalid_verify (res) {
    const invalid_codes = [ 40001, 40014, 42001, 42007 ];
    return invalid_codes.includes(res.data.errcode);
  }

  /**
   * 模板消息推送请求基础函数
   * @param {*} data
   * @param {*} invalid_token
   * @param callback
   * @return
   */
  async sendMessageBase (data = null, invalid_token = false, callback = null) {
    const { ctx } = this;
    if (!data) {
      return false;
    }
    const access_token_res = await this.getWxAccessToken(invalid_token, 'gzh');
    console.log('access_token_res=================', access_token_res);
    if (!access_token_res) {
      return false;
    }
    const message_res = await ctx.curl(
      `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token_res.access_token}`,
      {
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          'Content-Type': 'application/json',
        },
        dataType: 'json',
        data,
      }
    );
    console.log('模板消息推送结果============================', message_res);
    // 全局只有一处获取token的情况可以不考虑失效，可能会无限回调
    // const verify = await this.access_token_invalid_verify(message_res)
    // if(verify) {
    //   return await this.sendMessageBase(data, verify)
    // }
    // 回调函数
    if (callback) {
      callback();
    }
  }

  /**
   * 新工单提醒模板消息
   * @param {*} openid
   * @param {*} workOrder
   */
  async sendWorkOrderMessage (openid = null, workOrder = null) {
    const { ctx, app } = this;
    if (!openid || !workOrder) {
      return false;
    }
    ctx.logger.error('新工单提醒模板消息=============', workOrder);
    const { name, desc, id, create_at } = workOrder;
    const data = {
      touser: openid,
      template_id: envConfig.WX_GZH_CONFIG.WORK_ORDER_TEMPLATE_ID,
      data: {
        first: {
          value: '您有一个新的工单，请及时处理!!',
          color: '#333',
        },
        keyword1: {
          value: id,
          color: '#333',
        },
        keyword2: {
          value: app.utils.tools.dayjs(create_at).format('YYYY-MM-DD HH:mm:ss'),
          color: '#333',
        },
        keyword3: {
          value: name || '',
          color: '#333',
        },
        keyword4: {
          value: desc || '',
          color: '#333',
        },
        remark: {
          value: '请前往小程序查看工单详情！',
          color: '#333',
        },
      },
    };
    await this.sendMessageBase(data);
  }

  /**
   * 巡检计划模板消息
   * @param {*} openid
   * @param {*} inspection
   * @param {*} targetCount
   */
  async sendInspectionMessage (openid = null, inspection = null, targetCount) {
    if (!openid || !inspection) {
      return false;
    }
    const data = {
      touser: openid,
      template_id: envConfig.WX_GZH_CONFIG.INSPECTION_TEMPLATE_ID,
      data: {
        first: {
          value: '您有新的巡检任务需要处理!',
          color: '#333',
        },
        keyword1: {
          value: targetCount || 0,
          color: '#333',
        },
        keyword2: {
          value: `${dayjs(inspection.firsttime_date).format(
            'YYYY-MM-DD'
          )}~${dayjs(inspection.end_time).format('YYYY-MM-DD')}`,
          color: '#333',
        },
        remark: {
          value: '请在计划期间内关注小程序巡检任务更新！',
          color: '#333',
        },
      },
    };
    await this.sendMessageBase(data);
  }

  /**
   * 工单审批模板消息
   * @param {*} openid
   * @param {*} orderinfo
   */
  async approverMessage (openid = null, orderinfo = null) {
    if (!openid || !orderinfo) {
      return false;
    }
    const data = {
      touser: openid,
      template_id: envConfig.WX_GZH_CONFIG.WORK_ORDER_APPROVER_ID,
      data: {
        first: {
          value: '您有新的待审批工单!',
          color: '#333',
        },
        keyword1: {
          value: orderinfo.order_name || '',
          color: '#333',
        },
        keyword2: {
          value: orderinfo.order_no,
          color: '#333',
        },
        keyword3: {
          value: orderinfo.creator_name || '',
          color: '#333',
        },
        remark: {
          value: '请及时进行审批！',
          color: '#333',
        },
      },
    };
    await this.sendMessageBase(data);
  }

  /**
   * 工单审批结果模板消息
   * @param {*} openid
   * @param {*} orderinfo
   * @return
   */
  async approverResultMessage (openid = null, orderinfo = null) {
    if (!openid || !orderinfo) {
      return false;
    }
    const { name } = orderinfo;
    const data = {
      touser: openid,
      template_id: envConfig.WX_GZH_CONFIG.WORK_ORDER_APPROVER_RESULT_ID,
      data: {
        first: {
          value: `您创建的工单《${name}》已被审批!`,
          color: '#333',
        },
        keyword1: {
          value: orderinfo.approval_result == 1 ? '通过' : '不通过',
          color: '#333',
        },
        keyword2: {
          value: orderinfo.approver_name || '',
          color: '#333',
        },
        keyword3: {
          value: dayjs(orderinfo.approval_time).format('YYYY-MM-DD HH:mm:ss'),
          color: '#333',
        },
        remark: {
          value:
            orderinfo.approval_result == 2
              ? orderinfo.not_pass_reason
                ? `审批不通过原因：${orderinfo.not_pass_reason}`
                : ''
              : '',
          color: '#333',
        },
      },
    };
    await this.sendMessageBase(data);
  }

  // 新任务提醒(巡检/保养)
  async newTaskMessage ({
    openid = null,
    plan = null,
    task = null,
    type = '巡检',
    callback = null,
  }) {
    const { app } = this;
    const { NEW_TASK_TEMPLATE_ID } = envConfig.WX_GZH_CONFIG;
    if (!NEW_TASK_TEMPLATE_ID) {
      return false;
    }
    const dayjs = app.utils.tools.dayjs;
    if (!plan || !task || !openid) {
      return false;
    }
    const { name, start_time, end_time } = task;
    const { desc, name: plan_name } = plan;
    const data = {
      touser: openid,
      template_id: NEW_TASK_TEMPLATE_ID,
      data: {
        first: {
          value: `您有一个新的${type}任务，请及时处理!`,
          color: '#333',
        },
        keyword1: {
          value: name,
          color: '#333',
        },
        keyword2: {
          value: dayjs
            .duration(dayjs(end_time).diff(dayjs(start_time)))
            .as('hours'),
          color: '#333',
        },
        keyword3: {
          value: desc || '',
          color: '#333',
        },
        keyword4: {
          value: `截止时间:${dayjs(end_time).format('YYYY-MM-DD HH:mm:ss')}`,
          color: '#333',
        },
        keyword5: {
          value: plan_name,
          color: '#333',
        },
        remark: {
          value: '请前往小程序查看任务详情！',
          color: '#333',
        },
      },
    };
    await this.sendMessageBase(data, false, callback);
  }

  async systermAlarmMessage (info = null, callback = null) {
    const { app } = this;
    // console.log('进入推送逻辑==================', info);
    if (!info) {
      return false;
    }
    const { gh_openid, station, device, attr, starttime, content } = info;
    const data = {
      touser: gh_openid,
      template_id: envConfig.WX_GZH_CONFIG.SYSTERM_ALARM_TEMPLATE_ID,
      data: {
        first: {
          value: `站点【${station}】发生报警`,
          color: '#333',
        },
        keyword1: {
          value: `${device}--${attr}`,
          color: '#333',
        },
        keyword2: {
          value: app.utils.tools.dayjs(starttime).format('YYYY-MM-DD HH:mm:ss'),
          color: '#333',
        },
        keyword3: {
          value: content,
          color: '#333',
        },
        remark: {
          value: '更多详情请进入小程序查看',
          color: '#333',
        },
      },
    };
    await this.sendMessageBase(data, false, callback);
  }
};
