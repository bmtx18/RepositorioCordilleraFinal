import axios from "axios";

const BASE_URL = "http://localhost:8080/api/bff";

export const bff = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const endpoints = {
  productos: "/productos",
  ventas: "/ventas",
  reportes: "/reportes",
  usuarios: "/usuarios",
  kpi: "/kpi",
  dashboard: "/dashboard",
  dashboardIndicadores: "/dashboard/indicadores",
  dashboardDrivers: "/dashboard/drivers",
};
