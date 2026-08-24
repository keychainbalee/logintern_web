import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users -> Fetch list of all registered users from User table
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        fullName: true,
        username: true,
        birthPlace: true,
        birthDate: true,
        institution: true,
        major: true,
        companyName: true,
        mentorName: true,
        isOnboarded: true,
        createdAt: true,
        _count: {
          select: { logs: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users list:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar pengguna" }, { status: 500 });
  }
}
