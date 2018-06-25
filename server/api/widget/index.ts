import {Router} from "express";
import {controller} from "./controller";
import * as auth from "../../auth/auth.service";

var router = Router();

router.post("/", auth.isAuthenticated, (req, res) => controller.create(req, res));
router.delete("/:id", auth.isAuthenticated, controller.remove);
router.put("/", auth.isAuthenticated, controller.update);
router.get("/:id", auth.isAuthenticated, controller.get)

module.exports = router;