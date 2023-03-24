const request = require('request');
const fs = require('fs');
const path = require('path');
class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  configWillLoad() {
    // 此时 config 文件已经被读取并合并，但是还并未生效
    // 这是应用层修改配置的最后时机
    // 注意：此函数只支持同步调用
  }

  async didLoad() {
    // 所有的配置已经加载完毕
    // 可以用来加载应用自定义的文件，启动自定义的服务
  }

  async willReady() {
    const { app } = this;
    // 所有的插件都已启动完毕，但是应用整体还未 ready
    // 可以做一些数据初始化等操作，这些操作成功才会启动应用
    // const { IORedisUserKeyPrefix } = app.config;
    // const IORedis = app.redis.clients.get('io');
    // const res = await IORedis.sscan({ match: `${IORedisUserKeyPrefix}*` });
    // console.log('res============================', res);
    // 删除所有用户IO Key
    // 1.将部门列表平铺数据缓存到redis
    app.utils.tools.redisCachePublic('departments', 0, 'departments', 'Departments');
    // 2.将所有权限数据缓存到redis
    app.utils.tools.redisCachePublic('permissions', 0, 'permissions', 'Permissions');
    // 2.将所有权限数据缓存到redis
    app.utils.tools.redisCachePublic('companys', 0, 'companys', 'Companys');
  }

  async didReady() {
    const { app } = this;
    const ctx = app.createAnonymousContext();
    const cameraPhotoRedisPub = app.redis.clients.get('camera_photos');
    const iomRedisPub = app.redis.clients.get('iom');
    // 应用启动完毕
    // 运维消息
    app.messenger.on('iom_redis_expire_subscribe', async message => {
      const messageArr = message.split('__');
      const messageType = messageArr[0];
      // 巡检任务
      if (messageType === 'INSPECTION') {
        const inspectionId = messageArr[1];
        const company_id = messageArr[2];
        app.utils.iom.inspectionPush(inspectionId, company_id);
      }
    });

    // io消息
    app.messenger.on('io_redis_expire_subscribe', async message => {
      const messageArr = message.split('__');
      const messageType = messageArr[0];
      // 巡检任务
      if (messageType === 'ONLINE_USER') {
        const user_id = messageArr[1];
        console.log('user_id', user_id);
        // await app.redis.clients.get('io').srem('onlineUsers', user_id);
      }
    });

    // 摄像头定时拍照任务
    app.messenger.on('camera_photos_redis_expire_subscribe', async message => {
      // 执行对应到期任务
      const messageArr = message.split('__');
      const messageType = messageArr[0];
      // 报警开关恢复
      // key = `CAMERA_PHOTOS__${deviceSerial}__${station_id}`
      if (messageType === 'CAMERA_PHOTOS') {
        // 设备序列号
        const deviceSerial = messageArr[1];
        const station_id = messageArr[2];
        // console.log('序列号===============',deviceSerial);
        try {
          // 查询
          const device = await ctx.model.StationCameras.findOne({
            where: { deviceSerial, station_id },
            raw: true,
          });
          // console.log('device=================',device);
          if (device) {
            // 抓拍
            const accessToken = await app.utils.ysCamera.getAccessToken();
            console.log('accessToken=================', accessToken);
            if (accessToken) {
              const photoRes = await app.utils.ysCamera.cameraPhoto(accessToken, deviceSerial);
              // console.log('photoRes=================',photoRes);
              if (photoRes && photoRes.picUrl) {
                const targetPath = path.join(app.config.baseDir, `../files/camera_photos/${deviceSerial}`);
                const hasPath = await ctx.service.lkysweb.files.dirExists(targetPath);
                if (hasPath) {
                  const picUrl = photoRes.picUrl;
                  let url = picUrl;
                  if (picUrl.indexOf('?') != -1) {
                    url = picUrl.split('?').shift();
                  }
                  const filename = url.split('/').pop();
                  // console.log('filename=================',filename);
                  const target = path.join(app.config.baseDir, `../files/camera_photos/${deviceSerial}/`, filename);
                  request(picUrl).pipe(fs.createWriteStream(target));
                  // 插入数据库
                  await ctx.model.CameraPhotos.create({
                    deviceSerial,
                    url: `/files/camera_photos/${deviceSerial}/${filename}`,
                  });
                }
              }
            }
            if (device.photo_interval) {
              console.log('d==================', device.photo_interval);
              // 抓拍周期有效的情况下，建立新的抓拍任务
              let key = `CAMERA_PHOTOS__${deviceSerial}__${station_id}`;
              cameraPhotoRedisPub.del(key);
              cameraPhotoRedisPub.set(key, 1);
              cameraPhotoRedisPub.expire(key, Number(device.photo_interval));
            }
          }
        } catch (error) {
          ctx.logger.error(error);
        }
      }
    });
  }

  async serverDidReady() {
    // const { app } = this;
    // http / https server 已启动，开始接受外部请求
  }
}

module.exports = AppBootHook;
