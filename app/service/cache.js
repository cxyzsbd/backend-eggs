'use strict';
const Service = require('egg').Service;
const redis = require('redis');

class CacheService extends Service {
  /**
   * redis订阅发布
   * @return
   */
  async redisPubAndSub(db_default=null) {
    const {app} = this
    let db = db_default || app.config.redis.clients.alarm.db
    const CONF = { db };
    const redisPub = redis.createClient(CONF);
    return redisPub;
  }

  /**
   * redis数据存储，所有数据均存储为序列化json字符串
   * @param {*} key 键名
   * @param {*} val 键值
   * @param {*} expir 有效期
   * @param {*} db 配置库名 ,从dbConfig中进行取值
   */
  async set(key, val, expir = 0, db = 'default') {
    const { redis } = this.app;
    const dbRedis = redis.clients.get(db);
    if (expir === 0) {
      return await dbRedis.set(key, JSON.stringify(val));
    }
    return await dbRedis.set(key, JSON.stringify(val), 'EX', expir);
  }

  /**
   * 获取缓存的值
   * @param {*} key 键名
   * @param {*} db 库编号
   */
  async get(key, db = 'default') {
    const { redis } = this.app;
    const dbRedis = await redis.clients.get(db).get(key);
    return JSON.parse(dbRedis);
  }

  /**
   * 删除缓存的值
   * @param {*} key 键名
   * @param {*} db 库编号
   */
  async del(key, db = 'default') {
    const { redis } = this.app;
    const dbRedis = await redis.clients.get(db).del(key);
  }
}
module.exports = CacheService;
