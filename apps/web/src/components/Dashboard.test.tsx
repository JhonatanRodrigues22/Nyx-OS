import { createDashboardSnapshot } from "@nyx-os/core";
import { render, screen, within } from "@testing-library/react";
import Home from "@/pages/index";

describe("Dashboard", () => {
  it("renders the development system state panel", () => {
    render(<Home snapshot={createDashboardSnapshot()} enableLiveRuntime={false} />);

    expect(screen.getByRole("heading", { name: "Nyx OS" })).toBeInTheDocument();
    expect(screen.getByText("Dashboard de Desenvolvimento")).toBeInTheDocument();
    expect(screen.getAllByText("Estado Atual").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Saude do Sistema").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tempo Online").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ambiente").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Projetos/ })).toBeInTheDocument();

    const plugins = screen.getByLabelText("Plugins registrados");
    const scheduler = screen.getByLabelText("Scheduler");
    const capabilities = screen.getByLabelText("Capabilities registradas");
    const tools = screen.getByLabelText("Tools registradas");

    expect(within(scheduler).getByRole("heading", { name: "Scheduler" })).toBeInTheDocument();
    expect(within(scheduler).getByText("Tasks Registradas")).toBeInTheDocument();
    expect(within(capabilities).getByRole("heading", { name: "Capabilities" })).toBeInTheDocument();
    expect(within(tools).getByRole("heading", { name: "Tools" })).toBeInTheDocument();
    expect(within(plugins).getByRole("heading", { name: "Plugins" })).toBeInTheDocument();
    expect(within(plugins).getByText("Runtime Diagnostics")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Eventos Recentes" })).toBeInTheDocument();
  });
});
