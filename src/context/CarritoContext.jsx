// src/context/CarritoContext.jsx

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback
} from "react";

const CarritoContext = createContext(null);

const STORAGE_KEY = "gc_carrito";

function reducer(state, action) {

  switch (action.type) {

    case "AGREGAR": {

      const existe = state.items.find(
        i => i.id === action.producto.id
      );

      const items = existe

        ? state.items.map(i =>

            i.id === action.producto.id

              ? {
                  ...i,
                  cantidad: i.cantidad + (action.cantidad || 1)
                }

              : i
          )

        : [
            ...state.items,
            {
              ...action.producto,
              cantidad: action.cantidad || 1
            }
          ];

      return {
        ...state,
        items
      };
    }

    case "QUITAR":

      return {
        ...state,
        items: state.items.filter(
          i => i.id !== action.id
        )
      };

    // 🔥 AGREGADO
    // Evita cantidades 0 o negativas
    case "CAMBIAR_CANTIDAD": {

      if (action.cantidad <= 0) {

        return {
          ...state,
          items: state.items.filter(
            i => i.id !== action.id
          )
        };
      }

      return {
        ...state,
        items: state.items.map(i =>

          i.id === action.id

            ? {
                ...i,
                cantidad: action.cantidad
              }

            : i
        )
      };
    }

    case "VACIAR":

      return {
        ...state,
        items: []
      };

    default:
      return state;
  }
}

const initialState = {
  items: []
};

export function CarritoProvider({ children }) {

  const [state, dispatch] = useReducer(

    reducer,

    initialState,

    (init) => {

      try {

        const saved = localStorage.getItem(STORAGE_KEY);

        return saved
          ? JSON.parse(saved)
          : init;

      } catch {

        return init;
      }
    }
  );

  useEffect(() => {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

  }, [state]);

  const cantidadTotal = state.items.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const subtotal = state.items.reduce(
    (acc, item) =>
      acc + (item.precio * item.cantidad),
    0
  );

  const total = subtotal;

  const agregar = useCallback(

    (producto, cantidad = 1) => {

      dispatch({
        type: "AGREGAR",
        producto,
        cantidad
      });
    },

    []
  );

  const quitar = useCallback(

    (id) => {

      dispatch({
        type: "QUITAR",
        id
      });
    },

    []
  );

  const cambiarCantidad = useCallback(

    (id, cantidad) => {

      dispatch({
        type: "CAMBIAR_CANTIDAD",
        id,
        cantidad
      });
    },

    []
  );

  const vaciar = useCallback(() => {

    dispatch({
      type: "VACIAR"
    });

  }, []);

  return (

    <CarritoContext.Provider
      value={{

        items: state.items,

        cantidadTotal,

        subtotal,

        total,

        agregar,

        quitar,

        cambiarCantidad,

        vaciar
      }}
    >

      {children}

    </CarritoContext.Provider>
  );
}

export function useCarrito() {

  const context = useContext(CarritoContext);

  if (!context) {

    throw new Error(
      "useCarrito debe usarse dentro de CarritoProvider"
    );
  }

  return context;
}