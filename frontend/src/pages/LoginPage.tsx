import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in — go straight to app
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Initialise Google Identity Services and render the button
  useEffect(() => {
    let isInitialized = false;

    const initGoogle = () => {
      if (isInitialized || !(window as any).google?.accounts?.id) return;
      isInitialized = true;

      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonRef.current) {
        (window as any).google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: buttonRef.current.offsetWidth || 280,
          text: 'continue_with',
        });
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGoogle();
    } else {
      const script = document.getElementById('google-gis');
      if (script) {
        script.addEventListener('load', initGoogle);
        return () => script.removeEventListener('load', initGoogle);
      }
    }
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    setLoading(true);
    setError(null);
    try {
      await login(response.credential);
      navigate('/', { replace: true });
    } catch (e: any) {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full min-h-full select-none overflow-hidden"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Top decorative blobs */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #E47A9D 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8C3252 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full px-6 gap-8 z-10">

        {/* Logo + brand */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-[28px] flex items-center justify-center shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #E47A9D 0%, #8C3252 100%)',
              boxShadow: '0 8px 32px rgba(228,122,157,0.3)',
            }}
          >
            <span className="text-4xl">💸</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mt-1" style={{ color: '#8C3252' }}>
            MoneyPal
          </h1>
          <p className="text-sm text-center font-medium opacity-60 max-w-[220px] leading-relaxed" style={{ color: '#8C3252' }}>
            Your personal spending tracker, beautifully simple
          </p>
        </div>

        {/* Login card */}
        <div
          className="w-full max-w-[320px] rounded-3xl p-6 flex flex-col gap-5"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.5px solid rgba(255,255,255,0.85)',
            boxShadow: '0 8px 32px rgba(140,50,82,0.1)',
          }}
        >
          <div className="text-center">
            <p className="text-[13px] font-semibold opacity-60" style={{ color: '#8C3252' }}>
              Sign in to continue
            </p>
          </div>

          {/* Google renders its button here */}
          <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />

          {loading && (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-2 border-[#E47A9D] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <p className="text-center text-xs font-semibold text-red-500">{error}</p>
          )}
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-center opacity-40 max-w-[260px] leading-relaxed" style={{ color: '#8C3252' }}>
          Your data is private and tied to your Google account. No passwords needed.
        </p>
      </div>
    </div>
  );
};
