import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin";

test("AdminLogin renderiza", () => {
  render(
    <MemoryRouter>
      <AdminLogin />
    </MemoryRouter>
  );
});