import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Messages from "./Messages.js";
import Users from "./Users.js";

const { API_URL } = process.env;

class Files extends Model {

}

Files.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
    get() {
      const value = this.getDataValue('path');
      if (value) {
        return API_URL + '/' + value
      }
    }
  },
  messageId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'files',
  tableName: 'files',
})

Files.belongsTo(Messages, {
  foreignKey: 'messageId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'message'
});

Messages.hasMany(Files, {
  foreignKey: 'messageId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'files'
});


Files.belongsTo(Users, {
  foreignKey: 'userId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'user'
});

Users.hasMany(Files, {
  foreignKey: 'userId',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'files'
});


export default Files
