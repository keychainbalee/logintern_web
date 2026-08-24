import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [logs, user] = await Promise.all([
      prisma.internshipLog.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyName: true, mentorName: true },
      }),
    ]);

    const formattedLogs = logs.map((log) => ({
      ...log,
      companyName: log.companyName || user?.companyName || null,
      mentorName: log.mentorName || user?.mentorName || null,
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { date, workMode, startTime, endTime, companyName, mentorName, activityDesc, documentationUrl } = body;

    if (!date || !workMode || !startTime || !endTime || !activityDesc) {
      return NextResponse.json({ error: "Kolom tanggal, mode kerja, waktu, dan aktivitas wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyName: true, mentorName: true },
    });

    const log = await prisma.internshipLog.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        workMode,
        startTime,
        endTime,
        companyName: companyName ? companyName.trim() : (user?.companyName || null),
        mentorName: mentorName ? mentorName.trim() : (user?.mentorName || null),
        activityDesc,
        documentationUrl: documentationUrl || null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Error creating log:", error);
    return NextResponse.json({ error: "Gagal menyimpan notulensi catatan harian" }, { status: 500 });
  }
}
