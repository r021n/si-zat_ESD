import React from "react";
import unsLogo from "../../assets/uns_logo.webp";
import { APP_INFO } from "../../config/appInfo";

const [WORDMARK_BASE, WORDMARK_ACCENT] = APP_INFO.name.split("-");

interface SplashScreenProps {
  isFading?: boolean;
  isInitializing?: boolean;
  isStalled?: boolean;
  onSkip?: () => void;
  onRetry?: () => void;
}

export default function SplashScreen({
  isFading = false,
  isInitializing = false,
  isStalled = false,
  onSkip,
  onRetry,
}: SplashScreenProps): React.JSX.Element {
  const canStart = !isInitializing && Boolean(onSkip);

  const handleStart = () => {
    if (canStart) onSkip?.();
  };

  return (
    <section
      aria-label={`Layar pembuka ${APP_INFO.name}, ${APP_INFO.tagline}`}
      onClick={canStart ? handleStart : undefined}
      className={`fixed inset-0 z-50 overflow-y-auto bg-brand-bg transition-opacity ease-out motion-reduce:transition-none ${
        isFading ? "pointer-events-none opacity-0" : "opacity-100"
      } ${canStart ? "cursor-pointer" : ""}`}
      style={{ transitionDuration: `${APP_INFO.fadeDurationMs}ms` }}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-brand-bg px-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:border-x md:border-brand-line">
        {/* Institution attribution */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={unsLogo}
              alt="Logo Universitas Sebelas Maret"
              className="h-9 w-auto shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase leading-tight tracking-[0.1em] text-brand-dark">
                {APP_INFO.institution}
              </p>
              <p className="mt-1 text-xs font-medium leading-tight text-brand-secondary">
                {APP_INFO.faculty}
              </p>
            </div>
          </div>
          <span className="shrink-0 pt-0.5 text-xs font-semibold text-brand-secondary">
            {APP_INFO.version}
          </span>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Cover title */}
          <div className="pt-11">
            <h1 className="text-[clamp(2.5rem,12vw,3.25rem)] font-black leading-none tracking-[-0.045em] text-brand-dark">
              {WORDMARK_BASE}
              {WORDMARK_ACCENT && (
                <>
                  -
                  <span className="text-brand-primary-strong">
                    {WORDMARK_ACCENT}
                  </span>
                </>
              )}
            </h1>
            <p className="mt-3 text-[15px] font-semibold text-brand-dark">
              {APP_INFO.tagline}
            </p>
            <div
              className="mt-6 h-1 w-14 bg-brand-primary-strong"
              aria-hidden="true"
            />
          </div>

          {/* Research title */}
          <section className="mt-10 -mx-6 bg-brand-dark px-6 py-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary-soft">
              Judul Penelitian
            </h2>
            <p className="mt-3 text-[14px] leading-[1.7] text-white/90 text-pretty">
              {APP_INFO.researchTitle}
            </p>
          </section>

          {/* Developers */}
          <section className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary">
              Pengembang
            </h2>
            <ul className="mt-1 divide-y divide-brand-line border-b border-brand-line">
              {APP_INFO.developers.map((developer) => (
                <li
                  key={developer}
                  className="py-3 text-sm leading-relaxed text-brand-dark"
                >
                  {developer}
                </li>
              ))}
            </ul>
          </section>
        </main>

        {/* Readiness and entry action */}
        <footer className="flex justify-center pt-10 pb-1">
          {isInitializing ? (
            <>
              <div className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-brand-line bg-white px-5 py-4">
                <span
                  className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-primary-strong border-t-transparent motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <p
                  role="status"
                  aria-live="polite"
                  className="text-sm font-medium text-brand-secondary"
                >
                  {isStalled
                    ? "Masih menyiapkan sesi. Periksa koneksi Anda."
                    : "Menyiapkan sesi..."}
                </p>
              </div>
              {isStalled && onRetry && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRetry();
                  }}
                  className="mt-3 w-full rounded-xl px-5 py-3 text-sm font-semibold text-brand-primary-strong transition-colors hover:bg-brand-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary-strong"
                >
                  Coba lagi
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleStart();
              }}
              className="animate-pulse rounded-md px-2 py-1 text-[15px] font-semibold text-brand-primary-strong motion-reduce:animate-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary-strong"
            >
              Ketuk layar untuk mulai
            </button>
          )}
        </footer>
      </div>
    </section>
  );
}
