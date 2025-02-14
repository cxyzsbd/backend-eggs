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
    tool_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '工具id',
      field: 'tool_id',
    },
    receiving_record_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '领用记录id，当操作类型是归还时必填',
      field: 'receiving_record_id',
    },
    operator: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '操作人',
      field: 'operator',
    },
    operator_contact: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '操作人联系方式',
      field: 'operator_contact',
    },
    operating_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '操作时间',
      field: 'operating_time',
    },
    quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0',
      primaryKey: false,
      autoIncrement: false,
      comment: '数量',
      field: 'quantity',
    },
    remand_quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      primaryKey: false,
      autoIncrement: false,
      comment: '已经归还数量，当操作类型是领用时必有',
      field: 'remand_quantity',
    },
    type: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '操作类型(1:入库；2：出库；3：领用；4：归还)',
      field: 'type',
    },
    creator: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '创建人',
      field: 'creator',
    },
    create_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: '创建时间',
      field: 'create_at',
    },
    remark: {
      type: DataTypes.STRING(300),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '备注',
      field: 'remark',
    },
    company_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: '公司id',
      field: 'company_id',
    },
  };
  const options = {
    tableName: 'tool_inventory_records',
    comment: '',
    indexes: [],
  };
  const ToolInventoryRecordsModel = sequelize.define('tool_inventory_records_model', attributes, options);
  ToolInventoryRecordsModel.associate = () => {
    ToolInventoryRecordsModel.hasOne(app.model.Users, { sourceKey: 'creator', foreignKey: 'id', as: 'creator_info' });
    ToolInventoryRecordsModel.hasOne(app.model.Tools, { sourceKey: 'tool_id', foreignKey: 'id', as: 'tools_info' });
  };
  return ToolInventoryRecordsModel;
};
