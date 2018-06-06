import {Router} from "express";
import controller from "./controller";
import * as auth from "../../auth/auth.service";

var router = Router();

router.get("/", auth.isAuthenticated, controller.index);
router.post("/", auth.isAuthenticated, controller.hasCreateAccess, controller.create);
router.delete("/:id", auth.isAuthenticated, controller.hasEditAccess, controller.remove);
router.put("/", auth.isAuthenticated, controller.hasEditAccess, controller.update);

module.exports = router;