const { appKey, appSecret } = require('../../global.config').YS_APP_KEY;
module.exports = class YsCamera {
  constructor(app) {
    this.app = app;
    this.ctx = app.createAnonymousContext();
  }
  // 获取accessToken
  async getAccessToken() {
    // 存redis
    const { ctx, app } = this;
    const redisClient = app.redis.clients.get('camera_photos');
    const accessToken = await redisClient.get('ysAccessToken');
    if (accessToken) {
      return accessToken;
    }
    let { data } = await ctx.curl(`https://open.ys7.com/api/lapp/token/get?appKey=${appKey}&appSecret=${appSecret}`, {
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      dataType: 'json',
    }).catch(err => false);
    // console.log('获取token==============',data);
    if (!data || data.code != 200) {
      return false;
    }
    // 存入redis，有效期为7天，存7天-1小时
    await redisClient.set('ysAccessToken', data.data.accessToken);
    await redisClient.expire('ysAccessToken', 167 * 60 * 60);
    return data.data.accessToken;
  }

  // 获取设备播放地址
  async getCameraPlayAddress(accessToken, deviceSerial) {
    // 存redis
    const { ctx, app } = this;
    const redisClient = app.redis.clients.get('camera_photos');
    const playAddress = await redisClient.get(deviceSerial);
    if (playAddress) {
      return playAddress;
    }
    let { data } = await ctx.curl(`https://open.ys7.com/api/lapp/v2/live/address/get?accessToken=${accessToken}&deviceSerial=${deviceSerial}&channelNo=1&protocol=2`, {
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      dataType: 'json',
    }).catch(err => false);
    // console.log('data=================',data);
    if (!data || data.code != 200) {
      return false;
    }
    // 存入redis，计算有效期
    // 通过返回的有效期和当前时间的差值计算过期时间
    const diffTime = app.utils.tools.dayjs(data.data.expireTime).diff(app.utils.tools.dayjs(new Date()), 'seconds');
    await redisClient.set(deviceSerial, data.data.url);
    await redisClient.expire(deviceSerial, Number(Number(diffTime) - 60) || 1);
    return data.data.url;
  }

  // 获取设备列表
  async getDevices(accessToken, pageStart = 0, pageSize = 10) {
    const { ctx, app } = this;
    let { data } = await ctx.curl(`https://open.ys7.com/api/lapp/device/list?accessToken=${accessToken}&&pageStart=${pageStart}&pageSize=${pageSize}`, {
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      dataType: 'json',
    }).catch(err => false);
    if (!data || data.code != 200) {
      return false;
    }
    return {
      data: data.data,
      page: data.page,
    };
  }

  // 获取单个设备信息
  async getDeviceInfo(accessToken, deviceSerial) {
    const { ctx, app } = this;
    let { data } = await ctx.curl(`https://open.ys7.com/api/lapp/device/info?accessToken=${accessToken}&deviceSerial=${deviceSerial}`, {
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      dataType: 'json',
    }).catch(err => false);
    if (!data || data.code != 200) {
      return false;
    }
    return data.data;
  }

  // 设备抓拍图片
  async cameraPhoto(accessToken, deviceSerial) {
    const { ctx, app } = this;
    let { data } = await ctx.curl(`https://open.ys7.com/api/lapp/device/capture?accessToken=${accessToken}&deviceSerial=${deviceSerial}`, {
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      dataType: 'json',
    }).catch(err => false);
    if (!data || data.code != 200) {
      return false;
    }
    return data.data;
  }
};
