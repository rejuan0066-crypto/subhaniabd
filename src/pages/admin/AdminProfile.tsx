import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, Eye, EyeOff, User, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminProfile = () => {
  const { language } = useLanguage();
  const bn = language === 'bn';

  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setCurrentEmail(user.email);
    };
    getUser();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [countdown]);

  // Listen for email change confirmation
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && session?.user?.email && pendingEmail && session.user.email === pendingEmail) {
        setCurrentEmail(session.user.email);
        setPendingEmail(null);
        setCountdown(0);
        toast.success(bn ? 'ইমেইল সফলভাবে পরিবর্তন হয়েছে!' : 'Email changed successfully!');
      }
    });
    return () => subscription.unsubscribe();
  }, [pendingEmail, bn]);

  const sendEmailChange = useCallback(async () => {
    const targetEmail = pendingEmail || newEmail.trim();
    const password = emailPassword.trim();

    if (!targetEmail) {
      toast.error(bn ? 'নতুন ইমেইল দিন' : 'Enter new email');
      return;
    }
    if (!password) {
      toast.error(bn ? 'বর্তমান পাসওয়ার্ড দিন' : 'Enter current password');
      return;
    }
    if (targetEmail === currentEmail) {
      toast.error(bn ? 'নতুন ইমেইল বর্তমান ইমেইলের মতো' : 'New email is same as current');
      return;
    }

    setChangingEmail(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password,
    });
    if (signInError) {
      toast.error(bn ? 'পাসওয়ার্ড ভুল' : 'Incorrect password');
      setChangingEmail(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: targetEmail });
    setChangingEmail(false);

    if (error) {
      toast.error(error.message);
    } else {
      setPendingEmail(targetEmail);
      setCountdown(30);
      toast.success(
        bn
          ? `${targetEmail} এ ভেরিফিকেশন লিংক পাঠানো হয়েছে।`
          : `Verification link sent to ${targetEmail}.`
      );
    }
  }, [pendingEmail, newEmail, emailPassword, currentEmail, bn]);

  const handleCancelPending = () => {
    setPendingEmail(null);
    setCountdown(0);
    setNewEmail('');
    setEmailPassword('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          {bn ? 'প্রোফাইল' : 'Profile'}
        </h1>

        {/* Email Change */}
        <div className="card-elevated p-5">
          <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> {bn ? 'লগইন ইমেইল পরিবর্তন' : 'Change Login Email'}
          </h3>

          {/* Pending verification banner */}
          {pendingEmail && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {bn ? 'ভেরিফিকেশন পেন্ডিং' : 'Verification Pending'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bn
                      ? `${pendingEmail} এ একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। লিংকে ক্লিক করলে ইমেইল আপডেট হবে।`
                      : `A verification link has been sent to ${pendingEmail}. Click it to confirm the change.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={sendEmailChange}
                  disabled={countdown > 0 || changingEmail}
                  className="gap-2"
                >
                  {changingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {countdown > 0
                    ? (bn ? `${countdown}s পর আবার পাঠান` : `Resend in ${countdown}s`)
                    : (bn ? 'আবার কোড পাঠান' : 'Resend')}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelPending}>
                  {bn ? 'বাতিল' : 'Cancel'}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label>{bn ? 'বর্তমান ইমেইল' : 'Current Email'}</Label>
              <Input className="mt-1 bg-muted/50" value={currentEmail} readOnly />
            </div>

            {!pendingEmail && (
              <>
                <div>
                  <Label>{bn ? 'নতুন ইমেইল' : 'New Email'}</Label>
                  <Input
                    className="mt-1 bg-background"
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder={bn ? 'নতুন ইমেইল অ্যাড্রেস' : 'New email address'}
                  />
                </div>
                <div>
                  <Label>{bn ? 'বর্তমান পাসওয়ার্ড (নিশ্চিতকরণ)' : 'Current Password (confirmation)'}</Label>
                  <div className="relative mt-1">
                    <Input
                      className="bg-background pr-10"
                      type={showEmailPassword ? 'text' : 'password'}
                      value={emailPassword}
                      onChange={e => setEmailPassword(e.target.value)}
                      placeholder={bn ? 'পাসওয়ার্ড দিন' : 'Enter password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailPassword(!showEmailPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button onClick={sendEmailChange} disabled={changingEmail} className="btn-primary-gradient">
                  {changingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                  {bn ? 'ইমেইল পরিবর্তন করুন' : 'Change Email'}
                </Button>
              </>
            )}

            <p className="text-xs text-muted-foreground">
              {bn ? '⚠️ নতুন ইমেইলে ভেরিফিকেশন লিংক যাবে। লিংকে ক্লিক করলে ইমেইল আপডেট হবে।' : '⚠️ A verification link will be sent to the new email. Click it to confirm the change.'}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
