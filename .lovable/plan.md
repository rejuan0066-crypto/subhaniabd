

## এক্সাম সেশন ব্যবস্থাপনা — বাস্তবায়ন পরিকল্পনা

### সমস্যা
বর্তমানে পরীক্ষা (Exam) সরাসরি তৈরি হয় division_id দিয়ে, কোনো Academic Session বা Class-এর সাথে সংযোগ নেই। ফলে কোন সেশনের কোন ক্লাসের ছাত্ররা পরীক্ষায় বসবে তা অটো সিলেক্ট হয় না।

### সমাধান
একটি নতুন `exam_sessions` টেবিল এবং `exam_session_students` ম্যাপিং টেবিল তৈরি করা হবে। এক্সাম সেশন তৈরির সময় Academic Session ও Class সিলেক্ট করলে সেই সেশন-ক্লাসের সব active ছাত্র অটো সিলেক্ট হবে।

### ধাপসমূহ

**ধাপ ১: ডাটাবেস মাইগ্রেশন**

দুটি নতুন টেবিল তৈরি:

```text
exam_sessions
├── id (uuid, PK)
├── name (text) — যেমন "বার্ষিক পরীক্ষা ২০২৬"
├── name_bn (text)
├── academic_session_id (uuid → academic_sessions.id)
├── exam_type (text) — annual / half_yearly / pre_test
├── is_active (boolean, default true)
├── created_at, updated_at

exam_session_classes
├── id (uuid, PK)
├── exam_session_id (uuid → exam_sessions.id)
├── class_id (uuid → classes.id)
├── student_count (integer)
├── created_at
```

- `exam_session_students` ম্যাপিং টেবিল (exam_session_id + student_id) — এক্সাম সেশন ফাইনালাইজ করলে ছাত্রদের ম্যাপ করে রাখবে
- RLS: admin/staff manage, public view

**ধাপ ২: এক্সাম সেশন ম্যানেজমেন্ট পেজ তৈরি**

নতুন ফাইল: `src/pages/admin/AdminExamSessions.tsx`

- Academic Session ড্রপডাউন (academic_sessions টেবিল থেকে)
- এক্সাম টাইপ সিলেক্ট (বার্ষিক/অর্ধবার্ষিক/প্রাক-নির্বাচনী)
- এক্সাম সেশনের নাম ইনপুট
- ক্লাস মাল্টি-সিলেক্ট — সিলেক্ট করলে প্রতিটি ক্লাসে কতজন active ছাত্র আছে তা দেখাবে
- "ফাইনালাইজ" বাটন — students টেবিল থেকে সিলেক্টেড session_id + class_id অনুযায়ী active ছাত্রদের exam_session_students টেবিলে ম্যাপ করবে
- তৈরি হওয়া এক্সাম সেশনের তালিকা (টেবিল ফরম্যাট)

**ধাপ ৩: রেজাল্ট পেজ আপডেট (AdminResults.tsx)**

- বর্তমান division-ভিত্তিক ফিল্টার → exam_session ড্রপডাউনে পরিবর্তন
- এক্সাম সেশন সিলেক্ট করলে → exam_session_students থেকে ছাত্র তালিকা আসবে
- বিষয় class_id অনুযায়ী ফিল্টার হবে (subjects টেবিলে class_id আছে)
- বিদ্যমান marks entry ও grade calculation লজিক অক্ষুণ্ণ থাকবে

**ধাপ ৪: রাউট ও মেনু যোগ**

- App.tsx-এ `/admin/exam-sessions` রাউট যোগ
- সাইডবার মেনুতে "এক্সাম সেশন" আইটেম যোগ

### যা পরিবর্তন হবে না
- বিদ্যমান students টেবিলের কোনো কলাম
- ভর্তি ফর্মের লজিক
- বর্তমান exams/results টেবিলের স্ট্রাকচার (নতুন টেবিলে কাজ হবে)
- UI ডিজাইন, রঙ, ফন্ট

### টেকনিক্যাল নোট
- ছাত্র অটো-সিলেক্ট কুয়েরি: `students WHERE session_id = ? AND class_id = ? AND status = 'active'`
- promoted ছাত্ররাও ধরা পড়বে কারণ promotion-এ তাদের class_id আপডেট হয় কিন্তু session_id একই থাকে

