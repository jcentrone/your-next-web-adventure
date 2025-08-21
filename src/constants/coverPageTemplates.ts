export const COVER_PAGE_TEMPLATES = [
  {
    id: "centered",
    container:
      "flex flex-col items-center justify-center min-h-screen text-center bg-primary text-primary-foreground",
    text: {
      title: "text-5xl font-bold text-accent",
      subtitle: "mt-4 text-xl text-secondary",
      footer: "mt-auto text-sm text-primary-foreground",
    },
  },
  {
    id: "left",
    container:
      "flex flex-col justify-center min-h-screen pl-20 bg-secondary text-secondary-foreground",
    text: {
      title: "text-5xl font-bold text-primary",
      subtitle: "mt-4 text-lg text-accent",
      footer: "mt-auto text-sm text-secondary-foreground",
    },
  },
  {
    id: "right",
    container:
      "flex flex-col items-end justify-center min-h-screen pr-20 text-right bg-secondary text-secondary-foreground",
    text: {
      title: "text-5xl font-bold text-primary",
      subtitle: "mt-4 text-lg text-accent",
      footer: "mt-auto text-sm text-secondary-foreground",
    },
  },
  {
    id: "banner",
    container:
      "flex flex-col justify-between min-h-screen bg-primary text-primary-foreground",
    text: {
      title: "mt-20 text-center text-5xl font-bold text-accent",
      subtitle: "mt-4 text-center text-lg text-secondary",
      footer: "w-full py-4 text-center bg-accent text-accent-foreground",
    },
  },
  {
    id: "split",
    container:
      "flex flex-col justify-start min-h-screen bg-secondary text-secondary-foreground",
    text: {
      title: "mt-20 text-5xl font-bold text-primary",
      subtitle: "mt-4 text-lg text-accent",
      footer: "mt-auto text-center text-sm text-secondary-foreground",
    },
  },
  {
    id: "overlay",
    container:
      "relative flex flex-col justify-center min-h-screen bg-primary text-primary-foreground",
    text: {
      title: "z-10 text-5xl font-bold text-accent",
      subtitle: "z-10 mt-4 text-lg text-secondary",
      footer: "z-10 mt-auto text-sm text-primary-foreground",
    },
  },
] as const;
