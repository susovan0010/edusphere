import prisma from "./prisma";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "GRADE"
  | "ATTENDANCE_MARK"
  | "APPROVAL"
  | "REJECTION"
  | "PASSWORD_CHANGE"
  | "DRIVE_CONNECT"
  | "DRIVE_DISCONNECT";

export async function logAudit({
  userId,
  action,
  targetTable,
  targetId,
  oldValue,
  newValue,
}: {
  userId: string;
  action: AuditAction;
  targetTable: string;
  targetId: string;
  oldValue?: string | object | null;
  newValue?: string | object | null;
}) {
  try {
    const oldStr = oldValue ? (typeof oldValue === "string" ? oldValue : JSON.stringify(oldValue)) : null;
    const newStr = newValue ? (typeof newValue === "string" ? newValue : JSON.stringify(newValue)) : null;

    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetTable,
        targetId,
        oldValue: oldStr,
        newValue: newStr,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
