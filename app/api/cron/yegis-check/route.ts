import { NextRequest, NextResponse } from "next/server";
import { checkYegisFormsDue } from "@/modules/bildirim/actions/yegis-notifications";

/**
 * YEGİS form kontrolü için cron job endpoint
 * Vercel Cron Jobs veya manuel tetikleme için kullanılabilir
 * 
 * Vercel cron.json örneği:
 * {
 *   "crons": [{
 *     "path": "/api/cron/yegis-check",
 *     "schedule": "0 9 * * *" // Her gün saat 09:00'da
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  // API key kontrolü (opsiyonel - güvenlik için)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await checkYegisFormsDue();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("YEGİS kontrol cron job hatası:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST method da destekle (manuel tetikleme için)
export async function POST(request: NextRequest) {
  return GET(request);
}

