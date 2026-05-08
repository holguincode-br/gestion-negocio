import { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Icons } from '../components/Icons';

export default function Finanzas() {
  const { state, addRetiroSocio, addMovimientoBanco } = useData();
  const [retiroOpen, setRetiroOpen] = useState(false);
  const [retiroForm, setRetiroForm] = useState({ socioId: '', monto: '', fecha: new Date().toISOString().split('T')[0], descripcion: '' });
  const movimientos = [...state.banco.movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const totalVentas = state.ipvs.reduce((s, ipv) => s + ipv.ventas.reduce((sv, v) => sv + v.cantidad * v.precioVenta, 0), 0);
  const totalCompras = state.compras.reduce((s, c) => s + c.total, 0);
  const totalMermas = state.ipvs.reduce((s, ipv) => s + ipv.mermas.reduce((sm, m) => sm + m.cantidad * m.costoUnitario, 0), 0);
  const totalGanancias = state.socios.reduce((s, socio) => s + socio.gananciasAcumuladas, 0);

  const handleRetiro = () => { if (retiroForm.socioId && retiroForm.monto) { const monto = Number(retiroForm.monto); addRetiroSocio({ socioId: Number(retiroForm.socioId), monto, fecha: retiroForm.fecha, descripcion: retiroForm.descripcion || 'Retiro de ganancias' }); addMovimientoBanco({ fecha: retiroForm.fecha, tipo: 'egreso', descripcion: `Retiro socio - ${retiroForm.descripcion || 'Ganancias'}`, monto }); setRetiroForm({ socioId: '', monto: '', fecha: new Date().toISOString().split('T')[0], descripcion: '' }); setRetiroOpen(false); } };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-1"><div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"><Icons.dollarSign /></div><div><p className="text-sm text-slate-500 font-medium">Balance Banco</p><p className={`text-xl font-semibold tracking-tight ${state.banco.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>${state.banco.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p></div></div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-1"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Icons.arrowUp /></div><div><p className="text-sm text-slate-500 font-medium">Total Ventas</p><p className="text-xl font-semibold text-emerald-600 tracking-tight">${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p></div></div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-1"><div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600"><Icons.compras /></div><div><p className="text-sm text-slate-500 font-medium">Gastos Compras</p><p className="text-xl font-semibold text-red-600 tracking-tight">${totalCompras.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p></div></div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-1"><div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><Icons.alertTriangle /></div><div><p className="text-sm text-slate-500 font-medium">Mermas</p><p className="text-xl font-semibold text-amber-600 tracking-tight">${totalMermas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p></div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-flat">
          <div className="flex items-center justify-between mb-4"><h3 className="section-title">Ganancias por Socio</h3><button onClick={() => setRetiroOpen(true)} className="btn btn-primary btn-sm"><Icons.arrowDown /> Retiro</button></div>
          <div className="space-y-3">
            {state.socios.map(s => { const saldo = s.gananciasAcumuladas - s.retirosAcumulados; return (
              <div key={s.id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3"><div className="avatar">{s.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><span className="font-medium text-sm text-slate-900">{s.nombre}</span></div>
                  <span className="badge badge-indigo">{s.porcentaje}%</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-emerald-50 rounded-lg p-2.5"><p className="text-slate-500 mb-0.5">Ganancias</p><p className="font-semibold text-emerald-700">${s.gananciasAcumuladas.toFixed(2)}</p></div>
                  <div className="bg-red-50 rounded-lg p-2.5"><p className="text-slate-500 mb-0.5">Retiros</p><p className="font-semibold text-red-700">${s.retirosAcumulados.toFixed(2)}</p></div>
                  <div className={`rounded-lg p-2.5 ${saldo >= 0 ? 'bg-slate-50' : 'bg-red-50'}`}><p className="text-slate-500 mb-0.5">Saldo</p><p className={`font-semibold ${saldo >= 0 ? 'text-slate-900' : 'text-red-700'}`}>${saldo.toFixed(2)}</p></div>
                </div>
              </div>
            ); })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-flat">
            <h3 className="section-title mb-4">Resumen General</h3>
            <div className="space-y-0">
              <div className="flex justify-between text-sm py-3 border-b border-slate-100"><span className="text-slate-500">Total ventas</span><span className="font-medium text-emerald-600">+${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-sm py-3 border-b border-slate-100"><span className="text-slate-500">Gastos en compras</span><span className="font-medium text-red-600">-${totalCompras.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-sm py-3 border-b border-slate-100"><span className="text-slate-500">Costo mermas</span><span className="font-medium text-red-600">-${totalMermas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-sm py-3 border-b border-slate-100"><span className="text-slate-500">Ganancias distribuidas</span><span className="font-medium text-purple-600">${totalGanancias.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-sm py-3 font-semibold"><span>Balance banco</span><span className={state.banco.balance >= 0 ? 'text-slate-900' : 'text-red-600'}>${state.banco.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>
          <div className="card-flat">
            <h3 className="section-title mb-3">Reinversion</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Porcentaje</span><span className="font-semibold">{state.reinversion.porcentaje}%</span></div>
              <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${state.reinversion.porcentaje}%` }} /></div>
              <p className="text-xs text-slate-400">Reinversion: {state.reinversion.porcentaje}% | Socios: {100 - state.reinversion.porcentaje}%</p>
            </div>
          </div>
        </div>
      </div>

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
        {movimientos.length === 0 && <div className="empty-state"><div className="empty-state-icon"><Icons.banco /></div><p className="empty-state-title">Sin movimientos</p></div>}
      </div>

      <Modal isOpen={retiroOpen} onClose={() => setRetiroOpen(false)} title="Realizar Retiro">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Socio</label><select className="select" value={retiroForm.socioId} onChange={e => setRetiroForm({ ...retiroForm, socioId: e.target.value })}><option value="">Seleccionar...</option>{state.socios.map(s => <option key={s.id} value={s.id}>{s.nombre} (saldo: ${(s.gananciasAcumuladas - s.retirosAcumulados).toFixed(2)})</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Monto</label><input type="number" step="0.01" min="0" className="input" value={retiroForm.monto} onChange={e => setRetiroForm({ ...retiroForm, monto: e.target.value })} placeholder="0.00" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label><input type="date" className="input" value={retiroForm.fecha} onChange={e => setRetiroForm({ ...retiroForm, fecha: e.target.value })} /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Descripcion</label><input className="input" value={retiroForm.descripcion} onChange={e => setRetiroForm({ ...retiroForm, descripcion: e.target.value })} placeholder="Motivo del retiro" /></div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100"><button onClick={() => setRetiroOpen(false)} className="btn btn-secondary">Cancelar</button><button onClick={handleRetiro} className="btn btn-primary">Realizar Retiro</button></div>
        </div>
      </Modal>
    </div>
  );
}
