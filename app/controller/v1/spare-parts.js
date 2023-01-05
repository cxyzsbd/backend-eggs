'use strict';

const BaseController = require('../base-controller');

/**
* @controller 备品备件 spare-parts
*/

class SparePartsController extends BaseController {
  /**
  * @apikey
  * @summary 备品备件列表
  * @description 获取所有备品备件
  * @request query number pageSize
  * @request query number pageNumber
  * @router get spare-parts
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.sparePartsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.spareParts.findAll(query);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 备品备件
  * @description 获取某个 备品备件
  * @router get spare-parts/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.sparePartsId, ctx.params);
    const res = await service.spareParts.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 备品备件
  * @description 创建 备品备件
  * @router post spare-parts
  * @request body sparePartsBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.sparePartsBodyReq, ctx.request.body);
    await ctx.service.spareParts.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 备品备件
  * @description 更新 备品备件
  * @router put spare-parts/:id
  * @request path number *id eg:1
  * @request body sparePartsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    params.id = Number(params.id);
    ctx.validate(ctx.rule.sparePartsPutBodyReq, params);
    const res = await service.spareParts.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 备品备件
  * @description 删除 备品备件
  * @router delete spare-parts/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    params.id = Number(params.id);
    ctx.validate(ctx.rule.sparePartsId, params);
    const res = await service.spareParts.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 库存操作
  * @description 库存操作
  * @router post spare-parts/:spare_parts_id/inventory
  * @request body sparePartsInventoryBodyReq
  */
  async inventory() {
    const { ctx, service } = this;
    const params = { ...ctx.request.body, ...ctx.params };
    ctx.validate(ctx.rule.sparePartsInventoryBodyReq, params);
    // 特殊参数校验
    if (params.type === 4 && !params.receiving_record_id) {
      // 归还时需要传领用记录id
      this.BAD_REQUEST({ message: '领用记录id不能为空' });
      return false;
    }
    const data = await service.spareParts.findOne({
      id: params.spare_parts_id,
    });
    if (!data) {
      this.NOT_FOUND();
      return false;
    }
    // 出库/领用需要判断操作数量是否大于库存数
    if ([ 2, 3 ].includes(params.type) && data.inventory < params.quantity) {
      this.BAD_REQUEST({ message: '操作数量不能大于库存数' });
      return false;
    }
    if (params.type === 4) {
      // 如果是归还，判断归还的是哪一条领用记录，归还数不能大于该次领用数
      const inventoryRecord = await service.toolInventoryRecords.findOne({ id: params.receiving_record_id });
      if (!inventoryRecord) {
        this.NOT_FOUND({ message: '领用记录不存在' });
        return false;
      }
      // 未归还数量
      const tempQuantity = Number(inventoryRecord.quantity - inventoryRecord.remand_quantity);
      if (tempQuantity < params.quantity) {
        this.BAD_REQUEST({ message: '归还数量不能超过未归还数量' });
        return false;
      }
    }
    const res = await service.spareParts.inventory(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 库存操作记录
  * @description 库存操作记录
  * @router get spare-parts/:spare_parts_id/inventory-records
  */
  async inventoryRecords() {
    const { ctx, service } = this;
    const { allRule, query } = this.findAllParamsDeal({
      rule: ctx.rule.sparePartsInventoryBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    query.where.spare_parts_id = ctx.params.spare_parts_id;
    const res = await service.spareParts.inventoryRecords(query);
    this.SUCCESS(res);
  }
}

module.exports = SparePartsController;
