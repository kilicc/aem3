import { NextRequest, NextResponse } from "next/server";
import { checkMaintenanceDue } from "@/modules/arac-bakim/actions/vehicles";

export async function GET(request: NextRequest) {
  try {
    // API key kontrolü (opsiyonel - güvenlik için)
    const authHeader = request.headers.get("authorization");
    const apiKey = process.env.MAINTENANCE_CHECK_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await checkMaintenanceDue();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

