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
    company_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '公司id',
      field: 'company_id',
    },
  }, {
    tableName: 'roles',
  });

  Model.associate = function() {
    Model.hasOne(app.model.Companys, { as: 'company', foreignKey: 'id', sourceKey: 'company_id' });
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
