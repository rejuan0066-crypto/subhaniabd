import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tables that should NOT be backed up (internal/system tables)
const EXCLUDED_TABLES = ['otp_codes', 'profiles'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user via anon client with user's token
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Session expired. Please login again.' }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub as string;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'super_admin'])
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: corsHeaders });
    }

    // Dynamically fetch all public tables
    const { data: tableRows, error: tableError } = await supabase.rpc('get_public_tables');
    
    let allTables: string[];
    if (tableError || !tableRows) {
      // Fallback: hardcoded list if RPC not available
      allTables = [
        'academic_sessions', 'address_custom', 'address_levels', 'api_verification_config',
        'attendance_devices', 'attendance_records', 'attendance_rules',
        'class_routines', 'classes', 'custom_form_fields', 'custom_form_submissions', 'custom_forms', 'custom_roles',
        'deposits', 'designations', 'divisions', 'document_layouts', 'donors',
        'emailjs_config', 'exam_routine_entries', 'exam_routines', 'exam_session_classes',
        'exam_session_students', 'exam_session_subjects', 'exam_sessions', 'exam_types',
        'expense_categories', 'expense_institutions', 'expense_monthly_summary', 'expenses',
        'fee_categories', 'fee_payments', 'fee_types', 'fee_waivers', 'form_settings', 'formulas',
        'guardian_notifications', 'holidays', 'institutions', 'joining_letters',
        'library_books', 'library_fines', 'library_issuances',
        'notices', 'notification_templates', 'notifications',
        'payment_gateway_config', 'payments', 'pending_actions',
        'post_comments', 'post_likes', 'posts', 'promotion_history',
        'question_papers', 'questions', 'receipt_counter', 'receipt_settings',
        'resign_letters', 'results', 'role_permissions', 'routine_periods',
        'salary_records', 'salary_savings', 'salary_savings_ledger', 'salary_settings',
        'sms_gateway_config', 'smtp_config', 'staff', 'staff_categories', 'student_categories', 'students',
        'subjects', 'system_modules', 'user_permissions', 'user_roles', 'validation_rules', 'website_settings',
      ];
    } else {
      allTables = (tableRows as any[]).map((r: any) => r.table_name);
    }

    // Filter out excluded tables
    const TABLES = allTables.filter(t => !EXCLUDED_TABLES.includes(t));

    const url = new URL(req.url);
    const tableParam = url.searchParams.get('table');
    const format = url.searchParams.get('format') || 'json';

    const tablesToExport = tableParam ? [tableParam] : TABLES;
    const backup: Record<string, any> = {
      metadata: {
        exported_at: new Date().toISOString(),
        exported_by: (claimsData.claims.email as string) || userId,
        tables: tablesToExport,
        total_tables: tablesToExport.length,
        format,
      },
    };

    for (const table of tablesToExport) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        backup[table] = { error: error.message, count: 0 };
      } else {
        backup[table] = { data: data || [], count: (data || []).length };
      }
    }

    if (format === 'csv' && tableParam) {
      const tableData = backup[tableParam]?.data || [];
      if (tableData.length === 0) {
        return new Response('No data', { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
      }
      const headers = Object.keys(tableData[0]);
      const csvRows = [
        headers.join(','),
        ...tableData.map((row: any) =>
          headers.map(h => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"` : str;
          }).join(',')
        ),
      ];
      const csv = '\uFEFF' + csvRows.join('\n');
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${tableParam}_backup.csv"`,
        },
      });
    }

    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
