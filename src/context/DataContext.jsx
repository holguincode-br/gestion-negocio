import { createContext, useContext, useReducer, useCallback } from 'react';
import { initialData, emptyState } from '../data/initialData';

const DataContext = createContext();

function dataReducer(state, action) {
  switch (action.type) {
    case 'RESET_DATA':
      return { ...emptyState };
    case 'LOAD_SAMPLE_DATA':
      return { ...action.payload };
    case 'ADD_PRODUCTO': {
      const newId = Math.max(0, ...state.productos.map(p => p.id)) + 1;
      return { ...state, productos: [...state.productos, { ...action.payload, id: newId, precioCompra: 0 }] };
    }
    case 'UPDATE_PRODUCTO': {
      return { ...state, productos: state.productos.map(p => p.id === action.payload.id ? action.payload : p) };
    }
    case 'DELETE_PRODUCTO': {
      const newStockPorAlmacen = { ...state.stockPorAlmacen };
      Object.keys(newStockPorAlmacen).forEach(almId => {
        delete newStockPorAlmacen[almId][action.payload];
      });
      return { ...state, productos: state.productos.filter(p => p.id !== action.payload), stockPorAlmacen: newStockPorAlmacen };
    }
    case 'ADD_CATEGORIA': {
      if (state.categorias.includes(action.payload)) return state;
      return { ...state, categorias: [...state.categorias, action.payload] };
    }
    case 'ADD_ALMACEN': {
      const newId = Math.max(0, ...state.almacenes.map(a => a.id)) + 1;
      return { ...state, almacenes: [...state.almacenes, { id: newId, nombre: action.payload, esPrincipal: false }] };
    }
    case 'DELETE_ALMACEN': {
      const newStockPorAlmacen = { ...state.stockPorAlmacen };
      delete newStockPorAlmacen[action.payload];
      return { ...state, almacenes: state.almacenes.filter(a => a.id !== action.payload), stockPorAlmacen: newStockPorAlmacen };
    }
    case 'TRANSFERIR_STOCK': {
      const { almacenOrigen, almacenDestino, productoId, cantidad } = action.payload;
      const newStock = { ...state.stockPorAlmacen };
      newStock[almacenOrigen] = { ...newStock[almacenOrigen] };
      newStock[almacenDestino] = { ...newStock[almacenDestino] };
      newStock[almacenOrigen][productoId] = (newStock[almacenOrigen][productoId] || 0) - cantidad;
      newStock[almacenDestino][productoId] = (newStock[almacenDestino][productoId] || 0) + cantidad;
      return { ...state, stockPorAlmacen: newStock };
    }
    case 'SET_STOCK': {
      const { almacenId, productoId, cantidad } = action.payload;
      const newStock = { ...state.stockPorAlmacen };
      newStock[almacenId] = { ...newStock[almacenId], [productoId]: cantidad };
      return { ...state, stockPorAlmacen: newStock };
    }
    case 'ADD_MOVIMIENTO_BANCO': {
      const newId = Math.max(0, ...state.banco.movimientos.map(m => m.id)) + 1;
      const newBalance = action.payload.tipo === 'ingreso' || action.payload.tipo === 'deposito'
        ? state.banco.balance + action.payload.monto
        : state.banco.balance - action.payload.monto;
      return {
        ...state,
        banco: { balance: newBalance, movimientos: [...state.banco.movimientos, { ...action.payload, id: newId }] },
      };
    }
    case 'ADD_SOCIO': {
      const newId = Math.max(0, ...state.socios.map(s => s.id)) + 1;
      return { ...state, socios: [...state.socios, { ...action.payload, id: newId, gananciasAcumuladas: 0, retirosAcumulados: 0 }] };
    }
    case 'UPDATE_SOCIO': {
      return { ...state, socios: state.socios.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s) };
    }
    case 'DELETE_SOCIO': {
      return { ...state, socios: state.socios.filter(s => s.id !== action.payload) };
    }
    case 'SET_REINVERSION': {
      return { ...state, reinversion: { ...state.reinversion, ...action.payload } };
    }
    case 'ADD_COMPRA': {
      const newId = Math.max(0, ...state.compras.map(c => c.id)) + 1;
      const newStock = { ...state.stockPorAlmacen };
      const almacenId = action.payload.almacenId;
      newStock[almacenId] = { ...newStock[almacenId] };
      action.payload.productos.forEach(cp => {
        newStock[almacenId][cp.productoId] = (newStock[almacenId][cp.productoId] || 0) + cp.cantidad;
      });
      return { ...state, compras: [...state.compras, { ...action.payload, id: newId }], stockPorAlmacen: newStock };
    }
    case 'ADD_IPV': {
      const newId = Math.max(0, ...state.ipvs.map(i => i.id)) + 1;
      return { ...state, ipvs: [...state.ipvs, { ...action.payload, id: newId }] };
    }
    case 'UPDATE_IPV': {
      return { ...state, ipvs: state.ipvs.map(ipv => ipv.id === action.payload.id ? action.payload : ipv) };
    }
    case 'ADD_RETIRO_SOCIO': {
      const newId = Math.max(0, ...state.retirosSocios.map(r => r.id)) + 1;
      const retiro = { ...action.payload, id: newId };
      return {
        ...state,
        socios: state.socios.map(s =>
          s.id === retiro.socioId ? { ...s, retirosAcumulados: s.retirosAcumulados + retiro.monto } : s
        ),
        retirosSocios: [...state.retirosSocios, retiro],
      };
    }
    case 'UPDATE_SOCIO_GANANCIA': {
      const { socioId, monto } = action.payload;
      return {
        ...state,
        socios: state.socios.map(s =>
          s.id === socioId ? { ...s, gananciasAcumuladas: s.gananciasAcumuladas + monto } : s
        ),
      };
    }
    case 'UPDATE_PRECIO_COMPRA': {
      const { productoId, nuevoCosto, nuevaCantidad } = action.payload;
      return {
        ...state,
        productos: state.productos.map(p => {
          if (p.id !== productoId) return p;
          const stockConCompra = Object.values(state.stockPorAlmacen).reduce((sum, alm) => sum + (alm[productoId] || 0), 0);
          const stockAnterior = stockConCompra - nuevaCantidad;
          if (stockAnterior <= 0) return { ...p, precioCompra: nuevoCosto };
          const totalCosto = (p.precioCompra * stockAnterior) + (nuevoCosto * nuevaCantidad);
          const nuevoStock = stockAnterior + nuevaCantidad;
          return { ...p, precioCompra: Math.round((totalCosto / nuevoStock) * 100) / 100 };
        }),
      };
    }
    case 'UPDATE_PRECIO_VENTA': {
      const { productoId, nuevoPrecio } = action.payload;
      return {
        ...state,
        productos: state.productos.map(p => p.id === productoId ? { ...p, precioVenta: nuevoPrecio } : p),
      };
    }
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialData);

  const resetData = useCallback(() => {
    dispatch({ type: 'RESET_DATA' });
  }, []);

  const loadSampleData = useCallback((data) => {
    dispatch({ type: 'LOAD_SAMPLE_DATA', payload: data });
  }, []);

  const addProducto = useCallback((producto) => dispatch({ type: 'ADD_PRODUCTO', payload: producto }), []);
  const updateProducto = useCallback((producto) => dispatch({ type: 'UPDATE_PRODUCTO', payload: producto }), []);
  const deleteProducto = useCallback((id) => dispatch({ type: 'DELETE_PRODUCTO', payload: id }), []);
  const addCategoria = useCallback((nombre) => dispatch({ type: 'ADD_CATEGORIA', payload: nombre }), []);
  const addAlmacen = useCallback((nombre) => dispatch({ type: 'ADD_ALMACEN', payload: nombre }), []);
  const deleteAlmacen = useCallback((id) => dispatch({ type: 'DELETE_ALMACEN', payload: id }), []);
  const transferirStock = useCallback((data) => dispatch({ type: 'TRANSFERIR_STOCK', payload: data }), []);
  const setStock = useCallback((data) => dispatch({ type: 'SET_STOCK', payload: data }), []);
  const addMovimientoBanco = useCallback((data) => dispatch({ type: 'ADD_MOVIMIENTO_BANCO', payload: data }), []);
  const addSocio = useCallback((data) => dispatch({ type: 'ADD_SOCIO', payload: data }), []);
  const updateSocio = useCallback((data) => dispatch({ type: 'UPDATE_SOCIO', payload: data }), []);
  const deleteSocio = useCallback((id) => dispatch({ type: 'DELETE_SOCIO', payload: id }), []);
  const setReinversion = useCallback((data) => dispatch({ type: 'SET_REINVERSION', payload: data }), []);
  const addCompra = useCallback((data) => dispatch({ type: 'ADD_COMPRA', payload: data }), []);
  const addIpv = useCallback((data) => dispatch({ type: 'ADD_IPV', payload: data }), []);
  const updateIpv = useCallback((data) => dispatch({ type: 'UPDATE_IPV', payload: data }), []);
  const addRetiroSocio = useCallback((data) => dispatch({ type: 'ADD_RETIRO_SOCIO', payload: data }), []);
  const updateSocioGanancia = useCallback((data) => dispatch({ type: 'UPDATE_SOCIO_GANANCIA', payload: data }), []);
  const updatePrecioCompra = useCallback((data) => dispatch({ type: 'UPDATE_PRECIO_COMPRA', payload: data }), []);
  const updatePrecioVenta = useCallback((data) => dispatch({ type: 'UPDATE_PRECIO_VENTA', payload: data }), []);

  const getStock = useCallback((almacenId, productoId) => {
    return state.stockPorAlmacen[almacenId]?.[productoId] || 0;
  }, [state.stockPorAlmacen]);

  return (
    <DataContext.Provider value={{
      state,
      resetData,
      loadSampleData,
      addProducto,
      updateProducto,
      deleteProducto,
      addCategoria,
      addAlmacen,
      deleteAlmacen,
      transferirStock,
      setStock,
      addMovimientoBanco,
      addSocio,
      updateSocio,
      deleteSocio,
      setReinversion,
      addCompra,
      addIpv,
      updateIpv,
      addRetiroSocio,
      updateSocioGanancia,
      updatePrecioCompra,
      updatePrecioVenta,
      getStock,
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
