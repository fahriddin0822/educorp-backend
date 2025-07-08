import { db } from "./db.js";
import { users, courses } from "./shared/schema.js";

export async function setupDatabase() {
  console.log("Setting up database with initial data...");
  
  // Check if data already exists
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already has data, skipping setup");
    return;
  }

  // Create default users
  const [admin] = await db.insert(users).values({
    email: "admin@educorp.com",
    fullName: "Admin User",
    password: "admin123",
    role: "admin",
  }).returning();

  const [teacher] = await db.insert(users).values({
    email: "teacher@educorp.com",
    fullName: "John Smith",
    password: "teacher123",
    role: "teacher",
  }).returning();

  const [student] = await db.insert(users).values({
    email: "student@educorp.com",
    fullName: "Jane Doe",
    password: "student123",
    role: "student",
  }).returning();

  // Create sample courses
  const sampleCourses = [
    {
      name: "Full Stack Modern JavaScript",
      description: "Learn modern JavaScript development with React, Node.js, and Express. Build real-world applications from scratch.",
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      teacherId: teacher.id,
      price: 99,
      students: 150,
      lessons: 25,
      rating: 48,
    },
    {
      name: "Design System with React",
      description: "Master design systems and component libraries with React, TypeScript, and Storybook.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      teacherId: teacher.id,
      price: 129,
      students: 120,
      lessons: 30,
      rating: 50,
    },
    {
      name: "Python for Data Science",
      description: "Complete guide to data science with Python, pandas, NumPy, and machine learning fundamentals.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      teacherId: teacher.id,
      price: 149,
      students: 89,
      lessons: 35,
      rating: 47,
    },
    {
      name: "UI/UX Design Masterclass",
      description: "Learn user interface and user experience design principles with Figma and modern design tools.",
      image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      teacherId: teacher.id,
      price: 89,
      students: 200,
      lessons: 20,
      rating: 49,
    },
    {
      name: "Mobile App Development with React Native",
      description: "Build cross-platform mobile applications using React Native and modern development practices.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      teacherId: teacher.id,
      price: 179,
      students: 95,
      lessons: 40,
      rating: 46,
    },
    {
      name: "DevOps & Cloud Computing",
      description: "Master DevOps practices with Docker, Kubernetes, AWS, and CI/CD pipelines for modern deployments.",
      image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      teacherId: teacher.id,
      price: 199,
      students: 75,
      lessons: 45,
      rating: 48,
    },
  ];

  await db.insert(courses).values(sampleCourses);

  console.log("Database setup complete!");
  console.log(`Created ${sampleCourses.length} sample courses`);
  console.log("Demo accounts:");
  console.log("- Admin: admin@educorp.com / admin123");
  console.log("- Teacher: teacher@educorp.com / teacher123");
  console.log("- Student: student@educorp.com / student123");
}