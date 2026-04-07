interface LoadingScreenProps {
  progress: number;
  stepLabel: string;
}

export function LoadingScreen({ progress, stepLabel }: LoadingScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10 text-white">
      <section
        className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-panel backdrop-blur"
        data-testid="loading-screen"
      >
        <p className="font-display text-sm uppercase tracking-[0.35em] text-plum-200">
          Loading
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
          Preparing your local edit bay
        </h1>
        <p className="mt-4 max-w-lg text-base text-plum-100/85 sm:text-lg">
          {stepLabel}
        </p>
        <div className="mt-8 h-3 overflow-hidden rounded-full bg-plum-950/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-plum-200 via-white to-plum-300 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-plum-100/70">
          <span>Static frontend startup</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </section>
    </main>
  );
}
