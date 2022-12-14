/* indent size: 2 */

module.exports = app => {
  const DataTypes = app.Sequelize;

  const Model = app.model.define('departments', {
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
    parent_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
    },
    sort: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
    },
    type: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '3',
    },
    boxcode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    contact_name: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    desc: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    creator: {
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
    adcode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  }, {
    tableName: 'departments',
  });

  Model.associate = function() {

  };

  return Model;
};
