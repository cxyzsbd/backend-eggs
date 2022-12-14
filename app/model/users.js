/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('users', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: ''
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: ''
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    department_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true
    },
    last_login: {
      type: DataTypes.TIME,
      allowNull: true,
      get() {
        return this.getDataValue('last_login')?app.utils.tools.dayjs(this.getDataValue('last_login')).format('YYYY-MM-DD HH:mm:ss'):this.getDataValue('last_login')
      }
    },
    state: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: '1'
    },
    delete_at: {
      type: DataTypes.TIME,
      allowNull: true
    },
    create_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
    },
    update_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'users',
    // 不删除数据库条目,但将新添加的属性deletedAt设置为当前日期(删除完成时). 
    // paranoid 只有在启用时间戳时才能工作
    paranoid: true,
    timestamps: true,
    createdAt: false,
    updatedAt: false,
    deletedAt: "delete_at",
  });

  Model.associate = function() {
    Model.hasOne(app.model.Departments, { as: "department", foreignKey: 'id', sourceKey: 'department_id' });
    app.model.Users.belongsToMany(app.model.Roles, {
      through: app.model.UserRoles,
      foreignKey: 'user_id',
      otherKey: 'role_id',
    });
  }

  return Model;
};
