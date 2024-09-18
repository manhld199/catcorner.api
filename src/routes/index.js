import adminRouter from "./admin/index.js";
import guestRouter from "./guest/index.js";

const route = (app) => {
  app.get("/", (req, res) => res.send("Express on Vercel"));
  app.use("/api/admin", adminRouter);
  app.use("/api/guest", guestRouter);
};

export default route;
