import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Users from "./Users.js";

class Messages extends Model {


}

Messages.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  from: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  to: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  seenAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('text', 'voice', 'video'),
    allowNull: true,
  },
  isLast: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
}, {
  sequelize,
  modelName: 'messages',
  tableName: 'messages',
});

Messages.belongsTo(Users, {
  foreignKey: 'from',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'userFrom'
})

Users.hasMany(Messages, {
  foreignKey: 'from',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'messagesFrom'
})

Messages.belongsTo(Users, {
  foreignKey: 'to',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'userTo'
})

Users.hasMany(Messages, {
  foreignKey: 'to',
  onDelete: 'cascade',
  onUpdate: 'cascade',
  as: 'messagesTo'
})

export default Messages
