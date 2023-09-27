'use strict';

const Service = require('egg').Service;
const { Op } = require('sequelize');

class DeviceModelsService extends Service {
  async findAll (payload, queryOrigin) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { pageSize, pageNumber, prop_order, order, kind = 1 } = payload;
    const { st, et } = queryOrigin;
    let where = {
      ...payload.where,
      company_id,
      kind,
    };
    if (st && et) {
      where.create_at = {
        [Op.between]: [ st, et ],
      };
    }
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    const count = await ctx.model.DeviceModels.count({ where });
    const data = await ctx.model.DeviceModels.findAll({
      limit: pageSize,
      offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
      raw: true,
      where,
      order: Order,
    });
    return {
      data,
      pageNumber,
      pageSize,
      total: count,
    };
  }

  async findOne (payload, options = {}) {
    const { ctx } = this;
    return await ctx.model.DeviceModels.findOne({ where: payload, ...options });
  }

  async create (payload) {
    const { ctx, app } = this;
    const { kind = 1 } = payload;
    const { request_user, department_id, company_id } = ctx.request.header;
    payload = { ...payload, creator: request_user, department_id, company_id, kind };
    payload.id = await app.utils.tools.SnowFlake();
    return await ctx.model.DeviceModels.create(payload);
  }

  async update (payload) {
    const { ctx } = this;
    return await ctx.model.DeviceModels.update(payload, { where: { id: payload.id } });
  }

  async destroy (payload) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    try {
      // 删除模型
      const res = await ctx.model.DeviceModels.destroy({ where: { id: payload.id }, transaction });
      // 删除属性
      await ctx.model.DeviceModelTags.destroy({ where: { model_id: payload.id }, transaction });
      await transaction.commit();
      return res;
    } catch (e) {
      ctx.logger.error(e);
      // 异常情况回滚数据库
      await transaction.rollback();
    }
  }


  async destroyMore(payload) {
    const { ctx } = this;
    const transaction = await ctx.model.transaction();
    try {
      // 删除模型
      const res = await ctx.model.DeviceModels.destroy({ where: { id: payload.ids }, transaction });
      // 删除属性
      await ctx.model.DeviceModelTags.destroy({ where: { model_id: payload.ids }, transaction });
      await transaction.commit();
      return res;
    } catch (e) {
      ctx.logger.error(e);
      // 异常情况回滚数据库
      await transaction.rollback();
    }
  }

  async getDetailAndAttrs (payload) {
    const { ctx } = this;
    return await ctx.model.DeviceModels.findOne({
      where: payload,
      include: [
        {
          model: ctx.model.DeviceModelTags,
          as: 'attrs',
        },
      ],
    });
  }
  async getModelsWithAttrs (payload, queryOrigin) {
    const { ctx } = this;
    const { company_id } = ctx.request.header;
    const { prop_order, order } = payload;
    const { st, et } = queryOrigin;
    let where = {
      ...payload.where,
      company_id,
    };
    if (st && et) {
      where.create_at = {
        [Op.between]: [ st, et ],
      };
    }
    let Order = [];
    prop_order && order ? Order.push([ prop_order, order ]) : null;
    return await ctx.model.DeviceModels.findAll({
      where,
      order: Order,
      include: [
        {
          model: ctx.model.DeviceModelTags,
          as: 'attrs',
        },
      ],
    });
  }

  async createModelAndAttrs (payload, query) {
    const { ctx, app } = this;
    let { id = null, attrs = [], kind = 1 } = payload;
    const { is_cover = 0 } = query;
    const { request_user, company_id, department_id } = ctx.request.header;
    let res = null;
    let params = payload;
    if (id) {
      res = params;
      delete res.kind;
      await ctx.model.DeviceModels.update(params, { where: { id } });
    } else {
      id = await app.utils.tools.SnowFlake();
      params = {
        ...params,
        creator: request_user,
        company_id,
        department_id,
        id,
        kind,
      };
      res = await ctx.model.DeviceModels.create(params, { raw: true });
    }
    // 添加属性
    let failArr = [];
    let addArr = [];
    let names = [];
    // console.log('attrs=========', attrs);
    attrs.forEach(item => {
      if (!names.includes(item.name)) {
        names.push(item.name);
        addArr.push(item);
      } else {
        failArr.push({
          ...item,
          fail_reason: '表内重复',
        });
      }
    });
    // console.log('names=========', names);
    // console.log('addArr=========', addArr);
    let addnames = addArr.map(item => item.name);
    const failDatas = await ctx.model.DeviceModelTags.findAll({
      where: {
        model_id: id,
        name: {
          [Op.in]: addnames,
        },
      },
      raw: true,
    });
    // console.log('failData============', failDatas);
    const failDataNames = failDatas.map(item => item.name);
    let createArr = [];
    let updateArr = [];
    addArr.forEach(item => {
      item = {
        ...item,
        model_id: id,
        kind,
      };
      if (!failDataNames.includes(item.name)) {
        if (item.name.length > 100) {
          failArr.push({
            ...item,
            fail_reason: '属性名长度不符合规则',
          });
        } else {
          createArr.push(item);
        }
      } else {
        if (Number(is_cover) === 1) {
          const data = (failDatas.filter(f => f.name === item.name))[0] || null;
          if (data && data.id) {
            updateArr.push({
              ...item,
              id: data.id,
            });
          }
        } else {
          failArr.push({
            ...item,
            fail_reason: '属性已存在',
          });
        }
      }
    });
    let create_res = [];
    let update_res = [];
    // console.log('createArr===============', createArr);
    // console.log('updateArr===============', updateArr);
    if (createArr && createArr.length) {
      create_res = await ctx.model.DeviceModelTags.bulkCreate(createArr);
    }
    if (updateArr && updateArr.length) {
      updateArr.forEach(async item => {
        // 对比更新数据和已存在的数据是否相同
        const d = (failDatas.filter(f => f.id === item.id))[0];
        // console.log('d============', d);
        // console.log('item============', item);
        if (app.utils.tools.lodash.isEqual(d, item)) {
          console.log(2);
          failArr.push({
            ...item,
            fail_reason: '没有更改',
          });
        } else {
          console.log(1);
          update_res.push(item);
        }
        await ctx.model.DeviceModelTags.update(item, { where: { id: item.id } });
      });
    }
    return res;
  }

  async modelToDirectory (payload, directory) {
    const { ctx, app } = this;
    const { request_user, company_id } = ctx.request.header;
    const { model_id, directory_id, is_cover = 0, kind } = payload;
    let tags = await ctx.model.DeviceModelTags.findAll({ where: { model_id }, raw: true });
    const transaction = await ctx.model.transaction();
    try {
      console.log('目录=======================', directory);
      if (directory) {
        tags = tags.map(t => {
          delete t.id;
          delete t.model_id;
          t.device_id = directory.id;
          t.company_id = company_id;
          t.kind = kind;
          return t;
        });
        console.log('tags====================', tags);
        // 处理覆盖问题
        const addNames = tags.map(item => item.name);
        // 看看当前目录下的点是否已经在的
        const hasTags = await ctx.model.DeviceTags.findAll({
          where: {
            kind, device_id: directory_id, name: {
              [Op.in]: addNames,
            },
          }, transaction, raw: true,
        });
        const hasTagNames = hasTags.map(item => item.name);
        let createDatas = [],
          updateDatas = [];
        tags.forEach(tag => {
          if (hasTagNames.includes(tag.name)) {
            if (Number(is_cover) === 1) {
              const { id = null } = (hasTags.filter(f => f.name === tag.name))[0];
              if (id) {
                updateDatas.push({
                  ...tag,
                  id,
                });
              }
            }
          } else {
            createDatas.push(tag);
          }
        });
        if (createDatas.length) {
          await ctx.model.DeviceTags.bulkCreate(createDatas, { transaction });
        }
        if (updateDatas.length) {
          for (const temp of updateDatas) {
            await ctx.model.DeviceTags.update(temp, { where: { id: temp.id }, transaction });
          }
        }
      }
      await transaction.commit();
      return directory;
    } catch (e) {
      // 异常情况回滚数据库
      await transaction.rollback();
      ctx.logger.error(e);
    }
  }
}

module.exports = DeviceModelsService;
