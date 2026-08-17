import { DefaultSession } from "next-auth";
import { UserRole } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      mustChangePassword: boolean;
      studentId?: string;
      teacherId?: string;
      rollNo?: string;
      department?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    mustChangePassword: boolean;
    studentId?: string;
    teacherId?: string;
    rollNo?: string;
    department?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    mustChangePassword: boolean;
    studentId?: string;
    teacherId?: string;
    rollNo?: string;
    department?: string;
  }
}
