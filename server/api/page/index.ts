import {Router} from "express";
// import Page from "./model";
import controller from "./controller";
import * as auth from "../../auth/auth.service";

var router = Router();

router.get("/", auth.isAuthenticated, controller.index);
router.post("/", auth.isAuthenticated, controller.create);
router.delete("/:id", auth.isAuthenticated, controller.remove);
router.put("/", auth.isAuthenticated, controller.update);

module.exports = router;