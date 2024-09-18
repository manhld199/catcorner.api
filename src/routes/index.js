import express from "express";

const router = express.Router();

const adminRouter = require("./admin");
const guestRouter = require("./guest");

router.use("/admin", adminRouter);
router.use("/guest", guestRouter);

export default router;
