import { Messages, Users } from "../models/index.js";
import HttpErrors from "http-errors";
import jwt from "jsonwebtoken";
import sequelize from "../services/sequelize.js";
import { Op, QueryTypes } from "sequelize";
import Sequelize from "../services/sequelize.js";

const { JWT_SECRET } = process.env;

class UsersController {
  static async register(req, res, next) {
    try {
      const { firstName, lastName, password, email } = req.body;
      const exists = await Users.findOne({
        where: { email }
      });
      if (exists) {
        throw HttpErrors(422, {
          errors: {
            email: "Already exists"
          }
        })
      }
      const user = await Users.create({
        firstName, lastName, password, email
      })
      res.json({
        status: 'ok',
        user
      })
    } catch (e) {
      next(e)
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const hashedPassword = Users.passwordHash(password);

      const user = await Users.findOne({
        where: { email, password: hashedPassword },
        logging: true
      });
      // user.dataValues.password
      // || hashedPassword !== user.getDataValue('password')
      if (!user) {
        throw HttpErrors(403, {
          errors: {
            email: "Invalid email or password"
          }
        })
      }

      const token = jwt.sign({
        userId: user.id,
      }, JWT_SECRET,);

      res.cookie('token', token, {
        httpOnly: true
      });

      res.json({
        status: 'ok',
        user,
        token
      })
    } catch (e) {
      next(e)
    }
  }

  static async profile(req, res, next) {
    try {
      const { userId } = req;

      const user = await Users.findOne({
        where: {
          id: userId
        }
      })

      if (!user) {
        throw HttpErrors(404, "User not found");
      }

      res.json({
        status: 'ok',
        user,
      })
    } catch (e) {
      next(e)
    }
  }

  static async single(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await Users.findOne({
        where: {
          id: userId
        }
      })

      if (!user) {
        throw HttpErrors(404, "User not found");
      }

      res.json({
        status: 'ok',
        user,
      })
    } catch (e) {
      next(e)
    }
  }

  static async list(req, res, next) {
    try {
      const { userId } = req;
      const { search } = req.query;

      const where = {};
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.substring]: search } },
          { lastName: { [Op.substring]: search } },
          { email: { [Op.substring]: search } },
        ]
      }

      const users = await Users.findAll({
        where,
        include: [{
          model: Messages,
          as: 'messagesFrom',
          attributes: [],
          required: false,
          // where: { isLast: true }
        }, {
          model: Messages,
          as: 'messagesTo',
          attributes: [],
          required: false,
          // where: { isLast: true }
        }],
        logging: true,
        order: [
          [Sequelize.literal('if(`messagesFrom`.createdAt is null, `messagesTo`.createdAt, `messagesFrom`.createdAt)'), 'desc']
        ]
      });

      res.json({
        status: 'ok',
        users,
      })
    } catch (e) {
      next(e)
    }
  }
}

export default UsersController
