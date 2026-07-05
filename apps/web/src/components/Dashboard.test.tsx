import { createDashboardSnapshot } from "@nyx-os/core";
import { render, screen, within } from "@testing-library/react";
import Home from "@/pages/index";

describe("Dashboard", () => {
  it("renders runtime health and planned navigation", () => {
    render(<Home snapshot={createDashboardSnapshot()} />);

    expect(screen.getByRole("heading", { name: "Nyx OS" })).toBeInTheDocument();
    const healthCheck = screen.getByLabelText("Health check");

    expect(within(healthCheck).getByText("Runtime Ready")).toBeInTheDocument();
    expect(within(healthCheck).getByText("All core systems online")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Projetos/ })).toBeInTheDocument();
    const plugins = screen.getByLabelText("Plugins registrados");
    const scheduler = screen.getByLabelText("Tarefas agendadas");

    expect(within(scheduler).getByRole("heading", { name: "Scheduler" })).toBeInTheDocument();
    expect(within(plugins).getByRole("heading", { name: "Plugins" })).toBeInTheDocument();
    expect(within(plugins).getByText("Runtime Diagnostics")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Eventos recentes" })).toBeInTheDocument();
  });
});
