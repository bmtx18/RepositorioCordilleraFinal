import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Navbar from "../components/Navbar";

import { CarritoProvider } from "../context/CarritoContext";
import { AuthProvider } from "../context/AuthContext";

test("Navbar renderiza correctamente", () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <CarritoProvider>
          <Navbar />
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>
  );
});