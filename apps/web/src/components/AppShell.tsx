import type { NavigationItem } from "@nyx-os/core";
import type { ReactNode } from "react";

type AppShellProps = {
  navigation: NavigationItem[];
  children: ReactNode;
};

export function AppShell({ navigation, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="brand">
          <span className="brand-mark">N</span>
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
              <span>{item.label}</span>
              {item.status === "planned" && <small>soon</small>}
            </a>
          ))}
        </nav>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <span>Development</span>
          <strong>Runtime Ready</strong>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
