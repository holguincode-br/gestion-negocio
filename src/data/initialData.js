export const emptyState = {
  categorias: [],
  productos: [],
  almacenes: [
    { id: 1, nombre: 'En Venta', esPrincipal: true },
  ],
  stockPorAlmacen: { 1: {} },
  banco: {
    balance: 0,
    movimientos: [],
  },
  socios: [],
  reinversion: { porcentaje: 10, balance: 0 },
  compras: [],
  ipvs: [],
  retirosSocios: [],
};

export const initialData = {
  categorias: ['Confituras', 'Carnicos', 'Lacteos', 'Bebidas', 'Snacks'],
  productos: [
    { id: 1, nombre: 'Mermelada de Fresa', categoria: 'Confituras', precioCompra: 0, precioVenta: 45, stockMinimo: 10 },
    { id: 2, nombre: 'Mermelada de Mora', categoria: 'Confituras', precioCompra: 0, precioVenta: 50, stockMinimo: 10 },
    { id: 3, nombre: 'Jamon Serrano', categoria: 'Carnicos', precioCompra: 0, precioVenta: 120, stockMinimo: 5 },
    { id: 4, nombre: 'Salchicha Premium', categoria: 'Carnicos', precioCompra: 0, precioVenta: 55, stockMinimo: 15 },
    { id: 5, nombre: 'Queso Oaxaca', categoria: 'Lacteos', precioCompra: 0, precioVenta: 90, stockMinimo: 8 },
    { id: 6, nombre: 'Yogurt Natural', categoria: 'Lacteos', precioCompra: 0, precioVenta: 30, stockMinimo: 20 },
    { id: 7, nombre: 'Refresco Cola', categoria: 'Bebidas', precioCompra: 0, precioVenta: 20, stockMinimo: 30 },
    { id: 8, nombre: 'Agua Mineral', categoria: 'Bebidas', precioCompra: 0, precioVenta: 12, stockMinimo: 40 },
    { id: 9, nombre: 'Papas Fritas', categoria: 'Snacks', precioCompra: 0, precioVenta: 25, stockMinimo: 25 },
    { id: 10, nombre: 'Galletas Chocolate', categoria: 'Snacks', precioCompra: 0, precioVenta: 18, stockMinimo: 20 },
  ],
  almacenes: [
    { id: 1, nombre: 'En Venta', esPrincipal: true },
    { id: 2, nombre: 'Bodega Central', esPrincipal: false },
  ],
  stockPorAlmacen: {
    1: { 1: 50, 2: 30, 3: 8, 4: 20, 5: 15, 6: 45, 7: 60, 8: 80, 9: 40, 10: 35 },
    2: { 1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 25, 7: 30, 8: 50, 9: 20, 10: 15 },
  },
  banco: {
    balance: 15000,
    movimientos: [
      { id: 1, fecha: '2025-01-15', tipo: 'deposito', descripcion: 'Capital inicial', monto: 15000 },
    ],
  },
  socios: [
    { id: 1, nombre: 'Carlos Mendez', porcentaje: 40, retencion: 0, gananciasAcumuladas: 0, retirosAcumulados: 0 },
    { id: 2, nombre: 'Ana Lopez', porcentaje: 35, retencion: 0, gananciasAcumuladas: 0, retirosAcumulados: 0 },
    { id: 3, nombre: 'Roberto Silva', porcentaje: 15, retencion: 0, gananciasAcumuladas: 0, retirosAcumulados: 0 },
  ],
  reinversion: { porcentaje: 10, balance: 0 },
  compras: [],
  ipvs: [],
  retirosSocios: [],
};
