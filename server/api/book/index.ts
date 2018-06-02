import {Router} from "express";
import controller from "./controller";
import * as auth from "../../auth/auth.service";

var router = Router();

router.get("/", auth.isAuthenticated, controller.index);
router.post("/", auth.isAuthenticated, controller.create);
router.delete("/:id", auth.isAuthenticated, controller.hasOwnerAccess, controller.remove);
router.put("/", auth.isAuthenticated, controller.hasEditorAccess, controller.update);

module.exports = router;