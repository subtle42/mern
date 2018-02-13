import {Router} from "express";
import {UserController as controller} from "./controller";
import * as auth from "../../auth/auth.service";

const router = Router();

router.get("/", auth.isAuthenticated, auth.isAdmin, controller.index);
router.get("/public", auth.isAuthenticated, controller.getPublic);
router.delete("/:id", auth.isAuthenticated, auth.isAdmin, controller.destroy);
router.get("/me", auth.isAuthenticated, controller.me);
router.put("/:id/password", auth.isAuthenticated, controller.changePassword);
router.get("id", auth.isAuthenticated, controller.show);
router.post("/", controller.create);

module.exports = router;