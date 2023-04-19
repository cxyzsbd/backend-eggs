'use strict';

module.exports = app => {
  const DataTypes = app.Sequelize;
  const sequelize = app.model;
  const attributes = {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: 'id',
    },
    equipment_account_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '台账id',
      field: 'equipment_account_id',
    },
    task_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '巡检任务id',
      field: 'task_id',
    },
    results: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '巡检结果',
      field: 'results',
      // get() {
      //   const rawValue = this.getDataValue('items');
      //   return rawValue ? JSON.parse(rawValue) : null;
      // },
      // set(value) {
      //   this.setDataValue('items', JSON.stringify(value));
      // },
    },
    audios: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "音频链接，','分隔",
      field: 'audios',
    },
    imgs: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "图片链接,','分隔",
      field: 'imgs',
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '备注',
      field: 'remarks',
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'create_at',
    },
    complete_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: 'complete_at',
    },
    submitter: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '提交人',
      field: 'submitter',
    },
  };
  const options = {
    tableName: 'inspection_results',
    comment: '',
    indexes: [],
  };
  const InspectionResultsModel = sequelize.define('inspection_results_model', attributes, options);
  InspectionResultsModel.associate = () => {
    InspectionResultsModel.hasOne(app.model.EquipmentAccounts, { foreignKey: 'id', sourceKey: 'equipment_account_id', as: 'equipment_account' });
  };
  return InspectionResultsModel;
};
