/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('permissions', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: '',
    },
    mark: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: '',
    },
    mark_name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: '',
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    action: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: '',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    state: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
    },
    authentication: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
    },
    authorization: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '1',
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
    tableName: 'permissions',
  });

  Model.associate = function() {

  };

  return Model;
};
