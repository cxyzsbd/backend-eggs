const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const md5 = require('md5');
const { v4: uuidv4 } = require('uuid');
const FlakeId = require('flake-idgen');
const intformat = require('biguint-format');
const quarterOfYear = require('dayjs/plugin/quarterOfYear');
dayjs.extend(quarterOfYear);
module.exports = class Tools {
  constructor(app) {
    this.app = app;
    this.ctx = app.createAnonymousContext();
    this.config = app.config;
    this.logger = app.logger;
    this.dayjs = dayjs;
    this.lodash = lodash;
    this.md5 = md5;
    this.uuidv4 = uuidv4;
  }
  /**
   * 雪花算法生成id
   */
  async SnowFlake() {
    return intformat((new FlakeId({ epoch: 1300000000000 })).next(), 'dec');
    // return intformat((new FlakeId()).next(), 'dec');
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
    return userinfo;
  }
  /**
   * 获取redis中公共数据，不存在及执行存储
   * @param key
   */
  async getRedisCachePublic(key) {
    const { ctx } = this;
    if (![ 'permissions', 'departments', 'companys' ].includes(key)) {
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
      const userinfo = await this.redisCacheUserinfo(id);
      if (!userinfo) {
        return null;
      }
      return await this.getRedisCacheUserinfo(id);
    }
    return data;
  }

  async setAttrsRedisCache() {
    const { ctx } = this;
    // 获取所有的公司、站点、设备、属性
    const companys = await ctx.model.Companys.findAll({ raw: true });
    let newCompanysObj = {};
    companys.forEach(c => {
      newCompanysObj[`attrs_${c.id}`] = c.id;
    });
    const stations = await ctx.model.Stations.findAll({ raw: true });
    let devices = await ctx.model.Devices.findAll({ raw: true });
    const deviceTags = await ctx.model.DeviceTags.findAll({ raw: true });
    await ctx.service.cache.set('attr_tags', deviceTags, 2 * 60 * 60, 'attrs');
    devices = devices.map(d => {
      let tags = deviceTags.filter(t => t.device_id === d.id);
      let tagsObj = {};
      tags.forEach(tag => {
        tagsObj[tag.name.toLowerCase()] = tag.id;
      });
      d.tags = tagsObj;
      return d;
    });
    Object.keys(newCompanysObj).forEach(async key => {
      let stationsArr = stations.filter(s => s.company_id === newCompanysObj[key]);
      let tempObj = {};
      stationsArr.forEach(s => {
        let newObj = {};
        const devicesArr = devices.filter(d => d.station_id === s.id);
        devicesArr.forEach(d => {
          newObj[d.name.toLowerCase()] = d.tags;
        });
        tempObj[s.name.toLowerCase()] = newObj;
      });
      // newCompanysObj[key] = tempObj;
      // 存到redis中
      await ctx.service.cache.set(key, tempObj, 2 * 60 * 60, 'attrs');
    });
    // console.log('companys========', newCompanysObj);
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

  async isParam(param) {
    return !param && param !== 0;
  }

  // 签名规则：
  // 1.先将参数按照`key=value`的形式加入到数组，
  // 2.再将数组按照正序1-9|a-z排序，
  // 3.再用&连接成新的字符串str，
  // 4.最后str拼接秘钥，`str+&secret=sss`的形式再通过md5加密字符串得到签名
  async getSign(params) {
    const secret = this.config.signSecret;
    if (typeof params === 'string') {
      return this.paramsStrSort(params, secret);
    } else if (typeof params === 'object') {
      let arr = [];
      for (let i in params) {
        arr.push((i + '=' + params[i]));
      }
      // console.log('arr', arr);
      return this.paramsStrSort(arr.join(('&')), secret);
    }
  }

  async paramsStrSort(paramsStr, secret) {
    let urlStr = paramsStr.split('&').sort().join('&');
    let newUrl = `${urlStr}&secret=${secret}`;
    return this.md5(newUrl);
  }

  // 处理属性转成长点名统一方法
  async solveParams(type, tags = [], company_id) {
    const { ctx, app } = this;
    // console.log('company_id', company_id);
    const attr_tags = await ctx.service.cache.get('attr_tags', 'attrs');
    const long_attrs = await ctx.service.cache.get(`attrs_${company_id}`, 'attrs');
    // console.log('long_attrs', long_attrs);
    if (type === 1) {
      tags = tags.map(t => Number(t));
      // console.log('tags===========', tags);
      return attr_tags.filter(a => tags.includes(a.id)).map(item => { return { id: item.id, boxcode: item.boxcode, tagname: item.tagname }; });
    } else if (type === 2) {
      let tagArr = tags.map(t => {
        // console.log('t==================', t);
        const long_attr_arr = t.toLowerCase().split('/');
        // console.log('long_attr_arr', long_attr_arr);
        let tagId = long_attrs[long_attr_arr[0]] && long_attrs[long_attr_arr[0]][long_attr_arr[1]] && long_attrs[long_attr_arr[0]][long_attr_arr[1]][long_attr_arr[2]] ? long_attrs[long_attr_arr[0]][long_attr_arr[1]][long_attr_arr[2]] : null;
        // console.log(tagId);
        let tag = attr_tags.filter(a => a.id === tagId);
        let res = {};
        if (tag && tag.length) {
          res = { ...tag[0], t };
        }
        return res;
      });
      return tagArr.map(item => { return { id: item.id, boxcode: item.boxcode, tagname: item.tagname, long_attr: item.t ? item.t : null }; });
    }
  }
};
