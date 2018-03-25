import {Router} from "express";
import * as multer from "multer";
import {controller} from "./controller";
import {isAuthenticated} from "../../auth/auth.service";

var router = Router();

router.post("/", isAuthenticated, multer({dest: "./uploads"}).single("file"), (req, res) => controller.create(req, res));
router.put("/", isAuthenticated, controller.update);
router.delete("/:id", isAuthenticated, controller.remove);

module.exports = router;