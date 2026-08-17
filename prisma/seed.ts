import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding EduSphere database...");

  // Clean existing records in correct relation order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.googleDriveAuth.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignmentResult.deleteMany();
  await prisma.objectiveResponse.deleteMany();
  await prisma.studentAssignmentSet.deleteMany();
  await prisma.assignmentQuestion.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.mark.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  // Password hashes
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const teacherHash = await bcrypt.hash("Teacher@123", 10);
  const studentHash = await bcrypt.hash("Student@123", 10);
  const tempHash = await bcrypt.hash("Temp@123", 10);

  // 1. Create Semesters
  const sem5 = await prisma.semester.create({
    data: {
      label: "Semester 5",
      academicYear: 2026,
      isCurrent: true,
    },
  });

  const sem4 = await prisma.semester.create({
    data: {
      label: "Semester 4",
      academicYear: 2025,
      isCurrent: false,
    },
  });

  // 2. Create Classes
  const classECE = await prisma.class.create({
    data: {
      name: "3rd Year Electronics & Communication",
    },
  });

  const classCSE = await prisma.class.create({
    data: {
      name: "4th Year Computer Science",
    },
  });

  // 3. Create Sections
  const secA = await prisma.section.create({
    data: {
      name: "Section A",
      classId: classECE.id,
      semesterId: sem5.id,
    },
  });

  const secB = await prisma.section.create({
    data: {
      name: "Section B",
      classId: classECE.id,
      semesterId: sem5.id,
    },
  });

  // 4. Create Subjects
  const subjECE301 = await prisma.subject.create({
    data: {
      name: "Digital Signal Processing",
      code: "ECE301",
      credits: 4,
      classId: classECE.id,
      semesterId: sem5.id,
    },
  });

  const subjECE302 = await prisma.subject.create({
    data: {
      name: "Microprocessors & Microcontrollers",
      code: "ECE302",
      credits: 4,
      classId: classECE.id,
      semesterId: sem5.id,
    },
  });

  const subjECE303 = await prisma.subject.create({
    data: {
      name: "VLSI Design & Technology",
      code: "ECE303",
      credits: 3,
      classId: classECE.id,
      semesterId: sem5.id,
    },
  });

  const subjCS401 = await prisma.subject.create({
    data: {
      name: "Distributed Cloud Architecture",
      code: "CS401",
      credits: 4,
      classId: classCSE.id,
      semesterId: sem5.id,
    },
  });

  // 5. Create Users
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      name: "Dean Arthur Pendelton",
      email: "admin@edusphere.edu",
      passwordHash: adminHash,
      role: "ADMIN",
      mustChangePassword: false,
    },
  });

  // Teachers
  const teacherUser1 = await prisma.user.create({
    data: {
      name: "Prof. Rajesh Sharma",
      email: "prof.sharma@edusphere.edu",
      passwordHash: teacherHash,
      role: "TEACHER",
      mustChangePassword: false,
      teacherProfile: {
        create: {
          department: "Electronics & Communication Engineering",
          designation: "Senior Professor",
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      name: "Dr. Sunita Banerjee",
      email: "dr.banerjee@edusphere.edu",
      passwordHash: teacherHash,
      role: "TEACHER",
      mustChangePassword: false,
      teacherProfile: {
        create: {
          department: "Computer Science & Engineering",
          designation: "Associate Professor",
        },
      },
    },
    include: { teacherProfile: true },
  });

  // New Teacher with mandatory password change
  const teacherUserNew = await prisma.user.create({
    data: {
      name: "Dr. Vikram Roy",
      email: "new.teacher@edusphere.edu",
      passwordHash: tempHash,
      role: "TEACHER",
      mustChangePassword: true, // Will test first-login mandatory password change gate
      teacherProfile: {
        create: {
          department: "Applied Mathematics",
          designation: "Assistant Professor",
        },
      },
    },
    include: { teacherProfile: true },
  });

  // Students
  const studentUser1 = await prisma.user.create({
    data: {
      name: "Rohit Sen",
      email: "rohit.sen@edusphere.edu",
      passwordHash: studentHash,
      role: "STUDENT",
      mustChangePassword: false,
      studentProfile: {
        create: {
          rollNo: "ECE-2023-042",
          classId: classECE.id,
          sectionId: secA.id,
          admissionYear: 2023,
        },
      },
    },
    include: { studentProfile: true },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      name: "Ananya Roy",
      email: "ananya.roy@edusphere.edu",
      passwordHash: studentHash,
      role: "STUDENT",
      mustChangePassword: false,
      studentProfile: {
        create: {
          rollNo: "ECE-2023-015",
          classId: classECE.id,
          sectionId: secA.id,
          admissionYear: 2023,
        },
      },
    },
    include: { studentProfile: true },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      name: "Priya Das",
      email: "priya.das@edusphere.edu",
      passwordHash: studentHash,
      role: "STUDENT",
      mustChangePassword: false,
      studentProfile: {
        create: {
          rollNo: "ECE-2023-088",
          classId: classECE.id,
          sectionId: secA.id,
          admissionYear: 2023,
        },
      },
    },
    include: { studentProfile: true },
  });

  // New Student with mandatory password change
  await prisma.user.create({
    data: {
      name: "Arjun Mehta",
      email: "new.student@edusphere.edu",
      passwordHash: tempHash,
      role: "STUDENT",
      mustChangePassword: true, // Will test first-login mandatory password change gate
      studentProfile: {
        create: {
          rollNo: "ECE-2023-099",
          classId: classECE.id,
          sectionId: secA.id,
          admissionYear: 2023,
        },
      },
    },
  });

  // 6. TeacherSubject Assignments
  // Approved: Prof. Sharma -> ECE301 (DSP)
  await prisma.teacherSubject.create({
    data: {
      teacherId: teacherUser1.teacherProfile!.id,
      subjectId: subjECE301.id,
      sectionId: secA.id,
      status: "APPROVED",
      requestedBy: "ADMIN",
      approvedByAdminId: adminUser.id,
      approvedAt: new Date(),
    },
  });

  // Approved: Prof. Sharma -> ECE302 (Microprocessors)
  await prisma.teacherSubject.create({
    data: {
      teacherId: teacherUser1.teacherProfile!.id,
      subjectId: subjECE302.id,
      sectionId: secA.id,
      status: "APPROVED",
      requestedBy: "ADMIN",
      approvedByAdminId: adminUser.id,
      approvedAt: new Date(),
    },
  });

  // PENDING Teacher Self-Assignment: Dr. Banerjee -> ECE303 (VLSI Design)
  // This tests Section 5B: while PENDING, Dr. Banerjee can ONLY take attendance, everything else is locked
  await prisma.teacherSubject.create({
    data: {
      teacherId: teacherUser2.teacherProfile!.id,
      subjectId: subjECE303.id,
      sectionId: secA.id,
      status: "PENDING",
      requestedBy: "TEACHER",
      notes: "Proposing to take VLSI Design & Technology for Section A this semester.",
    },
  });

  // 7. Question Bank
  const qb1 = await prisma.questionBank.create({
    data: {
      subjectId: subjECE301.id,
      teacherId: teacherUser1.teacherProfile!.id,
      questionText: "What is the Nyquist sampling rate for a signal bandlimited to 4 kHz?",
      type: "MCQ",
      options: JSON.stringify(["8 kHz", "4 kHz", "16 kHz", "2 kHz"]),
      correctAnswer: "8 kHz",
      defaultMarks: 5,
    },
  });

  const qb2 = await prisma.questionBank.create({
    data: {
      subjectId: subjECE301.id,
      teacherId: teacherUser1.teacherProfile!.id,
      questionText: "Which transform is primarily used to convert discrete-time signals into frequency domain?",
      type: "MCQ",
      options: JSON.stringify(["DFT / FFT", "Laplace Transform", "Continuous Fourier", "Hilbert Transform"]),
      correctAnswer: "DFT / FFT",
      defaultMarks: 5,
    },
  });

  const qb3 = await prisma.questionBank.create({
    data: {
      subjectId: subjECE301.id,
      teacherId: teacherUser1.teacherProfile!.id,
      questionText: "In a linear-phase FIR digital filter, the unit impulse response is:",
      type: "MCQ",
      options: JSON.stringify(["Symmetric or anti-symmetric", "Always strictly positive", "Infinite in length", "Unbounded"]),
      correctAnswer: "Symmetric or anti-symmetric",
      defaultMarks: 5,
    },
  });

  await prisma.questionBank.create({
    data: {
      subjectId: subjECE301.id,
      teacherId: teacherUser1.teacherProfile!.id,
      questionText: "Derive the Radix-2 Decimation-In-Time (DIT) Fast Fourier Transform algorithm and calculate its computational savings over direct DFT.",
      type: "DESCRIPTIVE",
      defaultMarks: 20,
    },
  });

  // 8. Create Sample Assignments
  // Assignment 1: Objective MCQ
  const assignObjective = await prisma.assignment.create({
    data: {
      subjectId: subjECE301.id,
      teacherId: teacherUser1.teacherProfile!.id,
      sectionId: secA.id,
      title: "DSP Quiz 1: Sampling Theory & Fourier Representations",
      description: "Complete all 3 multiple-choice questions. Time limit: 15 minutes. Note: Submissions are final and auto-graded immediately.",
      type: "OBJECTIVE",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxMarks: 15,
    },
  });

  // Link questions
  const aq1 = await prisma.assignmentQuestion.create({
    data: {
      assignmentId: assignObjective.id,
      questionBankId: qb1.id,
      order: 1,
      marks: 5,
      options: qb1.options,
      correctAnswer: qb1.correctAnswer,
    },
  });

  const aq2 = await prisma.assignmentQuestion.create({
    data: {
      assignmentId: assignObjective.id,
      questionBankId: qb2.id,
      order: 2,
      marks: 5,
      options: qb2.options,
      correctAnswer: qb2.correctAnswer,
    },
  });

  const aq3 = await prisma.assignmentQuestion.create({
    data: {
      assignmentId: assignObjective.id,
      questionBankId: qb3.id,
      order: 3,
      marks: 5,
      options: qb3.options,
      correctAnswer: qb3.correctAnswer,
    },
  });

  // Assignment 2: Descriptive
  const assignDescriptive = await prisma.assignment.create({
    data: {
      subjectId: subjECE301.id,
      teacherId: teacherUser1.teacherProfile!.id,
      sectionId: secA.id,
      title: "Lab Assignment 1: Design & Simulation of FIR Low-Pass Filter",
      description: "Submit a complete PDF technical report with MATLAB/Python simulation plots, filter coefficients table, and frequency magnitude response analysis. You may edit your submission up to 2 times before final lock.",
      type: "DESCRIPTIVE",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      maxMarks: 25,
    },
  });

  // Pre-seed Completed Objective Submission for Ananya Roy (15/15)
  await prisma.objectiveResponse.createMany({
    data: [
      {
        assignmentId: assignObjective.id,
        studentId: studentUser2.studentProfile!.id,
        questionId: aq1.id,
        selectedAnswer: "8 kHz",
        isCorrect: true,
        marksAwarded: 5,
        locked: true,
      },
      {
        assignmentId: assignObjective.id,
        studentId: studentUser2.studentProfile!.id,
        questionId: aq2.id,
        selectedAnswer: "DFT / FFT",
        isCorrect: true,
        marksAwarded: 5,
        locked: true,
      },
      {
        assignmentId: assignObjective.id,
        studentId: studentUser2.studentProfile!.id,
        questionId: aq3.id,
        selectedAnswer: "Symmetric or anti-symmetric",
        isCorrect: true,
        marksAwarded: 5,
        locked: true,
      },
    ],
  });

  await prisma.assignmentResult.create({
    data: {
      assignmentId: assignObjective.id,
      studentId: studentUser2.studentProfile!.id,
      totalMarks: 15,
      obtainedMarks: 15,
      percentage: 100.0,
      autoCalculated: true,
    },
  });

  // 9. Historical Attendance Data (Last 8 lectures)
  const students = [studentUser1.studentProfile!, studentUser2.studentProfile!, studentUser3.studentProfile!];
  const now = new Date();

  for (let i = 8; i >= 1; i--) {
    const lectureDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    // ECE301 Attendance
    for (const student of students) {
      // Rohit attended 7/8, Ananya attended 8/8, Priya attended 6/8
      const isAbsent =
        (student.id === studentUser1.studentProfile!.id && i === 4) ||
        (student.id === studentUser3.studentProfile!.id && (i === 2 || i === 5));

      await prisma.attendance.create({
        data: {
          studentId: student.id,
          subjectId: subjECE301.id,
          date: lectureDate,
          status: isAbsent ? "ABSENT" : "PRESENT",
          markedBy: teacherUser1.id,
        },
      });

      // ECE302 Attendance
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          subjectId: subjECE302.id,
          date: lectureDate,
          status: "PRESENT",
          markedBy: teacherUser1.id,
        },
      });
    }
  }

  // 10. Marks Records
  for (const student of students) {
    // ECE301 Class Test
    await prisma.mark.create({
      data: {
        studentId: student.id,
        subjectId: subjECE301.id,
        examType: "CT",
        marksObtained: student.id === studentUser1.studentProfile!.id ? 22 : student.id === studentUser2.studentProfile!.id ? 24 : 19,
        maxMarks: 25,
        enteredBy: teacherUser1.id,
      },
    });

    // ECE301 Mid-Sem
    await prisma.mark.create({
      data: {
        studentId: student.id,
        subjectId: subjECE301.id,
        examType: "MIDSEM",
        marksObtained: student.id === studentUser1.studentProfile!.id ? 44 : student.id === studentUser2.studentProfile!.id ? 48 : 38,
        maxMarks: 50,
        enteredBy: teacherUser1.id,
      },
    });

    // ECE302 Class Test
    await prisma.mark.create({
      data: {
        studentId: student.id,
        subjectId: subjECE302.id,
        examType: "CT",
        marksObtained: student.id === studentUser1.studentProfile!.id ? 21 : 23,
        maxMarks: 25,
        enteredBy: teacherUser1.id,
      },
    });
  }

  // 11. Initial Notifications
  await prisma.notification.create({
    data: {
      userId: studentUser1.id,
      title: "New Assignment Published",
      message: "Prof. Sharma published 'DSP Quiz 1: Sampling Theory' for ECE301.",
      type: "ASSIGNMENT",
      relatedId: assignObjective.id,
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentUser1.id,
      title: "New Assignment Published",
      message: "Prof. Sharma published 'Lab Assignment 1: FIR Filter Design' for ECE301.",
      type: "ASSIGNMENT",
      relatedId: assignDescriptive.id,
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "Paper Self-Assignment Request",
      message: "Dr. Sunita Banerjee has proposed to teach ECE303 (VLSI Design). Awaiting your approval.",
      type: "APPROVAL",
      relatedId: subjECE303.id,
      read: false,
    },
  });

  // 12. Audit Log sample
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "CREATE",
      targetTable: "TeacherSubject",
      targetId: subjECE301.id,
      newValue: JSON.stringify({ teacher: "Prof. Rajesh Sharma", subject: "ECE301", status: "APPROVED" }),
    },
  });

  console.log("EduSphere database seeded successfully!");
  console.log("Demo Credentials:");
  console.log("Admin:   admin@edusphere.edu / Admin@123");
  console.log("Teacher: prof.sharma@edusphere.edu / Teacher@123");
  console.log("Teacher (Pending Proposal): dr.banerjee@edusphere.edu / Teacher@123");
  console.log("Teacher (Must Change Pass): new.teacher@edusphere.edu / Temp@123");
  console.log("Student: rohit.sen@edusphere.edu / Student@123");
  console.log("Student (Must Change Pass): new.student@edusphere.edu / Temp@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
