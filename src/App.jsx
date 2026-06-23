import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import AdminProductos from "./pages/AdminProductos";
import AdminDashboard from "./pages/AdminDashboard";
import VistaDriver from "./pages/VistaDriver";

import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import Reportes from "./pages/Reportes";
import AdminLogin from "./pages/AdminLogin";
import AdminRouten from "./components/AdminRouten";
import DriverRoute from "./components/DriverRoute";
import DetalleProducto from "./pages/DetalleProducto";
import Checkout from "./pages/Checkout";
import Confirmacion from "./pages/Confirmacion";
import SobreNosotros from "./pages/SobreNosotros";

import MisPedidos from "./pages/MisPedidos";

import { AuthProvider } from "./context/AuthContext";

function App() {

  return (

    <AuthProvider>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<DetalleProducto />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/productos" element={<AdminRouten> <AdminProductos /> </AdminRouten>} />
        <Route path="/admin/dashboard" element={<AdminRouten> <AdminDashboard /> </AdminRouten>} />

        {/* Driver */}
        <Route path="/driver" element={<DriverRoute> <VistaDriver /> </DriverRoute>} />

      </Routes>

    </AuthProvider>
  );
}

export default App;
