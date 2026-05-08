import { useState } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Icons } from '../components/Icons';

export default function Almacenes() {
  const { state, addAlmacen, deleteAlmacen, transferirStock, setStock } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [stockEditOpen, setStockEditOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [transfer, setTransfer] = useState({ almacenOrigen: '', almacenDestino: '', productoId: '', cantidad: '' });
  const [stockEdit, setStockEdit] = useState({ almacenId: '', productoId: '', cantidad: '' });
  const getStock = (almId, prodId) => state.stockPorAlmacen[almId]?.[prodId] || 0;

  const handleAdd = () => { if (newName.trim()) { addAlmacen(newName.trim()); setNewName(''); setModalOpen(false); } };
  const handleTransfer = () => { const cant = Number(transfer.cantidad); if (cant > 0 && transfer.almacenOrigen && transfer.almacenDestino && transfer.productoId) { transferirStock({ ...transfer, almacenOrigen: Number(transfer.almacenOrigen), almacenDestino: Number(transfer.almacenDestino), productoId: Number(transfer.productoId), cantidad: cant }); setTransfer({ almacenOrigen: '', almacenDestino: '', productoId: '', cantidad: '' }); setTransferOpen(false); } };
  const handleStockEdit = () => { if (stockEdit.almacenId && stockEdit.productoId) { setStock({ almacenId: Number(stockEdit.almacenId), productoId: Number(stockEdit.productoId), cantidad: Number(stockEdit.cantidad) }); setStockEditOpen(false); } };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div className="flex gap-2">
          <button onClick={() => setTransferOpen(true)} className="btn btn-primary"><Icons.refresh /> Transferir Stock</button>
          <button onClick={() => setStockEditOpen(true)} className="btn btn-secondary">Editar Stock</button>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary"><Icons.plus /> Nuevo Almacen</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {state.almacenes.map(alm => (
          <div key={alm.id} className="card-flat">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 tracking-tight flex items-center gap-2">{alm.nombre}{alm.esPrincipal && <span className="badge badge-info">Principal</span>}</h3>
              {!alm.esPrincipal && <button onClick={() => { if (confirm('Eliminar almacen?')) deleteAlmacen(alm.id); }} className="btn btn-ghost text-slate-400 hover:text-red-600"><Icons.trash /></button>}
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Producto</th><th>Stock</th><th>Min.</th><th>Estado</th></tr></thead>
                <tbody>
                  {state.productos.map(p => { const stock = getStock(alm.id, p.id); const bajo = stock <= p.stockMinimo; return (<tr key={p.id}><td className="font-medium text-sm text-slate-900">{p.nombre}</td><td className="font-semibold">{stock}</td><td className="text-slate-500">{p.stockMinimo}</td><td>{bajo ? <span className="badge badge-danger">BAJO</span> : <span className="badge badge-success">OK</span>}</td></tr>); })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Almacen">
        <div className="space-y-4">
          <input className="input" placeholder="Nombre del almacen" value={newName} onChange={e => setNewName(e.target.value)} />
          <div className="flex justify-end gap-2"><button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancelar</button><button onClick={handleAdd} className="btn btn-primary">Crear</button></div>
        </div>
      </Modal>

      <Modal isOpen={transferOpen} onClose={() => setTransferOpen(false)} title="Transferir Stock">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Almacen Origen</label><select className="select" value={transfer.almacenOrigen} onChange={e => setTransfer({ ...transfer, almacenOrigen: e.target.value })}><option value="">Seleccionar...</option>{state.almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Almacen Destino</label><select className="select" value={transfer.almacenDestino} onChange={e => setTransfer({ ...transfer, almacenDestino: e.target.value })}><option value="">Seleccionar...</option>{state.almacenes.filter(a => a.id !== Number(transfer.almacenOrigen)).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Producto</label><select className="select" value={transfer.productoId} onChange={e => setTransfer({ ...transfer, productoId: e.target.value })}><option value="">Seleccionar...</option>{state.productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({getStock(Number(transfer.almacenOrigen), p.id)})</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Cantidad</label><input type="number" min="1" className="input" value={transfer.cantidad} onChange={e => setTransfer({ ...transfer, cantidad: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100"><button onClick={() => setTransferOpen(false)} className="btn btn-secondary">Cancelar</button><button onClick={handleTransfer} className="btn btn-primary">Transferir</button></div>
        </div>
      </Modal>

      <Modal isOpen={stockEditOpen} onClose={() => setStockEditOpen(false)} title="Editar Stock">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Almacen</label><select className="select" value={stockEdit.almacenId} onChange={e => setStockEdit({ ...stockEdit, almacenId: e.target.value })}><option value="">Seleccionar...</option>{state.almacenes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Producto</label><select className="select" value={stockEdit.productoId} onChange={e => setStockEdit({ ...stockEdit, productoId: e.target.value, cantidad: getStock(Number(stockEdit.almacenId), Number(e.target.value)) })}><option value="">Seleccionar...</option>{state.productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Cantidad</label><input type="number" min="0" className="input" value={stockEdit.cantidad} onChange={e => setStockEdit({ ...stockEdit, cantidad: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100"><button onClick={() => setStockEditOpen(false)} className="btn btn-secondary">Cancelar</button><button onClick={handleStockEdit} className="btn btn-primary">Actualizar</button></div>
        </div>
      </Modal>
    </div>
  );
}
