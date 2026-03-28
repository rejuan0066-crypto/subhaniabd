
CREATE TABLE public.guardian_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL DEFAULT 'general',
  channel TEXT NOT NULL DEFAULT 'sms',
  template_key TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  recipient_filter JSONB DEFAULT '{}'::jsonb,
  recipients_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  sent_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.guardian_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage guardian_notifications"
  ON public.guardian_notifications FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'fee_reminder',
  channel TEXT NOT NULL DEFAULT 'sms',
  subject TEXT,
  body TEXT NOT NULL,
  body_bn TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notification_templates"
  ON public.notification_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view notification_templates"
  ON public.notification_templates FOR SELECT TO public
  USING (is_active = true);

-- Seed default templates
INSERT INTO public.notification_templates (name, name_bn, template_type, channel, subject, body, body_bn, variables) VALUES
('Fee Payment Reminder', 'ফি পরিশোধের রিমাইন্ডার', 'fee_reminder', 'sms', NULL, 'Dear Guardian, your ward {{student_name}} (ID: {{student_id}}) has pending fee of ৳{{amount}} for {{month}}. Please pay at the earliest.', 'সম্মানিত অভিভাবক, আপনার সন্তান {{student_name}} (আইডি: {{student_id}}) এর {{month}} মাসের ৳{{amount}} টাকা ফি বকেয়া আছে। অনুগ্রহ করে দ্রুত পরিশোধ করুন।', '["student_name","student_id","amount","month"]'::jsonb),
('Absence Notification', 'অনুপস্থিতি বিজ্ঞপ্তি', 'attendance', 'sms', NULL, 'Dear Guardian, your ward {{student_name}} (Roll: {{roll}}) was absent on {{date}}. Please contact the institution.', 'সম্মানিত অভিভাবক, আপনার সন্তান {{student_name}} (রোল: {{roll}}) {{date}} তারিখে অনুপস্থিত ছিল। অনুগ্রহ করে প্রতিষ্ঠানে যোগাযোগ করুন।', '["student_name","roll","date"]'::jsonb),
('Result Published', 'ফলাফল প্রকাশ', 'result', 'sms', NULL, 'Dear Guardian, the {{exam_name}} results have been published. Your ward {{student_name}} achieved GPA {{gpa}}. Check the website for details.', 'সম্মানিত অভিভাবক, {{exam_name}} এর ফলাফল প্রকাশিত হয়েছে। আপনার সন্তান {{student_name}} জিপিএ {{gpa}} পেয়েছে। বিস্তারিত ওয়েবসাইটে দেখুন।', '["exam_name","student_name","gpa"]'::jsonb),
('General Notice', 'সাধারণ বিজ্ঞপ্তি', 'general', 'sms', NULL, 'Dear Guardian, {{message}}', 'সম্মানিত অভিভাবক, {{message}}', '["message"]'::jsonb),
('Fee Payment Reminder (Email)', 'ফি পরিশোধের রিমাইন্ডার (ইমেইল)', 'fee_reminder', 'email', 'Fee Payment Reminder - {{student_name}}', 'Dear Guardian,\n\nThis is to inform you that your ward {{student_name}} (ID: {{student_id}}) has a pending fee of ৳{{amount}} for the month of {{month}}.\n\nPlease ensure timely payment to avoid any inconvenience.\n\nRegards,\nInstitution Administration', 'সম্মানিত অভিভাবক,\n\nআপনাকে জানানো যাচ্ছে যে আপনার সন্তান {{student_name}} (আইডি: {{student_id}}) এর {{month}} মাসের ৳{{amount}} টাকা ফি বকেয়া আছে।\n\nঅসুবিধা এড়াতে অনুগ্রহ করে সময়মতো পরিশোধ করুন।\n\nশুভেচ্ছান্তে,\nপ্রতিষ্ঠান প্রশাসন', '["student_name","student_id","amount","month"]'::jsonb),
('Absence Notification (Email)', 'অনুপস্থিতি বিজ্ঞপ্তি (ইমেইল)', 'attendance', 'email', 'Absence Notification - {{student_name}}', 'Dear Guardian,\n\nThis is to inform you that your ward {{student_name}} (Roll: {{roll}}) was marked absent on {{date}}.\n\nPlease contact the institution for further details.\n\nRegards,\nInstitution Administration', 'সম্মানিত অভিভাবক,\n\nআপনাকে জানানো যাচ্ছে যে আপনার সন্তান {{student_name}} (রোল: {{roll}}) {{date}} তারিখে অনুপস্থিত ছিল।\n\nবিস্তারিত জানতে অনুগ্রহ করে প্রতিষ্ঠানে যোগাযোগ করুন।\n\nশুভেচ্ছান্তে,\nপ্রতিষ্ঠান প্রশাসন', '["student_name","roll","date"]'::jsonb);
