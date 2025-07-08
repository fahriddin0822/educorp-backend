import { users, courses, type User, type InsertUser, type Course, type InsertCourse } from "./shared/schema.js";
import { db } from "./db.js";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;

  // Course operations
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  getCoursesByTeacher(teacherId: number): Promise<Course[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private currentUserId: number;
  private currentCourseId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.currentUserId = 1;
    this.currentCourseId = 1;

    // Create default users
    this.createUser({
      email: "admin@educorp.com",
      fullName: "Admin User",
      password: "admin123",
      role: "admin",
    });

    this.createUser({
      email: "teacher@educorp.com",
      fullName: "John Smith",
      password: "teacher123",
      role: "teacher",
    });

    this.createUser({
      email: "student@educorp.com",
      fullName: "Jane Doe",
      password: "student123",
      role: "student",
    });

    // Create sample courses
    setTimeout(() => {
      this.createCourse({
        name: "Full Stack Modern JavaScript",
        description: "Learn modern JavaScript development with React, Node.js, and Express. Build real-world applications from scratch.",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        teacherId: 2,
        price: 99,
        students: 150,
        lessons: 25,
        rating: 48,
      });

      this.createCourse({
        name: "Design System with React",
        description: "Master design systems and component libraries with React, TypeScript, and Storybook.",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        teacherId: 2,
        price: 129,
        students: 120,
        lessons: 30,
        rating: 50,
      });

      this.createCourse({
        name: "Python for Data Science",
        description: "Complete guide to data science with Python, pandas, NumPy, and machine learning fundamentals.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        teacherId: 2,
        price: 149,
        students: 89,
        lessons: 35,
        rating: 47,
      });

      this.createCourse({
        name: "UI/UX Design Masterclass",
        description: "Learn user interface and user experience design principles with Figma and modern design tools.",
        image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        teacherId: 2,
        price: 89,
        students: 200,
        lessons: 20,
        rating: 49,
      });

      this.createCourse({
        name: "Mobile App Development with React Native",
        description: "Build cross-platform mobile applications using React Native and modern development practices.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        teacherId: 2,
        price: 179,
        students: 95,
        lessons: 40,
        rating: 46,
      });

      this.createCourse({
        name: "DevOps & Cloud Computing",
        description: "Master DevOps practices with Docker, Kubernetes, AWS, and CI/CD pipelines for modern deployments.",
        image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        teacherId: 2,
        price: 199,
        students: 75,
        lessons: 45,
        rating: 48,
      });
    }, 100);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "student",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const course: Course = {
      ...insertCourse,
      id,
      teacherId: insertCourse.teacherId || null,
      price: insertCourse.price || 0,
      students: insertCourse.students || 0,
      lessons: insertCourse.lessons || 0,
      rating: insertCourse.rating || 50,
      createdAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;

    const updatedCourse = { ...course, ...courseData };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  async getCoursesByTeacher(teacherId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.teacherId === teacherId);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set(courseData)
      .where(eq(courses.id, id))
      .returning();
    return course || undefined;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCoursesByTeacher(teacherId: number): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.teacherId, teacherId));
  }
}

export const storage = new DatabaseStorage();
