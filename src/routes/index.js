import adminRouter from "./admin/index.js";
import guestRouter from "./guest/index.js";
import cloudinaryRouter from "./cloudinary/index.js";
import authRouter from "./auth/index.js";
import passport from '../passport.js';

const route = (app) => {
  app.get("/", (req, res) => res.send("Express on Vercel"));
  app.use("/api/admin", adminRouter);
  app.use("/api/guest", guestRouter);
  app.use("/api/cloudinary", cloudinaryRouter);
  app.use("/api/auth", authRouter);
  // init passport
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
    app.use(passport.initialize());
  }
};

export default route;
