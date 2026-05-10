import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAction } from "@/services/action.service";

export const POST = async (req: NextRequest) => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const photo = formData.get("photo") as File | null;

    if (!photo) {
      return NextResponse.json({ message: "File Not Found" }, { status: 404 });
    }

    const result = await createAction(user.id, type, title, description, photo);

    return NextResponse.json({
      message: `Action '${type}' recorded!`,
      success: true,
      imageUrl: result.imageUrl,
      xp: result.xp,
      level: result.level,
      streak: result.streak,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
};
