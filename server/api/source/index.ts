import {Router} from "express";
import * as multer from "multer";
import controller from "./controller";
import {isAuthenticated} from "../../auth/auth.service";

var router = Router();

router.post("/create", isAuthenticated, multer({dest: "./uploads"}).single("file"), controller.create);
router.put("/", isAuthenticated, controller.update);
router.delete("/:id", isAuthenticated, controller.remove);

module.exports = router;