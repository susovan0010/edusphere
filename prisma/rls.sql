-- Supabase Row Level Security (RLS) Policies for EduSphere
-- Run this script in the Supabase SQL Editor after applying migrations

-- 1. Enable RLS on core tables
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Mark" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ObjectiveResponse" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssignmentResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeacherSubject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- 2. Student Policies: Students can only view their own records
CREATE POLICY "Students view own profile" ON "Student"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Students view own attendance" ON "Attendance"
  FOR SELECT USING (
    "studentId" IN (SELECT id FROM "Student" WHERE "userId" = auth.uid()::text)
  );

CREATE POLICY "Students view own marks" ON "Mark"
  FOR SELECT USING (
    "studentId" IN (SELECT id FROM "Student" WHERE "userId" = auth.uid()::text)
  );

CREATE POLICY "Students manage own submissions" ON "Submission"
  FOR ALL USING (
    "studentId" IN (SELECT id FROM "Student" WHERE "userId" = auth.uid()::text)
  );

CREATE POLICY "Students manage own objective responses" ON "ObjectiveResponse"
  FOR ALL USING (
    "studentId" IN (SELECT id FROM "Student" WHERE "userId" = auth.uid()::text)
  );

CREATE POLICY "Students view own results" ON "AssignmentResult"
  FOR SELECT USING (
    "studentId" IN (SELECT id FROM "Student" WHERE "userId" = auth.uid()::text)
  );

-- 3. Teacher Policies: Teachers can view/grade their assigned sections and subjects
CREATE POLICY "Teachers view assigned sections" ON "TeacherSubject"
  FOR SELECT USING (
    "teacherId" IN (SELECT id FROM "Teacher" WHERE "userId" = auth.uid()::text)
  );

CREATE POLICY "Teachers mark attendance for assigned subjects" ON "Attendance"
  FOR ALL USING (
    "subjectId" IN (
      SELECT "subjectId" FROM "TeacherSubject" 
      WHERE "teacherId" IN (SELECT id FROM "Teacher" WHERE "userId" = auth.uid()::text)
      AND "status" IN ('APPROVED', 'PENDING')
    )
  );

-- 4. Notification Policy: Users can only see their own notifications
CREATE POLICY "Users access own notifications" ON "Notification"
  FOR ALL USING (auth.uid()::text = "userId");

-- 5. Audit Log Policy: Only Admins can view audit logs
CREATE POLICY "Admins view audit logs" ON "AuditLog"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN')
  );
