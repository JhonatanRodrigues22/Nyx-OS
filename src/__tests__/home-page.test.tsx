import { render, screen } from "@testing-library/react";
import Home from "@/pages/index";

jest.mock("next/router", () => ({
  useRouter: () => ({
    query: {}
  })
}));

describe("Home", () => {
  it("shows the quick capture button", () => {
    render(<Home />);

    expect(screen.getByRole("link", { name: "Nova captura" })).toHaveAttribute(
      "href",
      "/capture"
    );
  });
});
