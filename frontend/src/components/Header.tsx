"use client";

export type View = "playground" | "compare" | "learn";

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "playground", label: "Playground" },
  { id: "compare", label: "Compare" },
  { id: "learn", label: "Learn" },
];

interface HeaderProps {
  view: View;
  onViewChange: (view: View) => void;
  onOpenGlossary: () => void;
}

const NAV_BUTTON =
  "inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

export function Header({ view, onViewChange, onOpenGlossary }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            onViewChange("playground");
          }}
          className="inline-flex h-9 items-center gap-2 text-sm font-bold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg px-1"
        >
          <span aria-hidden className="text-lg">
            🎨
          </span>
          Tokenizer Playground
        </a>

        <nav aria-label="Main" className="order-3 flex w-full gap-1.5 sm:order-none sm:w-auto sm:ml-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => onViewChange(item.id)}
              className={`${NAV_BUTTON} ${
                view === item.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenGlossary}
            className={`${NAV_BUTTON} text-slate-600 hover:bg-slate-100 hover:text-slate-900`}
          >
            <span aria-hidden className="mr-1.5">
              📖
            </span>
            Glossary
          </button>
        </div>
      </div>
    </header>
  );
}
