import {Router} from "express";
import UsersController from "../controllers/UsersController.js";
import validate from "../middlewares/validate.js";
import usersSchema from "../middlewares/schema/usersSchema.js";
import authMiddleware from "../middlewares/authMiddleware.js";


const router = new Router();

router.post(
    '/register',
    validate(usersSchema.register),
    UsersController.register,
)

router.post(
    '/login',
    validate(usersSchema.login),
    UsersController.login,
)

router.get(
    '/profile',
    authMiddleware,
    UsersController.profile,
)

router.get(
    '/single/:userId',
    authMiddleware,
    UsersController.single,
)
router.get(
    '/list',
    authMiddleware,
    UsersController.list,
)
export default router;
