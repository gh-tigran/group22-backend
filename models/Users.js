import { DataTypes, Model } from "sequelize";
import md5 from "md5";
import sequelize from "../services/sequelize.js";

const { PASSWORD_SECRET } = process.env

class Users extends Model {

  static passwordHash = (pass) => md5(md5(pass) + PASSWORD_SECRET)

  static async updateUserStatus(id, status) {
    try {
      await this.update(
        { status: status },
        {
          where: { id }
        });
    } catch (e) {
      console.log(e)
    }

  }
}

Users.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.CHAR(32),
    allowNull: false,
    set(value) {
      if (value) {
        this.setDataValue('password', Users.passwordHash(value))
      }
    },
    get() {
      return undefined
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
    get() {
      const avatar = this.getDataValue('avatar');
      const email = this.getDataValue('email')
      if (!avatar && email) {
        return `https://gravatar.com/avatar/${md5(email.toLowerCase())}?d=monsterid`
      }
    }
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  lastVisit: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'users',
  tableName: 'users',
  indexes: [{
    fields: ['email'], unique: true
  }]
})

export default Users
