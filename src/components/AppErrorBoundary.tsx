import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App crashed during render", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isFileProtocol = typeof window !== "undefined" && window.location.protocol === "file:";
      const homeHref = isFileProtocol ? "./#/" : "/";
      const developerHref = isFileProtocol ? "./#/developer" : "/developer";

      return (
        <div className="min-h-screen bg-hero bg-glow px-4 py-24 text-foreground">
          <div className="glass-strong mx-auto flex max-w-2xl flex-col gap-4 rounded-3xl border border-border p-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Something went wrong</p>
            <h1 className="font-display text-3xl font-bold">The page could not load fully.</h1>
            <p className="text-sm text-muted-foreground">
              Try reloading the page. If you opened the built site directly from a file, this project now supports local opening after rebuilding.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={homeHref}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Go Home
              </a>
              <a
                href={developerHref}
                className="glass rounded-xl px-5 py-3 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Developer Page
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
