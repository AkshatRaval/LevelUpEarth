import { NextResponse } from "next/server";
import { getLeaderboard } from "@/services/leaderboard.service";

export async function GET() {
  try {
    const data = await getLeaderboard();

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
