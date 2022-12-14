const BaseController = require('../base-controller');
const Op = require('sequelize').Op;

/**
 * @Controller 用户 users
 */
class UsersController extends BaseController {
  /**
    * @summary 创建 用户
    * @description 创建 用户
    * @router post users
    * @request body userCreateBodyReq
    */
  async create() {
    const { ctx } = this;
    ctx.validate(ctx.rule.userCreateBodyReq, ctx.request.body);
    const res = await ctx.service.users.create(ctx.request.body);
    if(res && res.message) {
      this.BAD_REQUEST(res)
      return false
    }
    this.CREATED(res);
  }
  /**
   * @summary 更新 用户
   * @description 更新 用户
   * @router put users/:id
   * @request path number *id eg:1 用户id
   * @request body userPutBodyReq
   */
  async update() {
    const { ctx, service, app } = this;
    const {department_id} = ctx.request.header
    const rules = {
      ...ctx.rule.userPutBodyReq,
      username: {
        ...ctx.rule.userPutBodyReq.username,
        required: false,
      },
      password: {
        ...ctx.rule.userPutBodyReq.password,
        required: false,
      },
    };
    const params = { ...ctx.request.body, ...ctx.params };
    ctx.validate(rules, params);
    // console.log('打印===============',params)
    // 判断是不是存在同名用户
    const otherUser = await service.users.findOne({ id: {
      [Op.not]: params.id,
    }, username: params.username }, [], false);
    // console.log('打印otherUser===============',otherUser)
    if (otherUser) {
      this.BAD_REQUEST({ message: '用户名已被注册' });
      return false;
    }
    delete params.last_login;
    delete params.create_at;
    delete params.update_at;
    if(department_id!=0) {
      delete params.password;
    }
    const {res_user, rolesRes} = await service.users.update(params);
    await app.utils.tools.redisCacheUserinfo(params.id);
    if ((res_user && res_user[0]!==0) || (rolesRes && rolesRes.length)) {
      this.SUCCESS();
      return false;
    }
    this.BAD_REQUEST();
  }
  /**
   * @apikey
   * @summary 获取某个 用户
   * @description 获取某个 用户
   * @router get users/:id
   * @request path number *id eg:1 用户id
   */
  async findOne() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.userId, ctx.params);
    const res = await service.users.findOne({ id: ctx.params.id });
    res ? this.SUCCESS(res) : this.NOT_FOUND({ message: '用户不存在' });
  }
  /**
   * @apikey
   * @summary 获取 用户
   * @description 获取 用户
   * @request query string keyword 用户名/邮箱/手机
   * @request query string username 用户名
   * @request query string email 邮箱
   * @request query string phone 手机
   * @request query number state 状态
   * @request query number department_id 部门ID
   * @request query number pageSize pageSize
   * @request query number pageNumber pageNumber
   * @router get users
   */
  async findAll() {
    const { ctx, service } = this;
    const params = {
      keyword: {
        type: 'string',
        trim: true,
        required: false,
        max: 50,
      },
      username: {
        ...ctx.rule.userBodyReq.username,
        required: false,
        min: 1,
      },
      email: {
        ...ctx.rule.userBodyReq.email,
        required: false,
        format: /.*/,
      },
      phone: {
        ...ctx.rule.userBodyReq.phone,
        required: false,
        min: 1,
      },
      state: {
        ...ctx.rule.userBodyReq.state,
        required: false,
      },
      department_id: {
        ...ctx.rule.userBodyReq.department_id,
        required: false,
      },
      date_after_created: {
        type: 'dateTime',
        required: false,
      },
      prop_order: {
        type: 'enum',
        required: false,
        values: [ ...Object.keys(ctx.rule.userPutBodyReq), '' ],
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
        min: 5,
        max: 500,
      },
      pageNumber: {
        type: 'number',
        required: false,
        default: 1,
        min: 1,
      },
    };
    ctx.validate(params, ctx.query);
    const departments = await service.departments.getChildrenById(ctx.request.header.department_id, false)
    const res = await service.users.findAll(ctx.query, departments);
    this.SUCCESS(res);
  }
  /**
   * @apikey
   * @summary 删除 用户
   * @description 删除 用户
   * @router delete users/id
   * @request path number *id eg:1 用户id
   */
  async destroy() {
    const { ctx, service } = this;
    ctx.validate(ctx.rule.userDelBodyReq, ctx.params);
    const res = await service.users.destroy(ctx.params);
    if(res) {
      //删除redis用户信息缓存
      await service.cache.del(ctx.params.id)
    }
    res ? this.NO_CONTENT() : this.NOT_FOUND();
  }

  /**
   * @apikey
   * @summary 登录
   * @description 登录 用户
   * @router post users/login
   * @request body userLoginBodyReq
   */
  async login() {
    const { ctx, service, app } = this;
    const { username, password } = ctx.request.body;
    ctx.validate(ctx.rule.userLoginBodyReq, ctx.request.body);
    // 判断用户是否存在
    const user = await service.users.findOne({ username }, []);
    if (!user) {
      this.BAD_REQUEST({ message: '用户不存在' });
      return false;
    }
    if (user.state !== 1) {
      this.BAD_REQUEST({ message: '账号被停用' });
      return false;
    }
    const { id, email, phone, avatar } = user;
    // 判断密码是否一致
    if (user.password !== password) {
      this.BAD_REQUEST({ message: '密码错误' });
      return false;
    }
    // 生成token并返回
    const access_token = app.jwt.sign({ user_id: user.id, type: 'access_token' }, app.config.jwt.secret, { expiresIn: app.config.jwt.expire });
    const refresh_token = app.jwt.sign({ user_id: user.id, type: 'refresh_token' }, app.config.jwt.secret, { expiresIn: app.config.jwt.refresh_expire });
    const last_login = app.utils.tools.dayjs().format('YYYY-MM-DD HH:mm:ss');
    // 更新登录时间
    await service.users.update({ id, last_login });
    await app.utils.tools.redisCacheUserinfo(id);
    this.SUCCESS({
      access_token,
      refresh_token
    });
  }

  /**
   * @apikey
   * @summary 刷新token
   * @description 刷新token
   * @router post users/refresh-token
   */
  async refreshToken() {
    const { ctx, app } = this;
    const { header } = ctx.request;
    if (!header || !header.refresh_token) {
      this.UNAUTHORIZED({ message: 'refresh_token已失效' });
      return false;
    }
    // 校验refresh_token
    const { secret, expire, refresh_expire } = app.config.jwt;
    try {
      const decoded = ctx.app.jwt.verify(header.refresh_token, secret) || 'false';
      if (decoded !== 'false' && decoded.type === 'refresh_token') {
        // 校验通过,下发新token
        const access_token = app.jwt.sign({ user_id: decoded.user_id, type: 'access_token' }, secret, { expiresIn: expire });
        const refresh_token = app.jwt.sign({ user_id: decoded.user_id, type: 'refresh_token' }, secret, { expiresIn: refresh_expire });
        this.SUCCESS({
          access_token,
          refresh_token,
        });
      } else {
        this.UNAUTHORIZED({ message: 'refresh_token无效' });
      }
    } catch (error) {
      this.UNAUTHORIZED({ message: 'refresh_token无效' });
    }
  }

  /**
  * @apikey
  * @summary 获取用户信息、角色、资源等
  * @description 获取用户信息
  * @router get users/info
  */
  async getInfo() {
    const { ctx, service } = this;
    const res = await service.users.userInfo();
    res ? this.SUCCESS(res) : this.NOT_FOUND();
  }
  /**
  * @apikey
  * @summary 获取当前登录用户菜单
  * @description 获取当前用户菜单列表
  * @router get users/menus
  */
  async getMenus() {
    const { ctx, service } = this;
    const res = await service.users.userMenus();
    this.SUCCESS(res);
  }

  /**
  * @apikey
  * @summary 修改个人信息
  * @description 用户修改自己个人信息
  * @router put users/person-info
  * @request body updatePersonInfoBody
  */
  async updateInfo() {
    const { ctx, service, app } = this;
    const params = ctx.request.body
    const {request_user} = ctx.request.header
    ctx.validate(ctx.rule.updatePersonInfoBody, params)
    params.id = request_user
    // 判断是不是存在同名用户
    if(this.isParam(params.username)) {
      const otherUser = await service.users.findOne({ id: {
        [Op.not]: params.id,
      }, username: params.username }, [], false);
      // console.log('打印otherUser===============',otherUser)
      if (otherUser) {
        this.BAD_REQUEST({ message: '用户名已被注册' });
        return false;
      }
    }
    delete params.last_login;
    delete params.create_at;
    delete params.update_at;
    const {res_user, rolesRes} = await service.users.update(params);
    await app.utils.tools.redisCacheUserinfo(params.id);
    if ((res_user && res_user[0]!==0) || (rolesRes && rolesRes.length)) {
      this.SUCCESS();
      return false;
    }
    this.BAD_REQUEST();
  }
  /**
  * @apikey
  * @summary 修改用户密码
  * @description 修改用户密码
  * @router put users/update-psw
  * @request body updatePasswordBody
  */
  async updatePassword() {
    const { ctx, service, app } = this;
    const params = ctx.request.body
    const {new_password, old_password} = params
    const {request_user} = ctx.request.header
    ctx.validate(ctx.rule.updatePasswordBody, params)
    const user = await service.users.findOne({id: request_user}, [], false)
    if(new_password == old_password) {
      this.BAD_REQUEST({message: "新密码和老密码不能一致"})
      return false
    }
    if(user.password != old_password) {
      this.BAD_REQUEST({message: "密码验证失败"})
      return false
    }
    const res = await ctx.model.Users.update({
      password: new_password
    }, {
      where: {
        id: request_user
      }
    })
    this.SUCCESS({message: "修改成功"});
  }
}
module.exports = UsersController;
