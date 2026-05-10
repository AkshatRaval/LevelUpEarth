import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { toggleActionLike } from "@/services/feed.service";

export async function POST(request: Request) {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {

    const { actionId } = await request.json();

    if (!actionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing actionId",
        },
        { status: 400 }
      );
    }

    const result = await toggleActionLike(
      actionId,
      user.id
    );

    return NextResponse.json({
      success: true,
      liked: result.liked,
    });

  } catch (error: any) {

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}