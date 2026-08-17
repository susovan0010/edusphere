export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export type TeacherSubjectStatus = "APPROVED" | "PENDING" | "REJECTED";

export type AssignmentType = "DESCRIPTIVE" | "OBJECTIVE";

export type SubmissionStatus = "SUBMITTED" | "LOCKED";

export type NotificationType = "ASSIGNMENT" | "GENERAL" | "RESULT" | "APPROVAL";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
  studentId?: string;
  teacherId?: string;
  rollNo?: string;
  department?: string;
}

export interface PaperSummary {
  id: string;
  code: string;
  name: string;
  credits: number;
  className: string;
  sectionName: string;
  semesterLabel: string;
  status?: TeacherSubjectStatus;
  enrolledStudentsCount?: number;
  teacherName?: string;
  teacherEmail?: string;
  attendancePercentage?: number;
}
