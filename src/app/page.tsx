import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.mustChangePassword) {
    redirect("/account/change-password");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (session.user.role === "TEACHER") {
    redirect("/teacher/attendance");
  } else if (session.user.role === "STUDENT") {
    redirect("/student/dashboard");
  }

  redirect("/login");
}
