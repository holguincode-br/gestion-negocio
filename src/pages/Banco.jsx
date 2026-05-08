import { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Icons } from '../components/Icons';

export default function Banco() {
  const { state, addMovimientoBanco } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], tipo: 'ingreso', descripcion: '', monto: '' });
  const movimientos = [...state.banco.movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const totalIngresos = movimientos.filter(m => m.tipo === 'ingreso' || m.tipo === 'deposito').reduce((s, m) => s + m.monto, 0);
  const totalEgresos = movimientos.filter(m => m.tipo === 'egreso' || m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0);

  const handleSubmit = (e) => { e.preventDefault(); addMovimientoBanco({ ...form, monto: Number(form.monto) }); setForm({ fecha: new Date().toISOString().split('T')[0], tipo: 'ingreso', descripcion: '', monto: '' }); setModalOpen(false); };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-slate-500 font-medium mb-1">Balance Actual</p>
          <p className={`text-2xl font-semibold tracking-tight ${state.banco.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>${state.banco.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1"><span className="text-emerald-600"><Icons.arrowUp /></span><p className="text-sm text-slate-500 font-medium">Total Ingresos</p></div>
          <p className="text-xl font-semibold text-emerald-600 tracking-tight">${totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1"><span className="text-red-600"><Icons.arrowDown /></span><p className="text-sm text-slate-500 font-medium">Total Egresos</p></div>
          <p className="text-xl font-semibold text-red-600 tracking-tight">${totalEgresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="flex justify-end"><button onClick={() => setModalOpen(true)} className="btn btn-primary"><Icons.plus /> Nuevo Movimiento</button></div>

      <div className="table-container">
        <table className="table">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripcion</th><th className="text-right">Monto</th></tr></thead>
          <tbody>
            {movimientos.map(m => (
              <tr key={m.id}>
                <td className="text-slate-500">{m.fecha}</td>
                <td><span className={`badge ${m.tipo === 'ingreso' || m.tipo === 'deposito' ? 'badge-success' : 'badge-danger'}`}>{m.tipo.toUpperCase()}</span></td>
                <td>{m.descripcion}</td>
                <td className={`text-right font-semibold ${(m.tipo === 'ingreso' || m.tipo === 'deposito') ? 'text-emerald-600' : 'text-red-600'}`}>{(m.tipo === 'ingreso' || m.tipo === 'deposito') ? '+' : '-'}${m.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {movimientos.length === 0 && <div className="empty-state"><div className="empty-state-icon"><Icons.banco /></div><p className="empty-state-title">Sin movimientos</p><p className="empty-state-text">Registra tu primer movimiento del banco</p></div>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Movimiento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label><input type="date" className="input" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label><select className="select" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option><option value="deposito">Deposito</option><option value="gasto">Gasto</option></select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Descripcion</label><input className="input" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required placeholder="Descripcion del movimiento" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Monto</label><input type="number" step="0.01" min="0" className="input" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} required placeholder="0.00" /></div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100"><button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancelar</button><button type="submit" className="btn btn-primary">Registrar</button></div>
        </form>
      </Modal>
    </div>
  );
}
