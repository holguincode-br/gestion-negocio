import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

function transformStock(rows) {
  const map = {};
  rows.forEach(r => {
    if (!map[r.almacen_id]) map[r.almacen_id] = {};
    map[r.almacen_id][r.producto_id] = r.cantidad;
  });
  return map;
}

export function DataProvider({ children }) {
  const [state, setState] = useState({
    categorias: [],
    productos: [],
    almacenes: [],
    stockPorAlmacen: {},
    banco: { balance: 0, movimientos: [] },
    socios: [],
    reinversion: { porcentaje: 10, balance: 0 },
    compras: [],
    ipvs: [],
    retirosSocios: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [catRes, prodRes, almRes, stockRes, bancoRes, socioRes, reinvRes, compraRes, ipvRes, retiroRes] = await Promise.all([
      supabase.from('categorias').select('nombre').order('id'),
      supabase.from('productos').select('*').order('id'),
      supabase.from('almacenes').select('*').order('id'),
      supabase.from('stock_almacen').select('*'),
      supabase.from('banco_movimientos').select('*').order('id'),
      supabase.from('socios').select('*').order('id'),
      supabase.from('config_reinversion').select('*').single(),
      supabase.from('compras').select('*').order('id'),
      supabase.from('ipvs').select('*').order('id'),
      supabase.from('retiros_socios').select('*').order('id'),
    ]);

    const balance = bancoRes.data?.reduce((sum, m) => {
      return m.tipo === 'ingreso' || m.tipo === 'deposito' ? sum + m.monto : sum - m.monto;
    }, 0) || 0;

    setState({
      categorias: catRes.data?.map(c => c.nombre) || [],
      productos: prodRes.data?.map(p => ({ ...p, precioCompra: Number(p.precio_compra), precioVenta: Number(p.precio_venta), stockMinimo: p.stock_minimo })) || [],
      almacenes: almRes.data?.map(a => ({ ...a, esPrincipal: a.es_principal })) || [],
      stockPorAlmacen: transformStock(stockRes.data || []),
      banco: { balance, movimientos: bancoRes.data?.map(m => ({ ...m, monto: Number(m.monto) })) || [] },
      socios: socioRes.data?.map(s => ({ ...s, porcentaje: s.porcentaje, retencion: Number(s.retencion), gananciasAcumuladas: Number(s.ganancias_acumuladas), retirosAcumulados: Number(s.retiros_acumulados) })) || [],
      reinversion: reinvRes.data ? { porcentaje: reinvRes.data.porcentaje, balance: Number(reinvRes.data.balance) } : { porcentaje: 10, balance: 0 },
      compras: compraRes.data?.map(c => ({ ...c, total: Number(c.total), productos: c.productos, gastos: c.gastos })) || [],
      ipvs: ipvRes.data?.map(i => ({ ...i, ventas: i.ventas, mermas: i.mermas, consumos: i.consumos })) || [],
      retirosSocios: retiroRes.data?.map(r => ({ ...r, monto: Number(r.monto) })) || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const refresh = useCallback(() => fetchAll(), [fetchAll]);

  const resetData = useCallback(async () => {
    await Promise.all([
      supabase.from('retiros_socios').delete().neq('id', 0),
      supabase.from('ipvs').delete().neq('id', 0),
      supabase.from('compras').delete().neq('id', 0),
      supabase.from('banco_movimientos').delete().neq('id', 0),
      supabase.from('stock_almacen').delete().neq('almacen_id', 0),
      supabase.from('productos').delete().neq('id', 0),
      supabase.from('categorias').delete().neq('id', 0),
      supabase.from('socios').delete().neq('id', 0),
      supabase.from('almacenes').delete().neq('id', 0),
      supabase.from('config_reinversion').update({ porcentaje: 10, balance: 0 }).eq('id', 1),
    ]);
    await supabase.from('almacenes').insert({ id: 1, nombre: 'En Venta', es_principal: true });
    refresh();
  }, [refresh]);

  const loadSampleData = useCallback(async () => {
    await resetData();
    const cats = ['Confituras', 'Carnicos', 'Lacteos', 'Bebidas', 'Snacks'];
    for (const c of cats) await supabase.from('categorias').insert({ nombre: c });

    const alms = [
      { id: 1, nombre: 'En Venta', es_principal: true },
      { id: 2, nombre: 'Bodega Central', es_principal: false },
    ];
    for (const a of alms) await supabase.from('almacenes').insert(a);

    const prods = [
      { id: 1, nombre: 'Mermelada de Fresa', categoria: 'Confituras', precio_compra: 0, precio_venta: 45, stock_minimo: 10 },
      { id: 2, nombre: 'Mermelada de Mora', categoria: 'Confituras', precio_compra: 0, precio_venta: 50, stock_minimo: 10 },
      { id: 3, nombre: 'Jamon Serrano', categoria: 'Carnicos', precio_compra: 0, precio_venta: 120, stock_minimo: 5 },
      { id: 4, nombre: 'Salchicha Premium', categoria: 'Carnicos', precio_compra: 0, precio_venta: 55, stock_minimo: 15 },
      { id: 5, nombre: 'Queso Oaxaca', categoria: 'Lacteos', precio_compra: 0, precio_venta: 90, stock_minimo: 8 },
      { id: 6, nombre: 'Yogurt Natural', categoria: 'Lacteos', precio_compra: 0, precio_venta: 30, stock_minimo: 20 },
      { id: 7, nombre: 'Refresco Cola', categoria: 'Bebidas', precio_compra: 0, precio_venta: 20, stock_minimo: 30 },
      { id: 8, nombre: 'Agua Mineral', categoria: 'Bebidas', precio_compra: 0, precio_venta: 12, stock_minimo: 40 },
      { id: 9, nombre: 'Papas Fritas', categoria: 'Snacks', precio_compra: 0, precio_venta: 25, stock_minimo: 25 },
      { id: 10, nombre: 'Galletas Chocolate', categoria: 'Snacks', precio_compra: 0, precio_venta: 18, stock_minimo: 20 },
    ];
    for (const p of prods) await supabase.from('productos').insert(p);

    const stock1 = prods.map(p => ({ almacen_id: 1, producto_id: p.id, cantidad: [50, 30, 8, 20, 15, 45, 60, 80, 40, 35][p.id - 1] }));
    const stock2 = prods.map(p => ({ almacen_id: 2, producto_id: p.id, cantidad: [20, 15, 12, 10, 8, 25, 30, 50, 20, 15][p.id - 1] }));
    for (const s of [...stock1, ...stock2]) await supabase.from('stock_almacen').insert(s);

    await supabase.from('banco_movimientos').insert({ fecha: '2025-01-15', tipo: 'deposito', descripcion: 'Capital inicial', monto: 15000 });

    const socios = [
      { id: 1, nombre: 'Carlos Mendez', porcentaje: 40, retencion: 0, ganancias_acumuladas: 0, retiros_acumulados: 0 },
      { id: 2, nombre: 'Ana Lopez', porcentaje: 35, retencion: 0, ganancias_acumuladas: 0, retiros_acumulados: 0 },
      { id: 3, nombre: 'Roberto Silva', porcentaje: 15, retencion: 0, ganancias_acumuladas: 0, retiros_acumulados: 0 },
    ];
    for (const s of socios) await supabase.from('socios').insert(s);

    refresh();
  }, [refresh, resetData]);

  const addProducto = useCallback(async (producto) => {
    const { data, error } = await supabase.from('productos').insert({
      nombre: producto.nombre, categoria: producto.categoria,
      precio_compra: 0, precio_venta: producto.precioVenta, stock_minimo: producto.stockMinimo,
    }).select().single();
    if (!error) refresh();
  }, [refresh]);

  const updateProducto = useCallback(async (producto) => {
    await supabase.from('productos').update({
      nombre: producto.nombre, categoria: producto.categoria,
      precio_venta: producto.precioVenta, stock_minimo: producto.stockMinimo,
    }).eq('id', producto.id);
    refresh();
  }, [refresh]);

  const deleteProducto = useCallback(async (id) => {
    await supabase.from('stock_almacen').delete().eq('producto_id', id);
    await supabase.from('productos').delete().eq('id', id);
    refresh();
  }, [refresh]);

  const addCategoria = useCallback(async (nombre) => {
    await supabase.from('categorias').insert({ nombre }).select();
    refresh();
  }, [refresh]);

  const addAlmacen = useCallback(async (nombre) => {
    await supabase.from('almacenes').insert({ nombre, es_principal: false });
    refresh();
  }, [refresh]);

  const deleteAlmacen = useCallback(async (id) => {
    await supabase.from('stock_almacen').delete().eq('almacen_id', id);
    await supabase.from('almacenes').delete().eq('id', id);
    refresh();
  }, [refresh]);

  const transferirStock = useCallback(async ({ almacenOrigen, almacenDestino, productoId, cantidad }) => {
    const { data: orig } = await supabase.from('stock_almacen').select('cantidad').eq('almacen_id', almacenOrigen).eq('producto_id', productoId).single();
    const { data: dest } = await supabase.from('stock_almacen').select('cantidad').eq('almacen_id', almacenDestino).eq('producto_id', productoId).single();
    const newOrig = (orig?.cantidad || 0) - cantidad;
    const newDest = (dest?.cantidad || 0) + cantidad;
    await supabase.from('stock_almacen').upsert({ almacen_id: almacenOrigen, producto_id: productoId, cantidad: newOrig });
    await supabase.from('stock_almacen').upsert({ almacen_id: almacenDestino, producto_id: productoId, cantidad: newDest });
    refresh();
  }, [refresh]);

  const setStock = useCallback(async ({ almacenId, productoId, cantidad }) => {
    await supabase.from('stock_almacen').upsert({ almacen_id: almacenId, producto_id: productoId, cantidad });
    refresh();
  }, [refresh]);

  const addMovimientoBanco = useCallback(async (data) => {
    await supabase.from('banco_movimientos').insert({
      fecha: data.fecha, tipo: data.tipo, descripcion: data.descripcion, monto: data.monto,
    });
    refresh();
  }, [refresh]);

  const addSocio = useCallback(async (data) => {
    await supabase.from('socios').insert({
      nombre: data.nombre, porcentaje: data.porcentaje, retencion: data.retencion || 0,
      ganancias_acumuladas: 0, retiros_acumulados: 0,
    });
    refresh();
  }, [refresh]);

  const updateSocio = useCallback(async (data) => {
    await supabase.from('socios').update({
      nombre: data.nombre, porcentaje: data.porcentaje, retencion: data.retencion,
    }).eq('id', data.id);
    refresh();
  }, [refresh]);

  const deleteSocio = useCallback(async (id) => {
    await supabase.from('socios').delete().eq('id', id);
    refresh();
  }, [refresh]);

  const setReinversion = useCallback(async (data) => {
    await supabase.from('config_reinversion').update(data).eq('id', 1);
    refresh();
  }, [refresh]);

  const addCompra = useCallback(async (data) => {
    await supabase.from('compras').insert({
      fecha: data.fecha, almacen_id: data.almacenId, total: data.total,
      productos: JSON.stringify(data.productos), gastos: JSON.stringify(data.gastos || []),
    });
    for (const cp of data.productos) {
      const { data: existing } = await supabase.from('stock_almacen').select('cantidad').eq('almacen_id', data.almacenId).eq('producto_id', cp.productoId).single();
      const newQty = (existing?.cantidad || 0) + cp.cantidad;
      await supabase.from('stock_almacen').upsert({ almacen_id: data.almacenId, producto_id: cp.productoId, cantidad: newQty });
    }
    refresh();
  }, [refresh]);

  const addIpv = useCallback(async (data) => {
    await supabase.from('ipvs').insert({
      fecha: data.fecha, estado: 'abierto',
      ventas: JSON.stringify(data.ventas || []),
      mermas: JSON.stringify(data.mermas || []),
      consumos: JSON.stringify(data.consumos || []),
    });
    refresh();
  }, [refresh]);

  const updateIpv = useCallback(async (data) => {
    await supabase.from('ipvs').update({
      estado: data.estado,
      ventas: JSON.stringify(data.ventas),
      mermas: JSON.stringify(data.mermas),
      consumos: JSON.stringify(data.consumos),
    }).eq('id', data.id);
    refresh();
  }, [refresh]);

  const addRetiroSocio = useCallback(async (data) => {
    await supabase.from('retiros_socios').insert({
      fecha: data.fecha, socio_id: data.socioId, monto: data.monto, descripcion: data.descripcion || '',
    });
    const { data: socio } = await supabase.from('socios').select('retiros_acumulados').eq('id', data.socioId).single();
    await supabase.from('socios').update({ retiros_acumulados: (socio?.retiros_acumulados || 0) + data.monto }).eq('id', data.socioId);
    refresh();
  }, [refresh]);

  const updateSocioGanancia = useCallback(async ({ socioId, monto }) => {
    const { data: socio } = await supabase.from('socios').select('ganancias_acumuladas').eq('id', socioId).single();
    await supabase.from('socios').update({ ganancias_acumuladas: (socio?.ganancias_acumuladas || 0) + monto }).eq('id', socioId);
    refresh();
  }, [refresh]);

  const updatePrecioCompra = useCallback(async ({ productoId, nuevoCosto, nuevaCantidad }) => {
    const { data: prod } = await supabase.from('productos').select('precio_compra').eq('id', productoId).single();
    const { data: stockRows } = await supabase.from('stock_almacen').select('cantidad').eq('producto_id', productoId);
    const totalStock = stockRows?.reduce((sum, r) => sum + r.cantidad, 0) || 0;
    const stockAnterior = totalStock - nuevaCantidad;
    let precioFinal = nuevoCosto;
    if (stockAnterior > 0 && prod) {
      const totalCosto = (Number(prod.precio_compra) * stockAnterior) + (nuevoCosto * nuevaCantidad);
      precioFinal = Math.round((totalCosto / (stockAnterior + nuevaCantidad)) * 100) / 100;
    }
    await supabase.from('productos').update({ precio_compra: precioFinal }).eq('id', productoId);
    refresh();
  }, [refresh]);

  const updatePrecioVenta = useCallback(async ({ productoId, nuevoPrecio }) => {
    await supabase.from('productos').update({ precio_venta: nuevoPrecio }).eq('id', productoId);
    refresh();
  }, [refresh]);

  const getStock = useCallback((almacenId, productoId) => {
    return state.stockPorAlmacen[almacenId]?.[productoId] || 0;
  }, [state.stockPorAlmacen]);

  return (
    <DataContext.Provider value={{
      state, loading, refresh,
      resetData, loadSampleData,
      addProducto, updateProducto, deleteProducto, addCategoria,
      addAlmacen, deleteAlmacen, transferirStock, setStock,
      addMovimientoBanco, addSocio, updateSocio, deleteSocio,
      setReinversion, addCompra, addIpv, updateIpv,
      addRetiroSocio, updateSocioGanancia,
      updatePrecioCompra, updatePrecioVenta, getStock,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
