import { Messages, Users } from "../models/index.js";
import { DataTypes, Op } from "sequelize";
import HttpErrors from "http-errors";
import Socket from "../services/Socket.js";
import fs from "fs";
import path from "path";
import { v4 as uuidV4 } from "uuid";
import Files from "../models/Files.js";


class MessagesController {
  static async create(req, res, next) {
    try {
      const { userId } = req;
      const { files } = req;
      const { friendId, text, type = 'text' } = req.body;
      await Messages.update({
        isLast: false
      }, {
        where: {
          isLast: true,
          [Op.or]: [
            { from: userId, to: friendId },
            { from: friendId, to: userId },
          ]
        }
      })
      let message = await Messages.create({
        from: userId,
        to: friendId,
        text,
        type,
        isLast: true
      });

      const friend = await Users.findOne({
        where: { id: userId }
      })
      console.log(files)
      const filesList = files.map((file) => {
        // const fileName = uuidV4() + path.extname(file.originalname);
        // fs.writeFileSync(path.resolve('./public/uploads', fileName), file.buffer);
        fs.renameSync(file.path, path.resolve('./public/uploads', file.filename))
        return {
          path: 'uploads/' + file.filename,
          messageId: message.id,
          userId,
          type: file.mimetype,
          size: file.size,
          name: file.originalname,
        }
      });
      await Files.bulkCreate(filesList)

      message = await Messages.findOne({
        where: {
          id: message.id
        },
        include: [{
          model: Files,
          as: 'files',
          required: false
        }],
      })

      Socket.emit(`user_${friendId}`, 'new-message', { message, friend })

      res.json({
        message
      })
    } catch (e) {
      next(e)
    }
  }

  static async list(req, res, next) {
    try {
      const { userId } = req;
      const { friendId } = req.params;
      const { page = 1 } = req.query;
      const limit = 50;

      const where = {
        [Op.or]: [
          { from: userId, to: friendId },
          { from: friendId, to: userId },
        ]
      }
      const messages = await Messages.findAll({
        where,
        include: [{
          model: Files,
          as: 'files',
          required: false
        }],
        order: [['createdAt', 'desc']],
        limit,
        offset: (page - 1) * limit
      });

      const total = await Messages.count({
        where
      })

      res.json({
        messages,
        total,
        totalPages: Math.ceil(total / limit)
      })
    } catch (e) {
      next(e)
    }
  }

  static async open(req, res, next) {
    try {
      const { userId } = req;
      const { id } = req.params;

      const message = await Messages.findOne({
        where: {
          id,
          to: userId
        },
      });
      if (!message) {
        throw HttpErrors(404);
      }
      await message.update({
        seen: new Date()
      })
      res.json({
        message
      })
    } catch (e) {
      next(e)
    }
  }
}

export default MessagesController
