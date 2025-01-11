import express from "express";
import { fetchAndSaveAllLocations } from "../../controllers/location/location.controller.js";

const router = express.Router();

// Route không cần xác thực
router.get("/fetchLocations", fetchAndSaveAllLocations);

export default router;
