import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // admin, teacher, student
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  teacherId: integer("teacher_id").references(() => users.id),
  price: integer("price").notNull().default(0),
  students: integer("students").notNull().default(0),
  lessons: integer("lessons").notNull().default(0),
  rating: integer("rating").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "teacher", "admin"]).default("student"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one }) => ({
  teacher: one(users, {
    fields: [courses.teacherId],
    references: [users.id],
  }),
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
