import { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Icons } from '../components/Icons';

export default function Configuracion() {
  const { state, resetData, loadSampleData } = useData();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmSample, setConfirmSample] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = () => {
    resetData();
    setConfirmReset(false);
    setSuccessMsg('Datos eliminados correctamente');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSample = () => {
    const sampleData = {
      categorias: ['Confituras', 'Carnicos', 'Lacteos', 'Bebidas', 'Snacks', 'Limpieza', 'Panaderia'],
      productos: [
        { id: 1, nombre: 'Mermelada de Fresa', categoria: 'Confituras', precioCompra: 0, precioVenta: 45, stockMinimo: 10 },
        { id: 2, nombre: 'Mermelada de Mora', categoria: 'Confituras', precioCompra: 0, precioVenta: 50, stockMinimo: 10 },
        { id: 3, nombre: 'Mermelada de Durazno', categoria: 'Confituras', precioCompra: 0, precioVenta: 52, stockMinimo: 8 },
        { id: 4, nombre: 'Jamon Serrano', categoria: 'Carnicos', precioCompra: 0, precioVenta: 120, stockMinimo: 5 },
        { id: 5, nombre: 'Salchicha Premium', categoria: 'Carnicos', precioCompra: 0, precioVenta: 55, stockMinimo: 15 },
        { id: 6, nombre: 'Chorizo Artesanal', categoria: 'Carnicos', precioCompra: 0, precioVenta: 70, stockMinimo: 10 },
        { id: 7, nombre: 'Queso Oaxaca', categoria: 'Lacteos', precioCompra: 0, precioVenta: 90, stockMinimo: 8 },
        { id: 8, nombre: 'Yogurt Natural', categoria: 'Lacteos', precioCompra: 0, precioVenta: 30, stockMinimo: 20 },
        { id: 9, nombre: 'Leche Entera', categoria: 'Lacteos', precioCompra: 0, precioVenta: 35, stockMinimo: 25 },
        { id: 10, nombre: 'Refresco Cola', categoria: 'Bebidas', precioCompra: 0, precioVenta: 20, stockMinimo: 30 },
        { id: 11, nombre: 'Agua Mineral', categoria: 'Bebidas', precioCompra: 0, precioVenta: 12, stockMinimo: 40 },
        { id: 12, nombre: 'Jugo de Naranja', categoria: 'Bebidas', precioCompra: 0, precioVenta: 25, stockMinimo: 20 },
        { id: 13, nombre: 'Papas Fritas', categoria: 'Snacks', precioCompra: 0, precioVenta: 25, stockMinimo: 25 },
        { id: 14, nombre: 'Galletas Chocolate', categoria: 'Snacks', precioCompra: 0, precioVenta: 18, stockMinimo: 20 },
        { id: 15, nombre: 'Pan Blanco', categoria: 'Panaderia', precioCompra: 0, precioVenta: 42, stockMinimo: 15 },
        { id: 16, nombre: 'Pan Dulce', categoria: 'Panaderia', precioCompra: 0, precioVenta: 15, stockMinimo: 30 },
        { id: 17, nombre: 'Detergente Liquido', categoria: 'Limpieza', precioCompra: 0, precioVenta: 55, stockMinimo: 10 },
        { id: 18, nombre: 'Jabon de Barra', categoria: 'Limpieza', precioCompra: 0, precioVenta: 20, stockMinimo: 15 },
      ],
      almacenes: [
        { id: 1, nombre: 'En Venta', esPrincipal: true },
        { id: 2, nombre: 'Bodega Central', esPrincipal: false },
        { id: 3, nombre: 'Sucursal Norte', esPrincipal: false },
      ],
      stockPorAlmacen: {
        1: { 1: 50, 2: 30, 3: 15, 4: 8, 5: 20, 6: 12, 7: 15, 8: 45, 9: 30, 10: 60, 11: 80, 12: 25, 13: 40, 14: 35, 15: 18, 16: 40, 17: 12, 18: 20 },
        2: { 1: 20, 2: 15, 3: 10, 4: 12, 5: 10, 6: 8, 7: 8, 8: 25, 9: 15, 10: 30, 11: 50, 12: 15, 13: 20, 14: 15, 15: 10, 16: 25, 17: 8, 18: 12 },
        3: { 1: 10, 2: 8, 4: 5, 5: 15, 7: 10, 8: 20, 10: 25, 11: 30, 13: 15, 15: 8, 17: 5 },
      },
      banco: { balance: 25000, movimientos: [{ id: 1, fecha: '2025-01-01', tipo: 'deposito', descripcion: 'Capital inicial socios', monto: 25000 }] },
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
    loadSampleData(sampleData);
    setConfirmSample(false);
    setSuccessMsg('Datos de prueba cargados correctamente');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const stats = {
    productos: state.productos.length,
    almacenes: state.almacenes.length,
    socios: state.socios.length,
    compras: state.compras.length,
    ipvs: state.ipvs.length,
    movimientos: state.banco.movimientos.length,
    balance: state.banco.balance,
  };

  return (
    <div className="space-y-6 max-w-4xl animate-slide-up">
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 animate-scale-in">
          <span className="text-emerald-600"><Icons.check /></span>
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      <div className="card-flat">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-slate-400"><Icons.database /></span>
          <h3 className="section-title">Gestion de Datos</h3>
        </div>
        <p className="section-subtitle mb-6">Administra los datos de la aplicacion</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-red-200/80 rounded-xl p-5 bg-red-50/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0"><Icons.trash /></div>
              <div>
                <h4 className="font-medium text-slate-900 text-sm">Limpiar todos los datos</h4>
                <p className="text-xs text-slate-500 mt-1">Elimina toda la informacion y deja la base de datos vacia</p>
                <button onClick={() => setConfirmReset(true)} className="btn btn-danger mt-3 text-xs">Limpiar todo</button>
              </div>
            </div>
          </div>

          <div className="border border-indigo-200/80 rounded-xl p-5 bg-indigo-50/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0"><Icons.download /></div>
              <div>
                <h4 className="font-medium text-slate-900 text-sm">Cargar datos de prueba</h4>
                <p className="text-xs text-slate-500 mt-1">Inserta 18 productos, 3 almacenes, 3 socios y datos de ejemplo</p>
                <button onClick={() => setConfirmSample(true)} className="btn btn-primary mt-3 text-xs bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20">Cargar datos</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-flat">
        <h3 className="section-title mb-1">Resumen Actual</h3>
        <p className="section-subtitle mb-4">Estado actual de la base de datos</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Productos', value: stats.productos },
            { label: 'Almacenes', value: stats.almacenes },
            { label: 'Socios', value: stats.socios },
            { label: 'Balance', value: `$${stats.balance.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`, color: stats.balance >= 0 ? 'text-emerald-600' : 'text-red-600' },
            { label: 'Compras', value: stats.compras },
            { label: 'Sesiones IPV', value: stats.ipvs },
            { label: 'Movimientos', value: stats.movimientos },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className={`text-lg font-semibold ${item.color || 'text-slate-900'}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={confirmReset} onClose={() => setConfirmReset(false)} title="Confirmar limpieza">
        <div className="space-y-4">
          <div className="alert-warning">
            <span className="text-amber-600 mt-0.5"><Icons.alertTriangle /></span>
            <div>
              <p className="text-sm font-medium">Se eliminaran todos los datos</p>
              <p className="text-xs text-amber-700/80 mt-1">Productos, almacenes, socios, compras, ventas y movimientos del banco se borrarán completamente.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmReset(false)} className="btn btn-secondary">Cancelar</button>
            <button onClick={handleReset} className="btn btn-danger">Si, limpiar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={confirmSample} onClose={() => setConfirmSample(false)} title="Cargar datos de prueba">
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-sm font-medium text-indigo-900 mb-2">Se cargaran los siguientes datos:</p>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>18 productos en 7 categorias</li>
              <li>3 almacenes (En Venta, Bodega Central, Sucursal Norte)</li>
              <li>3 socios con porcentajes configurados</li>
              <li>Balance inicial de $25,000</li>
              <li>2 compras de ejemplo</li>
            </ul>
          </div>
          <div className="alert-warning">
            <span className="text-amber-600 mt-0.5"><Icons.alertTriangle /></span>
            <div>
              <p className="text-sm font-medium">Se reemplazaran todos los datos actuales</p>
              <p className="text-xs text-amber-700/80 mt-1">Los datos existentes se perderan.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmSample(false)} className="btn btn-secondary">Cancelar</button>
            <button onClick={handleSample} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700">Cargar datos</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
