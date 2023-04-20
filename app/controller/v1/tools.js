'use strict';

const BaseController = require('../base-controller');

/**
* @controller 工具 tools
*/

class ToolsController extends BaseController {
  /**
  * @apikey
  * @summary 工具列表
  * @description 获取所有工具
  * @request query number pageSize
  * @request query number pageNumber
  * @router get tools
  */
  async findAll() {
    const { ctx, service } = this;
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule: ctx.rule.toolsPutBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    const res = await service.tools.findAll(query, queryOrigin);
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 获取某个 工具
  * @description 获取某个 工具
  * @router get tools/:id
  * @request path number *id eg:1
  */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.toolsId, ctx.params);
    const res = await service.tools.findOne(ctx.params);
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 创建 工具
  * @description 创建 工具
  * @router post tools
  * @request body toolsBodyReq
  */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.toolsBodyReq, ctx.request.body);
    await ctx.service.tools.create(ctx.request.body);
    this.CREATED();
  }

  /**
  * @apikey
  * @summary 更新 工具
  * @description 更新 工具
  * @router put tools/:id
  * @request path number *id eg:1
  * @request body toolsPutBodyReq
  */
  async update() {
    const { ctx, service } = this;
    let params = { ...ctx.params, ...ctx.request.body };
    // params.id = Number(params.id);
    ctx.validate(ctx.rule.toolsPutBodyReq, params);
    const res = await service.tools.update(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 删除 工具
  * @description 删除 工具
  * @router delete tools/:id
  * @request path number *id eg:1
  */
  async destroy() {
    const { ctx, service } = this;
    let params = ctx.params;
    // params.id = Number(params.id);
    ctx.validate(ctx.rule.toolsId, params);
    const res = await service.tools.destroy(params);
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 库存操作
  * @description 库存操作
  * @router post tools/:tool_id/inventory
  * @request body toolsInventoryBodyReq
  */
  async inventory() {
    const { ctx, service } = this;
    const params = { ...ctx.request.body, ...ctx.params };
    ctx.validate(ctx.rule.toolsInventoryBodyReq, params);
    // 特殊参数校验
    if (params.type === 4 && !params.receiving_record_id) {
      // 归还时需要传领用记录id
      this.BAD_REQUEST({ message: '领用记录id不能为空' });
      return false;
    }
    const data = await service.tools.findOne({
      id: params.tool_id,
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
    const res = await service.tools.inventory(params);
    res && res[0] !== 0 ? this.SUCCESS() : this.NOT_FOUND();
  }

  /**
  * @apikey
  * @summary 库存操作记录
  * @description 库存操作记录
  * @router get tools/:tool_id/inventory-records
  */
  async inventoryRecords() {
    const { ctx, service } = this;
    const { allRule, query, queryOrigin } = this.findAllParamsDeal({
      rule: ctx.rule.toolsInventoryBodyReq,
      queryOrigin: ctx.query,
    });
    ctx.validate(allRule, query);
    query.where.tool_id = ctx.params.tool_id;
    const res = await service.tools.inventoryRecords(query, queryOrigin);
    this.SUCCESS(res);
  }
}

module.exports = ToolsController;
