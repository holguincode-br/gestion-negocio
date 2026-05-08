import { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Icons } from '../components/Icons';

export default function Socios() {
  const { state, addSocio, updateSocio, deleteSocio, setReinversion } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', porcentaje: '', retencion: '' });
  const totalPorcentaje = state.socios.reduce((s, socio) => s + socio.porcentaje, 0);

  const openNew = () => { setEditing(null); setForm({ nombre: '', porcentaje: '', retencion: '' }); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ nombre: s.nombre, porcentaje: s.porcentaje, retencion: s.retencion || '' }); setModalOpen(true); };
  const handleSubmit = (e) => { e.preventDefault(); const data = { nombre: form.nombre, porcentaje: Number(form.porcentaje), retencion: Number(form.retencion) || 0 }; if (editing) updateSocio({ ...editing, ...data }); else addSocio(data); setModalOpen(false); };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-1"><div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Icons.socios /></div><div><p className="text-sm text-slate-500 font-medium">Socios Activos</p><p className="text-xl font-semibold text-slate-900 tracking-tight">{state.socios.length}</p></div></div>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500 font-medium mb-1">% Asignado</p>
          <p className={`text-xl font-semibold tracking-tight ${totalPorcentaje > 100 ? 'text-red-600' : 'text-slate-900'}`}>{totalPorcentaje}%</p>
          <p className="text-xs text-slate-400 mt-1">Disponible: {100 - totalPorcentaje}%</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-500 font-medium mb-1">% Reinversion</p>
          <p className="text-xl font-semibold text-slate-900 tracking-tight">{state.reinversion.porcentaje}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2"><div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${state.reinversion.porcentaje}%` }} /></div>
        </div>
      </div>

      <div className="card-flat">
        <div className="flex items-center justify-between">
          <div><h3 className="section-title">Reinversion del Negocio</h3><p className="section-subtitle">Lo restante se distribuye entre los socios</p></div>
          <div className="flex items-center gap-2"><input type="number" min="0" max="100" className="input w-20 text-center" value={state.reinversion.porcentaje} onChange={e => setReinversion({ porcentaje: Number(e.target.value) })} /><span className="text-sm text-slate-500">%</span></div>
        </div>
      </div>

      <div className="page-header"><div /><button onClick={openNew} className="btn btn-primary"><Icons.plus /> Nuevo Socio</button></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.socios.map(s => {
          const saldo = s.gananciasAcumuladas - s.retirosAcumulados;
          return (
            <div key={s.id} className="card-flat">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="avatar">{s.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  <div><h4 className="font-medium text-slate-900 text-sm">{s.nombre}</h4><p className="text-xs text-slate-400">{s.porcentaje}% ganancia</p></div>
                </div>
                <div className="flex gap-0.5">
                  <button onClick={() => openEdit(s)} className="btn btn-ghost btn-sm text-slate-400 hover:text-slate-900"><Icons.edit /></button>
                  <button onClick={() => { if (confirm('Eliminar socio?')) deleteSocio(s.id); }} className="btn btn-ghost btn-sm text-slate-400 hover:text-red-600"><Icons.trash /></button>
                </div>
              </div>
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Ganancias</span><span className="font-medium text-emerald-600">${s.gananciasAcumuladas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Retiros</span><span className="font-medium text-red-600">${s.retirosAcumulados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-100"><span>Saldo</span><span className={saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}>${saldo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Socio' : 'Nuevo Socio'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label><input className="input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Nombre completo" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Porcentaje (%)</label><input type="number" min="0" max="100" className="input" value={form.porcentaje} onChange={e => setForm({ ...form, porcentaje: e.target.value })} required /><p className="text-xs text-slate-400 mt-1">Disponible: {100 - totalPorcentaje}%</p></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">% Retencion Personal</label><input type="number" min="0" max="100" className="input" value={form.retencion} onChange={e => setForm({ ...form, retencion: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100"><button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancelar</button><button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Crear'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
