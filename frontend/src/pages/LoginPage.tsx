import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '337104221761-ckgbvjs1va30j2l2d5ndh9r2mnlf2mnc.apps.googleusercontent.com';

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
    <div className="flex flex-col items-center justify-between w-full h-full min-h-full select-none overflow-hidden bg-[#FAF8F5] relative">
      {/* Top decorative ambient pink blobs */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-40 pointer-events-none blur-2xl"
        style={{ background: 'radial-gradient(circle, #E47A9D 0%, #D0A1BA 50%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-30 pointer-events-none blur-2xl"
        style={{ background: 'radial-gradient(circle, #C85A7E 0%, #FDF0F5 70%)' }}
      />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full px-6 gap-8 z-10">

        {/* Hero Standalone Brand Logo */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="/logo.png"
            alt="MoneyPal Logo"
            className="w-36 h-36 md:w-40 md:h-40 object-contain filter drop-shadow-[0_10px_25px_rgba(228,122,157,0.35)] transform hover:scale-105 transition-transform duration-300 pointer-events-none"
          />

          <h1
            className="text-4xl font-extrabold tracking-tight mt-1 text-center"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              color: '#8C3252',
            }}
          >
            Money<span className="text-[#E47A9D]">Pal</span>
          </h1>

          <p className="text-sm text-center font-medium text-[#6E6B73] max-w-[240px] leading-relaxed">
            Smart Spending. Pure Simplicity.
          </p>
        </div>


        {/* Catchy Frosted Glass Login Card */}
        <div
          className="w-full max-w-[320px] rounded-3xl p-6 flex flex-col gap-5 bg-white/70 backdrop-blur-2xl border-1.5 border-white shadow-[0_10px_40px_rgba(140,50,82,0.12)]"
        >
          <div className="text-center">
            <p className="text-[13px] font-bold tracking-wide uppercase text-[#8C3252]">
              Welcome Back
            </p>
            <p className="text-xs text-[#6E6B73] font-medium mt-0.5">
              Sign in with Google to continue
            </p>
          </div>

          {/* Google renders button here */}
          <div ref={buttonRef} className="w-full flex justify-center min-h-[44px]" />

          {loading && (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-2 border-[#E47A9D] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <p className="text-center text-xs font-semibold text-rose-600">{error}</p>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-[#8C3252]/60 max-w-[260px] leading-relaxed font-medium">
          🔒 Secure & private. No passwords needed.
        </p>
      </div>
    </div>
  );
};
