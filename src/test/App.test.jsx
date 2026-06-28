import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { CarritoProvider } from "../context/CarritoContext";

test("Renderiza la aplicación", () => {
  render(
    <MemoryRouter>
      <CarritoProvider>
        <App />
      </CarritoProvider>
    </MemoryRouter>
  );
});