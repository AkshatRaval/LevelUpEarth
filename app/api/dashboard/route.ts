import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboard.service";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const data = await getDashboardStats(user.id);
    return NextResponse.json({
      success: true,
      user,
      ...data
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}