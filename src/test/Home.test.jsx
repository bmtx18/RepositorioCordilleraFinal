import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Home from "../pages/Home";

import { AuthProvider } from "../context/AuthContext";
import { CarritoProvider } from "../context/CarritoContext";

test("Home renderiza", () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <CarritoProvider>
          <Home />
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>
  );
});