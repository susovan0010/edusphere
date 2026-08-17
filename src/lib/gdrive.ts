import { google } from "googleapis";
import { decryptToken, encryptToken } from "./crypto";
import prisma from "./prisma";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Narrow drive.file scope so the app only accesses files it creates
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export function getAuthUrl(userId: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: userId,
  });
}

export async function exchangeCodeForTokens(code: string, userId: string) {
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error("No refresh token received from Google OAuth");
  }

  const encryptedRefreshToken = encryptToken(tokens.refresh_token);

  const driveAuth = await prisma.googleDriveAuth.upsert({
    where: { userId },
    update: {
      encryptedRefreshToken,
      connectedAt: new Date(),
    },
    create: {
      userId,
      encryptedRefreshToken,
      connectedAt: new Date(),
    },
  });

  return driveAuth;
}

export async function getAuthenticatedDriveClient(userId: string) {
  const driveAuth = await prisma.googleDriveAuth.findUnique({
    where: { userId },
  });

  if (!driveAuth) {
    throw new Error("Google Drive not connected for this user");
  }

  const refreshToken = decryptToken(driveAuth.encryptedRefreshToken);
  
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: "v3", auth: client });
}

/**
 * Creates or gets the folder structure in the teacher's Drive:
 * CollegeApp -> Assignments -> <AssignmentTitle> -> Submissions -> <StudentName>
 */
export async function getOrCreateSubmissionFolderInTeacherDrive({
  teacherUserId,
  assignmentTitle,
  studentName,
}: {
  teacherUserId: string;
  assignmentTitle: string;
  studentName: string;
}) {
  const drive = await getAuthenticatedDriveClient(teacherUserId);

  // 1. Root Folder: "EduSphere CollegeApp"
  let rootFolderId: string;
  const rootRes = await drive.files.list({
    q: "name = 'EduSphere CollegeApp' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (rootRes.data.files && rootRes.data.files.length > 0) {
    rootFolderId = rootRes.data.files[0].id!;
  } else {
    const rootCreate = await drive.files.create({
      requestBody: {
        name: "EduSphere CollegeApp",
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    rootFolderId = rootCreate.data.id!;
  }

  // 2. Assignment Folder: "Assignment - <AssignmentTitle>"
  const sanitizedTitle = assignmentTitle.replace(/[/\\?%*:|"<>]/g, "-");
  let assignFolderId: string;
  const assignRes = await drive.files.list({
    q: `name = '${sanitizedTitle}' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (assignRes.data.files && assignRes.data.files.length > 0) {
    assignFolderId = assignRes.data.files[0].id!;
  } else {
    const assignCreate = await drive.files.create({
      requestBody: {
        name: sanitizedTitle,
        parents: [rootFolderId],
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    assignFolderId = assignCreate.data.id!;
  }

  // 3. Student Folder: "<StudentName>"
  const sanitizedStudent = studentName.replace(/[/\\?%*:|"<>]/g, "-");
  let studentFolderId: string;
  const studentRes = await drive.files.list({
    q: `name = '${sanitizedStudent}' and '${assignFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (studentRes.data.files && studentRes.data.files.length > 0) {
    studentFolderId = studentRes.data.files[0].id!;
  } else {
    const studentCreate = await drive.files.create({
      requestBody: {
        name: sanitizedStudent,
        parents: [assignFolderId],
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    studentFolderId = studentCreate.data.id!;
  }

  return { drive, folderId: studentFolderId };
}
