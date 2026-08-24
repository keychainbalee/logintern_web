import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const log = await prisma.internshipLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            companyName: true,
            mentorName: true,
          },
        },
      },
    });

    if (!log || log.userId !== session.user.id) {
      return NextResponse.json({ error: "Notulensi tidak ditemukan" }, { status: 404 });
    }

    const companyName = log.companyName || log.user?.companyName || null;
    const mentorName = log.mentorName || log.user?.mentorName || null;

    return NextResponse.json({
      ...log,
      companyName,
      mentorName,
    });
  } catch (error) {
    console.error("Error fetching log details:", error);
    return NextResponse.json({ error: "Gagal mengambil detail notulensi" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existingLog = await prisma.internshipLog.findUnique({
      where: { id },
    });

    if (!existingLog || existingLog.userId !== session.user.id) {
      return NextResponse.json({ error: "Notulensi tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const { date, workMode, startTime, endTime, companyName, mentorName, activityDesc, documentationUrl } = body;

    if (!date || !workMode || !startTime || !endTime || !activityDesc) {
      return NextResponse.json({ error: "Semua kolom wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyName: true, mentorName: true },
    });

    const updatedLog = await prisma.internshipLog.update({
      where: { id },
      data: {
        date: new Date(date),
        workMode,
        startTime,
        endTime,
        companyName: companyName ? companyName.trim() : (existingLog.companyName || user?.companyName || null),
        mentorName: mentorName ? mentorName.trim() : (existingLog.mentorName || user?.mentorName || null),
        activityDesc,
        documentationUrl: documentationUrl || null,
      },
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error("Error updating log:", error);
    return NextResponse.json({ error: "Gagal memperbarui notulensi" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existingLog = await prisma.internshipLog.findUnique({
      where: { id },
    });

    if (!existingLog || existingLog.userId !== session.user.id) {
      return NextResponse.json({ error: "Notulensi tidak ditemukan" }, { status: 404 });
    }

    await prisma.internshipLog.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Notulensi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json({ error: "Gagal menghapus notulensi" }, { status: 500 });
  }
}
