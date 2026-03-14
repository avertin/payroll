import { render, screen } from "@testing-library/react";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders the heading", () => {
    render(<HomePage />);
    expect(screen.getByText("Welcome to Next.js")).toBeInTheDocument();
  });
});
