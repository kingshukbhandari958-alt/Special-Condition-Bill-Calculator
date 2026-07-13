"use client";

type ValidationMessagesProps = {
  errors: string[];
  warnings: string[];
};

export function ValidationMessages({ errors, warnings }: ValidationMessagesProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <section aria-live="polite" className="space-y-3">
      {errors.length > 0 ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-sm">
          <p className="text-sm font-semibold">Blocking errors</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {warnings.length > 0 ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm">
          <p className="text-sm font-semibold">Warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
