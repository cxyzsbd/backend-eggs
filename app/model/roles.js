/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('roles', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    department_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    create_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
    },
    update_at: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: DataTypes.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    tableName: 'roles',
  });

  Model.associate = function() {
    Model.hasOne(app.model.Departments, { as: "department", foreignKey: 'id', sourceKey: 'department_id' });
    app.model.Roles.belongsToMany(app.model.Permissions, {
      through: app.model.RolePermissions,
      foreignKey: 'role_id',
      otherKey: 'permission_id',
    });
    app.model.Roles.belongsToMany(app.model.Menus, {
      through: app.model.RoleMenus,
      foreignKey: 'role_id',
      otherKey: 'menu_id',
    });
  };

  return Model;
};
