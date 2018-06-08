import {Router} from "express";
import controller from "./controller";
import * as auth from "../../auth/auth.service";

var router = Router();

router.get("/:id", auth.isAuthenticated, controller.getBook);
router.get("/", auth.isAuthenticated, controller.getMyBooks);
router.post("/", auth.isAuthenticated, controller.create);
router.delete("/:id", auth.isAuthenticated, controller.hasOwnerAccess, controller.remove);
router.put("/", auth.isAuthenticated, controller.hasEditorAccess, controller.update);

module.exports = router;