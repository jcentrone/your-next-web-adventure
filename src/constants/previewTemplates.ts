export const PREVIEW_TEMPLATES = {
  classic: {
    h1: "text-3xl md:text-4xl text-primary",
    h2: "mt-6 border-b border-border pb-1",
    h3: "text-muted-foreground",
  },
  modern: {
    h1: "text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
    h2: "mt-6 uppercase tracking-wider text-primary",
    h3: "text-sm text-foreground/80",
  },
  minimal: {
    h1: "text-2xl font-medium",
    h2: "mt-6 text-sm text-muted-foreground uppercase tracking-wide",
    h3: "text-xs text-muted-foreground",
  },
} as const;
