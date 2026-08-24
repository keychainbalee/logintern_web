import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/user/profile -> Fetch current user profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Gagal mengambil data profil" }, { status: 500 });
  }
}

// POST /api/user/profile -> Complete/Update onboarding profile
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fullName, username, birthPlace, birthDate, institution, major, companyName, mentorName } = body;

    if (!fullName || !username || !birthPlace || !birthDate || !institution || !major || !companyName) {
      return NextResponse.json({ error: "Semua kolom utama wajib diisi" }, { status: 400 });
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username.toLowerCase().trim(),
        NOT: { id: session.user.id },
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username sudah digunakan, silakan pilih username lain" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: fullName.trim(),
        username: username.toLowerCase().trim(),
        birthPlace: birthPlace.trim(),
        birthDate: new Date(birthDate),
        institution: institution.trim(),
        major: major.trim(),
        companyName: companyName ? companyName.trim() : null,
        mentorName: mentorName ? mentorName.trim() : null,
        isOnboarded: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Gagal menyimpan data profil" }, { status: 500 });
  }
}
