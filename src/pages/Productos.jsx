import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Icons } from '../components/Icons';

export default function Productos() {
  const { state, addProducto, updateProducto, deleteProducto, addCategoria, getStock } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [form, setForm] = useState({ nombre: '', categoria: '', precioCompra: '', precioVenta: '', stockMinimo: '' });
  const [newCat, setNewCat] = useState('');

  const filtered = useMemo(() => filterCat ? state.productos.filter(p => p.categoria === filterCat) : state.productos, [state.productos, filterCat]);

  const openNew = () => { setEditing(null); setForm({ nombre: '', categoria: state.categorias[0] || '', precioVenta: '', stockMinimo: '' }); setModalOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ nombre: p.nombre, categoria: p.categoria, precioCompra: p.precioCompra, precioVenta: p.precioVenta, stockMinimo: p.stockMinimo }); setModalOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updateProducto({ ...editing, nombre: form.nombre, categoria: form.categoria, precioCompra: Number(form.precioCompra), precioVenta: Number(form.precioVenta), stockMinimo: Number(form.stockMinimo) });
    } else {
      addProducto({ nombre: form.nombre, categoria: form.categoria, precioVenta: Number(form.precioVenta), stockMinimo: Number(form.stockMinimo) });
    }
    setModalOpen(false);
  };

  const handleAddCat = () => { if (newCat.trim()) { addCategoria(newCat.trim()); setNewCat(''); setCatModalOpen(false); } };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="page-header">
        <div className="flex gap-2 items-center">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="select w-auto">
            <option value="">Todas las categorias</option>
            {state.categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setCatModalOpen(true)} className="btn btn-secondary btn-sm">+ Categoria</button>
        </div>
        <button onClick={openNew} className="btn btn-primary"><Icons.plus /> Nuevo Producto</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th><th>Categoria</th><th>P. Compra</th><th>P. Venta</th><th>Stock</th><th>Min.</th><th>Estado</th><th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const stock = getStock(1, p.id);
              const bajo = stock <= p.stockMinimo;
              return (
                <tr key={p.id}>
                  <td className="font-medium text-slate-900">{p.nombre}</td>
                  <td><span className="badge badge-indigo">{p.categoria}</span></td>
                  <td className="text-slate-600">${p.precioCompra.toFixed(2)}</td>
                  <td className="font-medium text-slate-900">${p.precioVenta.toFixed(2)}</td>
                  <td className="font-semibold">{stock}</td>
                  <td className="text-slate-500">{p.stockMinimo}</td>
                  <td>{bajo ? <span className="badge badge-danger">BAJO</span> : <span className="badge badge-success">OK</span>}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm text-slate-400 hover:text-indigo-600"><Icons.edit /></button>
                      <button onClick={() => { if (confirm('Eliminar producto?')) deleteProducto(p.id); }} className="btn btn-ghost btn-sm text-slate-400 hover:text-red-600"><Icons.trash /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state"><div className="empty-state-icon"><Icons.package /></div><p className="empty-state-title">No hay productos</p><p className="empty-state-text">Agrega tu primer producto para comenzar</p></div>}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label><input className="input" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Nombre del producto" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Categoria</label><select className="select" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} required>{state.categorias.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            {editing && <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Precio Compra</label><input type="number" step="0.01" min="0" className="input" value={form.precioCompra} onChange={e => setForm({ ...form, precioCompra: e.target.value })} required placeholder="0.00" /></div>}
            <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Precio Venta</label><input type="number" step="0.01" min="0" className="input" value={form.precioVenta} onChange={e => setForm({ ...form, precioVenta: e.target.value })} required placeholder="0.00" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Minimo</label><input type="number" min="0" className="input" value={form.stockMinimo} onChange={e => setForm({ ...form, stockMinimo: e.target.value })} required /></div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title="Nueva Categoria">
        <div className="space-y-4">
          <input className="input" placeholder="Nombre de la categoria" value={newCat} onChange={e => setNewCat(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button onClick={() => setCatModalOpen(false)} className="btn btn-secondary">Cancelar</button>
            <button onClick={handleAddCat} className="btn btn-primary">Crear</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
