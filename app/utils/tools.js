const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
module.exports = class Tools {
  constructor(app) {
    this.app = app;
    this.ctx = app.createAnonymousContext();
    this.config = app.config;
    this.logger = app.logger;
    this.dayjs = dayjs;
    this.lodash = lodash;
  }
  /**
   * 生成唯一编号
   * @param {前缀} prefix
   * 年月日时分秒+毫秒+随机数（毫秒三位，不足前补0，随机数两位，不足前补0，保持单位位数一致）
   */
  async generateSn(prefix) {
    return `${prefix}${this.dayjs().format('YYMMDDHHmmss')}${('000' + Math.floor(Math.random() * 100)).slice(-2)}`;
  }

  /**
   * 生成唯一编号并校验是否存在
   * @param {*} prefix
   * @param modelName
   * @param snName
   */
  async generateOrderNo(prefix, modelName, snName) {
    const { ctx } = this;
    const id = await this.generateSn(prefix);
    // 校验是否已存在
    const where = {};
    where[snName] = id;
    const checkHas = await ctx.model[modelName].findOne({
      where,
    });
    // 如果编号已存在，重新生成
    if (checkHas) {
      this.generateOrderNo(prefix);
      return false;
    }
    return id;
  }

  /**
   * 获取全局公共数据并缓存到redis
   * @param key
   * @param expire
   * @param db
   * @param modelName
   */
  async redisCachePublic(key, expire = 0, db, modelName) {
    const { ctx } = this;
    const data = await ctx.model[modelName].findAll();
    if (key === 'permissions') {
      // 获取角色以及角色和权限绑定关系
      const roles = await ctx.model.Roles.findAll({
        include: [
          {
            model: ctx.model.Permissions,
          },
        ],
      });
      await ctx.service.cache.set('role_permissions', roles, 0, db);
    }
    await ctx.service.cache.set(key, data, expire, db);
  }
  /**
   * 登录获取用户基本信息缓存到redis
   * @param id
   */
  async redisCacheUserinfo(id) {
    const { ctx, app } = this;
    const userinfo = await ctx.model.Users.findOne({
      where: { id },
      include: [
        {
          model: ctx.model.Roles,
        },
      ],
    });
    await ctx.service.cache.set(`userinfo_${id}`, userinfo, app.config.jwt.expire, 'default');
  }
  /**
   * 获取redis中公共数据，不存在及执行存储
   * @param key
   */
  async getRedisCachePublic(key) {
    const { ctx } = this;
    if (![ 'permissions', 'departments' ].includes(key)) {
      return false;
    }
    let data = await ctx.service.cache.get(key, key);
    if (!data) {
      const modelName = key.slice(0, 1).toUpperCase() + key.slice(1).toLowerCase();
      await this.redisCachePublic(key, 0, key, modelName);
      return await this.getRedisCachePublic(key);
    }
    if (key === 'permissions') {
      data = {
        permissionsAll: data,
        role_permissions: await ctx.service.cache.get('role_permissions', key),
      };
    }
    return data;
  }

  /**
   * 从redis中获取用户信息，不存在就查找后存储
   * @param id
   */
  async getRedisCacheUserinfo(id) {
    const { ctx } = this;
    const data = await ctx.service.cache.get(`userinfo_${id}`, 'default');
    if (!data) {
      await this.redisCacheUserinfo(id);
      return await this.getRedisCacheUserinfo(id);
    }
    return data;
  }

  /**
   * 读取路径信息
   * @param {string} path 路径
   */
  getStat(path) {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, stats) => {
        if (err) {
          resolve(false);
        } else {
          resolve(stats);
        }
      });
    });
  }
  async checkHasDir(target) {
    const isExists = await this.getStat(target);
    if (isExists) {
      return true;
    }
    return false;

  }

  /**
  * 创建路径
  * @param {string} dir 路径
  */
  mkdir(dir) {
    return new Promise((resolve, reject) => {
      fs.mkdir(dir, err => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
  * 路径是否存在，不存在则创建
  * @param {string} dir 路径
  */
  async dirExists(dir) {
    const isExists = await this.getStat(dir);
    // 如果该路径且不是文件，返回true
    if (isExists && isExists.isDirectory()) {
      return true;
    } else if (isExists) { // 如果该路径存在但是文件，返回false
      return false;
    }
    // 如果该路径不存在
    const tempDir = path.parse(dir).dir; // 拿到上级路径
    // 递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
    const status = await this.dirExists(tempDir);
    let mkdirStatus;
    if (status) {
      mkdirStatus = await this.mkdir(dir);
    }
    return mkdirStatus;
  }
};
