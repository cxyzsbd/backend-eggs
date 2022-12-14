/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('menus', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
    },
    parent_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    hidden: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    always_show: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    keep_alive: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
    },
    target: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    component: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
    },
    redirect: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sort: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: '0',
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
    tableName: 'menus',
  });

  Model.associate = function() {

  };

  return Model;
};
