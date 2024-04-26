import { Router } from "express";
import MessagesController from "../controllers/MessagesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import multer from "multer";
import os from "os";
import { v4 as uuidV4 } from "uuid";
import path from "path";
import HttpErrors from "http-errors";

console.log(os.tmpdir());

const router = new Router();

const images = ['image/gif', 'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, os.tmpdir())
    },
    filename: (req, file, cb) => {
      const fileName = uuidV4() + path.extname(file.originalname);
      cb(null, fileName)
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 50,
  },
  // fileFilter: (req, file, cb) => {
  //   if (!images.includes(file.mimetype)) {
  //     cb(null, false);
  //     // cb(HttpErrors(422, 'invalid file type'), false);
  //   }else {
  //     cb(null, true);
  //   }
  // }
})

router.post(
  '/send',
  authMiddleware,
  upload.array('files[]', 10),
  MessagesController.create,

)

router.get(
  '/list/:friendId',
  authMiddleware,
  MessagesController.list,
)

export default router;
