/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [notifications, pendingCount] = await Promise.all([
      (prisma as any).notification.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      session.role === "ADMIN"
        ? Promise.all([
            (prisma.car as any).count({ where: { status: "PENDING" } }),
            (prisma.property as any).count({ where: { status: "PENDING" } }),
          ]).then(([cars, props]: [number, number]) => cars + props)
        : Promise.resolve(0),
    ]);

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return NextResponse.json({ notifications, unreadCount, pendingCount });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await (prisma as any).notification.updateMany({
      where: { userId: session.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
