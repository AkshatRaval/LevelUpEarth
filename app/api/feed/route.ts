import { NextResponse } from "next/server";
import { getFeed } from "@/services/feed.service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const data = await getFeed();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
