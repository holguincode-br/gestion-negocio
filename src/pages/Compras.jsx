import { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Icons } from '../components/Icons';

export default function Compras() {
  const { state, addCompra, addMovimientoBanco, updatePrecioCompra } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], almacenId: state.almacenes[0]?.id || '', productos: [], gastos: [] });
  const [prodLine, setProdLine] = useState({ productoId: '', cantidad: '', costoUnitario: '' });
  const [gastoLine, setGastoLine] = useState({ descripcion: '', monto: '' });
  const [error, setError] = useState('');
  const totalProductos = form.productos.reduce((s, p) => s + (p.cantidad * p.costoUnitario), 0);
  const totalGastos = form.gastos.reduce((s, g) => s + g.monto, 0);
  const totalGeneral = totalProductos + totalGastos;
  const saldoInsuficiente = totalGeneral > state.banco.balance;

  const addProductoLine = () => { if (prodLine.productoId && prodLine.cantidad && prodLine.costoUnitario) { setForm({ ...form, productos: [...form.productos, { productoId: Number(prodLine.productoId), cantidad: Number(prodLine.cantidad), costoUnitario: Number(prodLine.costoUnitario) }] }); setProdLine({ productoId: '', cantidad: '', costoUnitario: '' }); setError(''); } };
  const addGastoLine = () => { if (gastoLine.descripcion && gastoLine.monto) { setForm({ ...form, gastos: [...form.gastos, { id: Date.now(), descripcion: gastoLine.descripcion, monto: Number(gastoLine.monto) }] }); setGastoLine({ descripcion: '', monto: '' }); setError(''); } };
  const removeProducto = (i) => setForm({ ...form, productos: form.productos.filter((_, idx) => idx !== i) });
  const removeGasto = (i) => setForm({ ...form, gastos: form.gastos.filter((_, idx) => idx !== i) });

  const handleSubmit = () => {
    if (form.productos.length === 0) return;
    if (totalGeneral > state.banco.balance) { setError('Saldo insuficiente en el banco'); return; }
    const compra = { ...form, almacenId: Number(form.almacenId), total: totalGeneral };
    addCompra(compra);
    compra.productos.forEach(cp => {
      updatePrecioCompra({ productoId: cp.productoId, nuevoCosto: cp.costoUnitario, nuevaCantidad: cp.cantidad });
    });
    addMovimientoBanco({ fecha: form.fecha, tipo: 'egreso', descripcion: `Compra #${state.compras.length + 1}`, monto: totalGeneral });
    setForm({ fecha: new Date().toISOString().split('T')[0], almacenId: state.almacenes[0]?.id || '', productos: [], gastos: [] });
    setError('');
    setModalOpen(false);
  };
  const compras = [...state.compras].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header"><div /><button onClick={() => { setError(''); setModalOpen(true); }} className="btn btn-primary"><Icons.plus /> Nueva Compra</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {compras.map(c => (
          <div key={c.id} className="card-flat">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-slate-500">{c.fecha}</span><span className="badge badge-neutral">#{c.id}</span></div>
            <div className="space-y-1.5 mb-3">{c.productos.map((cp, i) => { const prod = state.productos.find(p => p.id === cp.productoId); return <p key={i} className="text-sm text-slate-700">{prod?.nombre} x{cp.cantidad} - ${cp.costoUnitario.toFixed(2)}</p>; })}</div>
            {c.gastos.length > 0 && <div className="mb-3 pt-3 border-t border-slate-100"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Gastos</p>{c.gastos.map((g, i) => <p key={i} className="text-sm text-slate-600">{g.descripcion}: ${g.monto.toFixed(2)}</p>)}</div>}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100"><span className="text-xs text-slate-500">{state.almacenes.find(a => a.id === c.almacenId)?.nombre}</span><span className="font-semibold text-red-600">${c.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
          </div>
        ))}
      </div>
      {compras.length === 0 && <div className="card-flat"><div className="empty-state"><div className="empty-state-icon"><Icons.compras /></div><p className="empty-state-title">No hay compras</p><p className="empty-state-text">Registra tu primera compra de productos</p></div></div>}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Compra" size="lg">
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <span className="text-sm text-slate-500">Saldo disponible en banco</span>
            <span className={`font-semibold ${state.banco.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${state.banco.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label><input type="date" className="input" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Almacen</label><select className="select" value={form.almacenId} onChange={e => setForm({ ...form, almacenId: e.target.value })}>{state.almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></div>
          </div>
          <div className="border border-slate-200 rounded-xl p-4">
            <p className="font-medium text-sm text-slate-900 mb-3">Productos</p>
            <div className="flex gap-2 mb-3">
              <select className="select flex-1" value={prodLine.productoId} onChange={e => setProdLine({ ...prodLine, productoId: e.target.value })}><option value="">Producto...</option>{state.productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
              <input type="number" min="1" placeholder="Cant." className="input w-24" value={prodLine.cantidad} onChange={e => setProdLine({ ...prodLine, cantidad: e.target.value })} />
              <input type="number" step="0.01" min="0" placeholder="Costo" className="input w-28" value={prodLine.costoUnitario} onChange={e => setProdLine({ ...prodLine, costoUnitario: e.target.value })} />
              <button type="button" onClick={addProductoLine} className="btn btn-primary"><Icons.plus /></button>
            </div>
            {form.productos.length > 0 && <div className="space-y-1">{form.productos.map((cp, i) => { const prod = state.productos.find(p => p.id === cp.productoId); return (<div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"><span className="text-slate-700">{prod?.nombre} x{cp.cantidad}</span><div className="flex items-center gap-2"><span className="font-medium">${(cp.cantidad * cp.costoUnitario).toFixed(2)}</span><button onClick={() => removeProducto(i)} className="text-slate-400 hover:text-red-600 transition-colors"><Icons.x /></button></div></div>); })}</div>}
          </div>
          <div className="border border-slate-200 rounded-xl p-4">
            <p className="font-medium text-sm text-slate-900 mb-3">Gastos Adicionales</p>
            <div className="flex gap-2 mb-3">
              <input className="input flex-1" placeholder="Descripcion" value={gastoLine.descripcion} onChange={e => setGastoLine({ ...gastoLine, descripcion: e.target.value })} />
              <input type="number" step="0.01" min="0" placeholder="Monto" className="input w-28" value={gastoLine.monto} onChange={e => setGastoLine({ ...gastoLine, monto: e.target.value })} />
              <button type="button" onClick={addGastoLine} className="btn btn-primary"><Icons.plus /></button>
            </div>
            {form.gastos.length > 0 && <div className="space-y-1">{form.gastos.map((g, i) => (<div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"><span className="text-slate-700">{g.descripcion}</span><div className="flex items-center gap-2"><span className="font-medium">${g.monto.toFixed(2)}</span><button onClick={() => removeGasto(i)} className="text-slate-400 hover:text-red-600 transition-colors"><Icons.x /></button></div></div>))}</div>}
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
            <span className="text-sm text-slate-600">Productos ${totalProductos.toFixed(2)} + Gastos ${totalGastos.toFixed(2)}</span>
            <span className="text-xl font-semibold text-slate-900 tracking-tight">${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          {saldoInsuficiente && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-600 mt-0.5"><Icons.alertTriangle /></span>
              <div>
                <p className="text-sm font-medium text-red-900">Saldo insuficiente</p>
                <p className="text-xs text-red-700 mt-0.5">El total de ${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })} excede el saldo disponible de ${state.banco.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-600 mt-0.5"><Icons.alertTriangle /></span>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancelar</button>
            <button onClick={handleSubmit} disabled={form.productos.length === 0 || saldoInsuficiente} className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Registrar Compra</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
