/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('user_roles', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
    },
  }, {
    tableName: 'user_roles',
  });

  Model.associate = function() {
    app.model.UserRoles.belongsTo(app.model.Roles, {
      foreignKey: 'role_id',
      targetKey: 'id',
    });
  };

  return Model;
};
