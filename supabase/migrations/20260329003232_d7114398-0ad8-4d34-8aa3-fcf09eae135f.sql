
CREATE OR REPLACE FUNCTION public.notify_guardian_on_absence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_student RECORD;
  v_msg TEXT;
  v_msg_bn TEXT;
  v_date_str TEXT;
BEGIN
  -- Only trigger for students marked absent
  IF NEW.entity_type = 'student' AND NEW.status = 'absent' THEN
    -- Get student info
    SELECT name_bn, name_en, student_id, guardian_phone, phone
    INTO v_student
    FROM public.students
    WHERE id = NEW.entity_id;

    IF v_student IS NOT NULL AND (v_student.guardian_phone IS NOT NULL OR v_student.phone IS NOT NULL) THEN
      v_date_str := to_char(NEW.attendance_date, 'DD/MM/YYYY');
      
      v_msg := 'Dear Guardian, your ward ' || COALESCE(v_student.name_en, v_student.name_bn) || 
               ' (ID: ' || v_student.student_id || ') was absent on ' || v_date_str || 
               '. Please contact the institution for details.';
      
      v_msg_bn := 'সম্মানিত অভিভাবক, আপনার সন্তান ' || v_student.name_bn || 
                  ' (আইডি: ' || v_student.student_id || ') তারিখ ' || v_date_str || 
                  ' তে অনুপস্থিত ছিল। বিস্তারিত জানতে প্রতিষ্ঠানে যোগাযোগ করুন।';

      INSERT INTO public.guardian_notifications (
        notification_type, channel, subject, message, status,
        recipients_count, recipient_filter
      ) VALUES (
        'absence_alert', 'sms', 
        'অনুপস্থিতি বিজ্ঞপ্তি - ' || v_student.name_bn,
        v_msg_bn,
        'sent',
        1,
        jsonb_build_object(
          'student_id', NEW.entity_id,
          'student_name_bn', v_student.name_bn,
          'student_name_en', v_student.name_en,
          'guardian_phone', COALESCE(v_student.guardian_phone, v_student.phone),
          'attendance_date', v_date_str,
          'message_en', v_msg
        )
      );

      -- Also create an internal notification for admin
      INSERT INTO public.notifications (title, title_bn, message, message_bn, type, category, link)
      VALUES (
        'Absence Alert Sent: ' || COALESCE(v_student.name_en, v_student.name_bn),
        'অনুপস্থিতি বিজ্ঞপ্তি পাঠানো হয়েছে: ' || v_student.name_bn,
        'Guardian notified for absence on ' || v_date_str,
        'তারিখ ' || v_date_str || ' এর অনুপস্থিতির জন্য অভিভাবককে জানানো হয়েছে',
        'warning',
        'attendance',
        '/admin/guardian-notifications'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for new attendance records
CREATE TRIGGER trigger_notify_guardian_on_absence
AFTER INSERT ON public.attendance_records
FOR EACH ROW
EXECUTE FUNCTION public.notify_guardian_on_absence();

-- Also trigger on update (e.g., changing status to absent)
CREATE TRIGGER trigger_notify_guardian_on_absence_update
AFTER UPDATE OF status ON public.attendance_records
FOR EACH ROW
WHEN (NEW.status = 'absent' AND OLD.status IS DISTINCT FROM 'absent')
EXECUTE FUNCTION public.notify_guardian_on_absence();
