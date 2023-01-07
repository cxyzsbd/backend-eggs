/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('role_permissions', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
    },
    permission_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
    },
  }, {
    tableName: 'role_permissions',
  });

  Model.associate = function() {

  };

  return Model;
};
