/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('role_menus', {
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
    menu_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
    },
  }, {
    tableName: 'role_menus',
  });

  Model.associate = function() {

  };

  return Model;
};
