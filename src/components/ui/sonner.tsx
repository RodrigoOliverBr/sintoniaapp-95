
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { ThemeProvider } from "next-themes";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Use a fallback theme to avoid the error if ThemeProvider is not available
  const fallbackTheme = "light"; // Default to light theme
  const { theme = fallbackTheme } = useTheme();

  // Wrap with ThemeProvider to ensure theme context is available
  return (
    <ThemeProvider defaultTheme="light">
      <Sonner
        theme="light"
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        {...props}
      />
    </ThemeProvider>
  );
};

export { Toaster };
