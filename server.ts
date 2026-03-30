import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { User, Course, Enrollment } from "./src/models/db.js"; // Use .js extension for ESM compatibility

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB successfully");
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  } else {
    console.warn("MONGODB_URI not provided. MongoDB features will not work.");
  }

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Student Course Registration API is running" });
  });

  // User Profile
  app.get("/api/users/:uid", async (req, res) => {
    try {
      const user = await User.findOne({ uid: req.params.uid }).populate('enrolledCourses');
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { uid, email, displayName, role } = req.body;
      let user = await User.findOne({ uid });
      if (!user) {
        user = new User({ uid, email, displayName, role });
        await user.save();
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await Course.find();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const course = new Course(req.body);
      await course.save();
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      await Course.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Enrollment
  app.post("/api/enroll", async (req, res) => {
    const { studentId, courseId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const course = await Course.findById(courseId).session(session);
      if (!course) throw new Error("Course not found");
      if (course.enrolledCount >= course.capacity) throw new Error("Course is full");

      const user = await User.findOne({ uid: studentId }).session(session);
      if (!user) throw new Error("User not found");
      if (user.enrolledCourses.includes(courseId)) throw new Error("Already enrolled");

      // Create enrollment
      const enrollment = new Enrollment({ studentId, courseId });
      await enrollment.save({ session });

      // Update course count
      course.enrolledCount += 1;
      await course.save({ session });

      // Update user list
      user.enrolledCourses.push(courseId);
      await user.save({ session });

      await session.commitTransaction();
      res.json({ success: true });
    } catch (error: any) {
      await session.abortTransaction();
      res.status(500).json({ error: error.message });
    } finally {
      session.endSession();
    }
  });

  app.post("/api/unenroll", async (req, res) => {
    const { studentId, courseId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const course = await Course.findById(courseId).session(session);
      if (!course) throw new Error("Course not found");

      const user = await User.findOne({ uid: studentId }).session(session);
      if (!user) throw new Error("User not found");

      // Remove enrollment
      await Enrollment.deleteOne({ studentId, courseId }).session(session);

      // Update course count
      course.enrolledCount = Math.max(0, course.enrolledCount - 1);
      await course.save({ session });

      // Update user list
      user.enrolledCourses = user.enrolledCourses.filter(id => id.toString() !== courseId);
      await user.save({ session });

      await session.commitTransaction();
      res.json({ success: true });
    } catch (error: any) {
      await session.abortTransaction();
      res.status(500).json({ error: error.message });
    } finally {
      session.endSession();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
