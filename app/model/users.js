/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('users', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: 'id',
    },
    username: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '用户名',
      field: 'username',
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '用户密码',
      field: 'password',
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: '',
      primaryKey: false,
      autoIncrement: false,
      comment: '邮箱',
      field: 'email',
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: '',
      primaryKey: false,
      autoIncrement: false,
      comment: '手机号',
      field: 'phone',
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
      primaryKey: false,
      autoIncrement: false,
      comment: '头像url',
      field: 'avatar',
    },
    department_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '部门id',
      field: 'department_id',
    },
    company_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '公司id',
      field: 'company_id',
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '最后登录时间',
      field: 'last_login',
      get() {
        return this.getDataValue('last_login') ? app.utils.tools.dayjs(this.getDataValue('last_login')).format('YYYY-MM-DD HH:mm:ss') : this.getDataValue('last_login');
      },
    },
    state: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: '1',
      primaryKey: false,
      autoIncrement: false,
      comment: '用户状态(1:正常；0：停用)',
      field: 'state',
    },
    delete_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'delete_at',
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'create_at',
    },
    update_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'update_at',
    },
  }, {
    tableName: 'users',
    // 不删除数据库条目,但将新添加的属性deletedAt设置为当前日期(删除完成时).
    // paranoid 只有在启用时间戳时才能工作
    paranoid: true,
    timestamps: true,
    createdAt: false,
    updatedAt: false,
    deletedAt: 'delete_at',
  });

  Model.associate = function() {
    Model.hasOne(app.model.Departments, { as: 'department', foreignKey: 'id', sourceKey: 'department_id' });
    Model.hasOne(app.model.Companys, { as: 'company', foreignKey: 'id', sourceKey: 'company_id' });
    app.model.Users.belongsToMany(app.model.Roles, {
      through: app.model.UserRoles,
      foreignKey: 'user_id',
      otherKey: 'role_id',
    });
  };

  return Model;
};
