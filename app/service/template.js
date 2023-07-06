'use strict';

const Service = require('egg').Service;
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

class TemplateService extends Service {

    async findAll(payload) {
        const { ctx } = this;
        const { company_id } = ctx.request.header;
        const { pageSize, pageNumber, prop_order, order } = payload;
        let where = payload.where;
        where.company_id = company_id;
        let Order = [];
        if (where.name) {
            where.name = { [Op.like]: `%${where.name}%` }
        } else {
            delete where.name
        }
        prop_order && order ? Order.push([prop_order, order]) : null;
        const count = await ctx.model.Template.count({ where });
        const data = await ctx.model.Template.findAll({
            limit: pageSize,
            offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
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


    async findOne(payload) {
        const { ctx } = this;
        const { company_id } = ctx.request.header;
        payload.company_id = company_id;
        return await ctx.model.Template.findOne({ where: payload, raw: true });
    }

    async create(payload) {
        const { ctx } = this;
        const { request_user, department_id, company_id } = ctx.request.header;
        payload = { ...payload, creator: request_user, department_id, company_id };
        const res = await ctx.model.Template.create(payload);
        return res;
    }

    async update(payload) {
        const { ctx } = this;
        const { id, station_id } = payload;
        if (station_id) {
            let where = {
                station_id,
                id: {
                    [Op.not]: id,
                },
            };
            const data = await ctx.model.Template.findAll({ where });
            if (data && data.length) {
                await await ctx.model.Template.update({ station_id: null }, { where });
            }
        }
        if (payload.configs) {
            // 传了配置，就认为是修改，手动触发更新时间
            payload.update_at = new Date();
        }
        return await ctx.model.Template.update(payload, { where: { id } });
    }

    async destroy(payload) {
        const { ctx } = this;
        return await ctx.model.Template.destroy({ where: { id: payload.id } });
    }


    async findAllComponents(id) {
        const { ctx } = this;
        const folder = await ctx.model.TemplateFolders.findOne({
            where: { id },
            include: [
                {
                    model: ctx.model.Template,
                    as: 'template',
                },
            ],
        });
        return folder;
    }



    async recoveryTemplateList(payload) {
        const { ctx } = this;
        const { pageSize, pageNumber, prop_order, order } = payload;
        const { company_id } = ctx.request.header;
        let where = payload.where;
        where.delete_at = {
            [Op.not]: null,
        };
        where.company_id = company_id;
        let Order = [];
        prop_order && order ? Order.push([prop_order, order]) : null;
        const count = await ctx.model.Template.count({ where, paranoid: false });
        const data = await ctx.model.Template.findAll({
            limit: pageSize,
            offset: (pageSize * (pageNumber - 1)) > 0 ? (pageSize * (pageNumber - 1)) : 0,
            where,
            paranoid: false,
            order: Order,
        });
        return {
            data,
            pageNumber,
            pageSize,
            total: count,
        };
    }
    async forceDelete(payload) {
        const { ctx } = this;
        const { company_id } = ctx.request.header;
        const res = await ctx.model.Template.destroy({ where: { id: payload.id, company_id }, force: true });
        return res;
    }
    async recoveryTemplate(payload) {
        const { ctx } = this;
        const { company_id } = ctx.request.header;
        return await ctx.model.Template.restore({ where: { id: payload.id, company_id }, force: true });
    }

}

module.exports = TemplateService;
