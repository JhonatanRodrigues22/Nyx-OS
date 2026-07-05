import type { NavigationItem } from "@nyx-os/core";
import type { ReactNode } from "react";

type AppShellProps = {
  navigation: NavigationItem[];
  children: ReactNode;
};

const navGlyphs: Record<string, string> = {
  home: "⌂",
  projects: "⌘",
  memory: "▣",
  calendar: "□",
  automation: "⌬",
  ai: "◇",
  system: "◈",
  settings: "⚙"
};

export function AppShell({ navigation, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegacao principal">
        <div className="brand">
          <span className="brand-mark">
            <span>N</span>
          </span>
          <div>
            <strong>Nyx OS</strong>
            <span>Personal runtime</span>
          </div>
        </div>
        <nav className="nav-list">
          {navigation.map((item) => (
            <a
              aria-current={item.status === "active" ? "page" : undefined}
              className={item.status === "active" ? "nav-item active" : "nav-item"}
              href="#"
              key={item.area}
            >
              <span className="nav-label">
                <span aria-hidden="true" className="nav-glyph">
                  {navGlyphs[item.area] ?? "·"}
                </span>
                <span>{item.label}</span>
              </span>
              {item.status === "planned" && <small>soon</small>}
            </a>
          ))}
        </nav>
        <div className="sidebar-system-card" aria-hidden="true">
          <span>NYX CORE</span>
          <strong>v0.1.0</strong>
          <small>DEVELOPMENT //</small>
        </div>
        <div className="sidebar-orbital" aria-hidden="true">
          <span />
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span>Nyx OS Development Dashboard</span>
          <strong>Runtime Ready</strong>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
