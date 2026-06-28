import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Carrito from "../pages/Carrito";
import { CarritoProvider } from "../context/CarritoContext";

test("Carrito renderiza", () => {
  render(
    <MemoryRouter>
      <CarritoProvider>
        <Carrito />
      </CarritoProvider>
    </MemoryRouter>
  );
});