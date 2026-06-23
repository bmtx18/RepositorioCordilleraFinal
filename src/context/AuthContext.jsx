// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthContext = createContext();

// Correo del administrador (igual al usado en AdminRouten/Navbar)
const ADMIN_EMAIL = "agu.moya@duocuc.cl";

export function AuthProvider({ children }) {

  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading
  } = useAuth0();

  // Rol real del usuario, obtenido desde ms-usuarios (no desde Auth0)
  // Valores posibles: "ADMIN", "DRIVER", "CLIENTE", null (mientras carga)
  const [rol, setRol] = useState(null);
  const [perfilUsuario, setPerfilUsuario] = useState(null); // objeto Usuario completo de la BD
  const [cargandoRol, setCargandoRol] = useState(true);

  useEffect(() => {

    // Si Auth0 todavía está resolviendo la sesión, esperamos
    if (isLoading) return;

    // Si no hay sesión, no hay rol que buscar
    if (!isAuthenticated || !user?.email) {
      setRol(null);
      setPerfilUsuario(null);
      setCargandoRol(false);
      return;
    }

    // El administrador se identifica por correo fijo (regla ya existente en el proyecto)
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setRol("ADMIN");
      setCargandoRol(false);
      return;
    }

    // Para cualquier otro correo, la fuente de verdad es ms-usuarios.
    // Auth0 solo confirma "quién eres"; el rol (qué puedes hacer) vive en nuestra BD.
    const buscarRolReal = async () => {
      setCargandoRol(true);
      try {
        const res = await fetch("http://localhost:8085/api/usuarios");
        const usuarios = await res.json();

        const encontrado = Array.isArray(usuarios)
          ? usuarios.find(
              (u) => u.correo?.toLowerCase() === user.email.toLowerCase()
            )
          : null;

        if (encontrado) {
          setPerfilUsuario(encontrado);
          setRol(encontrado.rol || "CLIENTE");
        } else {
          // Usuario autenticado en Auth0 pero sin registro en ms-usuarios todavía
          setRol("CLIENTE");
        }
      } catch (err) {
        console.error("No se pudo obtener el rol del usuario:", err);
        setRol("CLIENTE");
      } finally {
        setCargandoRol(false);
      }
    };

    buscarRolReal();

  }, [isAuthenticated, isLoading, user]);

  const login = () => {

    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    });
  };

  const register = () => {

    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup",
        redirect_uri: window.location.origin
      }
    });
  };

  const cerrarSesion = () => {

    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  return (

    <AuthContext.Provider
      value={{
        usuario: user,
        estaAutenticado: isAuthenticated,
        cargando: isLoading,
        login,
        register,
        logout: cerrarSesion,

        // Nuevo: rol real verificado contra ms-usuarios
        rol,                         // "ADMIN" | "DRIVER" | "CLIENTE" | null
        perfilUsuario,               // objeto Usuario completo (incluye id, necesario para llamadas al backend)
        cargandoRol,                 // true mientras se resuelve el rol
        esAdmin: rol === "ADMIN",
        esDriver: rol === "DRIVER",
        esCliente: rol === "CLIENTE",
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}

export function useAuth() {

  return useContext(AuthContext);
}
