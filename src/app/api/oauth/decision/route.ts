import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Handles approve/deny from the OAuth consent screen. */
export async function POST(request: Request) {
  const formData = await request.formData();
  const decision = formData.get("decision");
  const authorizationId = formData.get("authorization_id");

  if (typeof authorizationId !== "string" || !authorizationId) {
    return NextResponse.json({ error: "Missing authorization_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data, error } =
    decision === "approve"
      ? await supabase.auth.oauth.approveAuthorization(authorizationId)
      : await supabase.auth.oauth.denyAuthorization(authorizationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 303, not the NextResponse.redirect default of 307: this request arrived
  // as a POST (form submit) and OAuth callback redirects must land as GET.
  // A 307/308 would preserve POST and Claude's callback endpoint rejects
  // that with 405 Method Not Allowed — 303 is what forces the GET.
  return NextResponse.redirect(data.redirect_url, 303);
}
