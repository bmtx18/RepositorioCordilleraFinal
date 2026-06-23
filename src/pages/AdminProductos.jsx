import { useEffect, useState } from "react";
import "../styles/adminProductos.css";

const API_PRODUCTOS = "http://localhost:8082/api/productos";

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [form, setForm] = useState({
    proveedor: "",
    nombre: "",
    categoria: "Todos",
    stock: "",
    precio: "",
    imagen: "",
  });

  const categoriaIds = {
    Todos: 1,
    Lavadoras: 2,
    Refrigeradores: 3,
    Televisores: 4,
    Cocina: 5,
    Limpieza: 6,
  };

  const cargarProductos = async () => {
    try {
      const res = await fetch(API_PRODUCTOS);

      if (!res.ok) {
        throw new Error("No se pudieron cargar los productos");
      }

      const data = await res.json();
      setProductos(data);
      setError("");
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("No se pudieron cargar los productos");
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!form.nombre || !form.stock || !form.precio) {
      setError("Nombre, stock y precio son obligatorios");
      return;
    }

    const nuevoProducto = {
      nombre: form.nombre,
      stock: Number(form.stock),
      precio: Number(form.precio),
      imagenUrl: form.imagen || "",
      categoria: {
        id: categoriaIds[form.categoria],
      },
      proveedor: {
        id: 1,
      },
    };

    try {
      const res = await fetch(API_PRODUCTOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoProducto),
      });

      if (!res.ok) {
        const textoError = await res.text();
        console.error("Error backend:", textoError);
        throw new Error(textoError || "Error al crear producto");
      }

      setMensaje("Producto creado exitosamente");

      setForm({
        proveedor: "",
        nombre: "",
        categoria: "Todos",
        stock: "",
        precio: "",
        imagen: "",
      });

      await cargarProductos();
    } catch (err) {
      console.error("Error creando producto:", err);
      setError("No se pudo crear el producto: " + err.message);
    }
  };

  const eliminarProducto = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_PRODUCTOS}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const textoError = await res.text();
        throw new Error(textoError || "Error al eliminar producto");
      }

      setMensaje("Producto eliminado correctamente");
      await cargarProductos();
    } catch (err) {
      console.error("Error eliminando producto:", err);
      setError("No se pudo eliminar el producto: " + err.message);
    }
  };

  const totalProductos = productos.length;

  const stockTotal = productos.reduce(
    (total, producto) => total + Number(producto.stock || 0),
    0
  );

  const valorTotal = productos.reduce(
    (total, producto) =>
      total + Number(producto.precio || 0) * Number(producto.stock || 0),
    0
  );

  return (
    <main className="admin-page">
      <section className="admin-stats">
        <div className="stat-card">
          <strong>{totalProductos}</strong>
          <span>Registrados</span>
        </div>

        <div className="stat-card">
          <strong>{stockTotal}</strong>
          <span>Unidades disponibles</span>
        </div>

        <div className="stat-card">
          <strong>${valorTotal.toLocaleString("es-CL")}</strong>
          <span>Precio x stock</span>
        </div>
      </section>

      {error && <div className="admin-alert error">{error}</div>}
      {mensaje && <div className="admin-alert success">{mensaje}</div>}

      <section className="admin-grid">
        <div className="admin-card">
          <h2>Crear nuevo producto</h2>

          <form className="admin-form" onSubmit={crearProducto}>
            <label>Proveedor</label>
            <input
              name="proveedor"
              value={form.proveedor}
              onChange={handleChange}
              placeholder="Ej: Proveedor General"
            />

            <label>Nombre del producto</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Lavadora LG"
            />

            <label>Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
            >
              <option>Todos</option>
              <option>Lavadoras</option>
              <option>Refrigeradores</option>
              <option>Televisores</option>
              <option>Cocina</option>
              <option>Limpieza</option>
            </select>

            <div className="form-row">
              <div>
                <label>Stock</label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Ej: 20"
                />
              </div>

              <div>
                <label>Precio</label>
                <input
                  name="precio"
                  type="number"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="Ej: 499990"
                />
              </div>
            </div>

            <label>Link de imagen</label>
            <input
              name="imagen"
              value={form.imagen}
              onChange={handleChange}
              placeholder="Opcional"
            />

            <button type="submit">Crear producto</button>
          </form>
        </div>

        <div className="admin-card productos-card">
          <h2>Productos registrados</h2>

          {productos.length === 0 ? (
            <div className="empty-box">
              <h3>No hay productos cargados</h3>
              <p>Cuando crees productos, aparecerán en esta sección.</p>
            </div>
          ) : (
            <div className="productos-lista">
              {productos.map((producto) => (
                <div className="producto-item" key={producto.id}>
                  <div>
                    <h3>{producto.nombre}</h3>
                    <p>Categoría: {producto.categoria?.nombre || "Sin categoría"}</p>
                    <p>Proveedor: {producto.proveedor?.nombre || "Sin proveedor"}</p>
                    <p>Stock: {producto.stock}</p>
                  </div>

                  <div>
                    <strong>
                      ${Number(producto.precio || 0).toLocaleString("es-CL")}
                    </strong>

                    <button onClick={() => eliminarProducto(producto.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}