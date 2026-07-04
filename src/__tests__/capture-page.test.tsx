import { fireEvent, render, screen } from "@testing-library/react";
import CapturePage from "@/pages/capture";

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe("CapturePage", () => {
  it.each([
    ["Tarefa", "Formulario de tarefa"],
    ["Nota", "Formulario de nota"],
    ["Financa", "Formulario financeiro"],
    ["Decisao", "Formulario de decisao"]
  ])("renders the %s capture form", (option, formName) => {
    render(<CapturePage />);

    fireEvent.click(screen.getByLabelText(option));

    expect(screen.getByRole("region", { name: formName })).toBeInTheDocument();
  });
});
