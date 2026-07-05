import { render, screen } from "@testing-library/react";
import { StatusCard } from "./StatusCard";

describe("StatusCard", () => {
  it("renders the title and description", () => {
    render(<StatusCard title="Supabase" description="Banco e autenticacao." />);

    expect(screen.getByRole("heading", { name: "Supabase" })).toBeInTheDocument();
    expect(screen.getByText("Banco e autenticacao.")).toBeInTheDocument();
  });
});
