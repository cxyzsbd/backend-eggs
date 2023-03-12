const { Controller } = require('egg');
const lodash = require('lodash');
const Op = require('sequelize').Op;
class BaseController extends Controller {
  // 200 OK：成功
  SUCCESS(body = { message: '成功' }) {
    const ctx = this.ctx;
    ctx.body = body;
    ctx.status = 200;
  }
  // 201 Created：创建成功
  CREATED(body = { message: '插入数据成功' }) {
    const ctx = this.ctx;
    ctx.body = body;
    ctx.status = 201;
  }
  // 204 No Content：删除成功
  NO_CONTENT(body = { message: '删除成功' }) {
    const ctx = this.ctx;
    ctx.body = body;
    // ctx.status = 204;
    ctx.status = 200;
  }
  // 400 Bad Request：服务器不理解客户端的请求，未做任何处理。
  BAD_REQUEST(body = { message: '错误的请求,无操作' }) {
    const ctx = this.ctx;
    ctx.body = body;
    ctx.status = 400;
  }
  // 400 Bad Request：无效请求。
  INVALID_REQUEST(body = { message: '无效的请求' }) {
    const ctx = this.ctx;
    ctx.body = body;
    ctx.status = 400;
  }
  // 401 Unauthorized：用户未提供身份验证凭据，或者没有通过身份验证。
  UNAUTHORIZED(body = { message: '身份校验失败' }) {
    const ctx = this.ctx;
    ctx.body = body;
    ctx.status = 401;
  }
  // 403 Forbidden：用户通过了身份验证，但是不具有访问资源所需的权限。
  FORBIDDEN(body = { message: '无权限' }) {
    const ctx = this.ctx;
    ctx.body = body;
    ctx.status = 403;
  }
  // 404 Not Found：所请求的资源不存在，或不可用。
  NOT_FOUND(body = { message: '资源未找到或无操作' }) {
    const ctx = this.ctx;
    ctx.body = body;
    ctx.status = 404;
  }
  // Unprocessable Entity ：参数格式校验错误
  VALIDATION_FAILED(body = { message: '参数错误' }) {
    const ctx = this.ctx;
    ctx.body = body;
    ctx.status = 422;
  }
  // Unprocessable Entity ：参数格式校验错误
  SERVER_ERROR(body = { message: '服务端错误' }) {
    const ctx = this.ctx;
    ctx.body = body;
    ctx.status = 500;
  }

  /**
   * findAll请求根据rule处理query值
   * @param rule 规则
   * @param queryOrigin 原请求参数
   * @param ruleOther 追加规则
   * @param findAllParamsOther 追加搜索字段
   * @param keywordLikeExcludeParams 关键字keyword模糊搜索排除字段
   * @param options
   * @return {{query: {where: {}}, allRule: {offset: {default: number, type: string, required: boolean}, prop_order: {values, type: string, required: boolean}, limit: {type: string, required: boolean}, order: {values: [string, string, string], type: string, required: boolean}}}}
   */
  findAllParamsDeal(options) {
    let { rule, queryOrigin, ruleOther = {}, findAllParamsOther = {}, keywordLikeExcludeParams = [] } = options;
    queryOrigin.pageNumber = Number(queryOrigin.pageNumber) || 1;
    queryOrigin.pageSize = (Number(queryOrigin.pageSize) || Number(queryOrigin.pageSize) <= 0) ? Number(queryOrigin.pageSize) : 20;
    const _rule = lodash.cloneDeep(rule);
    const query = {
      where: {},
    };
    for (const ruleKey in _rule) {
      // 如果规则是数组，则视为枚举类型
      if (Array.isArray(_rule[ruleKey])) {
        _rule[ruleKey] = {
          type: 'enum',
          values: _rule[ruleKey],
        };
      }
      _rule[ruleKey].required = false;
    }
    const findAllParams = {
      keyword: {
        type: 'string',
        trim: true,
        required: false,
        max: 36,
      },
      prop_order: {
        type: 'enum',
        required: false,
        values: [ ...Object.keys(_rule), '' ],
      },
      order: {
        type: 'enum',
        required: false,
        values: [ 'desc', 'asc', '' ],
      },
      pageSize: {
        type: 'number',
        required: false,
        default: 20,
      },
      pageNumber: {
        type: 'number',
        required: false,
        default: 1,
      },
      ...findAllParamsOther,
    };
    const allRule = {
      ..._rule,
      ...ruleOther,
      ...findAllParams,
    };
    // 根据rule处理query，剔除非rule检查字段
    for (const queryKey in queryOrigin) {
      if (_rule.hasOwnProperty(queryKey)) {
        query.where[queryKey] = queryOrigin[queryKey];
      }
      if (allRule.hasOwnProperty(queryKey)) {
        query[queryKey] = queryOrigin[queryKey];
      }
    }
    // 如果搜索参数queryOrigin中带有keyword，且不为空字符串，则视keyword为模糊搜索
    if (queryOrigin.hasOwnProperty('keyword') && queryOrigin.keyword.trim() !== '') {
      query.where[Op.or] = [];
      for (const queryKey in _rule) {
        // 非模糊搜索排除字段的所有rule中的字段, 且数据类型为string，做模糊查询
        if (!keywordLikeExcludeParams.includes(queryKey) && _rule[queryKey].type === 'string') {
          query.where[Op.or].push({ [queryKey]: { [Op.like]: `%${queryOrigin.keyword.trim()}%` } });
        }
      }
    }
    return {
      allRule,
      query,
      queryOrigin,
    };
  }

  async isParam(param) {
    return !param && param !== 0;
  }
}
module.exports = BaseController;
