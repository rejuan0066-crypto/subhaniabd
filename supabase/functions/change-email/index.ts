import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { new_email, otp_code } = await req.json();

    if (!new_email || !otp_code) {
      return new Response(JSON.stringify({ error: "new_email and otp_code are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user has admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify OTP for the new email
    const { data: otpRecord } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", new_email)
      .eq("purpose", "email_verification")
      .eq("is_used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpRecord) {
      return new Response(JSON.stringify({ error: "No valid OTP found. Please request a new code." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      await supabaseAdmin.from("otp_codes").update({ is_used: true }).eq("id", otpRecord.id);
      return new Response(JSON.stringify({ error: "OTP has expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.max_attempts) {
      await supabaseAdmin.from("otp_codes").update({ is_used: true }).eq("id", otpRecord.id);
      return new Response(JSON.stringify({ error: "Maximum attempts exceeded" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment attempts
    await supabaseAdmin
      .from("otp_codes")
      .update({ attempts: otpRecord.attempts + 1 })
      .eq("id", otpRecord.id);

    // Verify code
    if (otpRecord.code !== otp_code) {
      const remaining = otpRecord.max_attempts - otpRecord.attempts - 1;
      return new Response(JSON.stringify({ error: `Invalid code. ${remaining} attempts remaining.` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark OTP as used
    await supabaseAdmin.from("otp_codes").update({ is_used: true }).eq("id", otpRecord.id);

    // Update user email using admin API (bypasses confirmation)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email: new_email,
      email_confirm: true,
    });

    if (updateError) {
      return new Response(JSON.stringify({ error: "Failed to update email: " + updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Email updated successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Change email error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
