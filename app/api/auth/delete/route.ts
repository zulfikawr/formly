import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/db";

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const decoded = payload as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.response.deleteMany({
        where: { form: { userId: decoded.id } },
      }),
      prisma.question.deleteMany({
        where: { form: { userId: decoded.id } },
      }),
      prisma.form.deleteMany({
        where: { userId: decoded.id },
      }),
      prisma.user.delete({
        where: { id: decoded.id },
      }),
    ]);

    // Clear the auth cookie
    cookieStore.delete("auth-token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
