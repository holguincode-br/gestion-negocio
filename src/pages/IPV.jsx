import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';
import { Icons } from '../components/Icons';

export default function IPV() {
  const { state, addIpv, updateIpv, addMovimientoBanco, updateSocioGanancia, getStock, setStock, addRetiroSocio, updatePrecioVenta } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [form, setForm] = useState({ fecha: new Date().toISOString().split('T')[0], ventas: [], mermas: [], consumos: {} });
  const [ventaLine, setVentaLine] = useState({ productoId: '', cantidad: '', precioVenta: '' });
  const [mermaLine, setMermaLine] = useState({ productoId: '', cantidad: '', motivo: '' });
  const [consumoLine, setConsumoLine] = useState({ socioId: '', productoId: '', cantidad: '' });
  const [stockErrors, setStockErrors] = useState([]);

  const almacenVenta = state.almacenes.find(a => a.esPrincipal)?.id || 1;

  const totalVentas = form.ventas.reduce((s, v) => s + (v.cantidad * v.precioVenta), 0);

  const stockUsage = useMemo(() => {
    const usage = {};
    form.ventas.forEach(v => { usage[v.productoId] = (usage[v.productoId] || 0) + v.cantidad; });
    form.mermas.forEach(m => { usage[m.productoId] = (usage[m.productoId] || 0) + m.cantidad; });
    Object.values(form.consumos).flat().forEach(c => { usage[c.productoId] = (usage[c.productoId] || 0) + c.cantidad; });
    return usage;
  }, [form.ventas, form.mermas, form.consumos]);

  const stockExceeded = useMemo(() => {
    const errors = [];
    Object.entries(stockUsage).forEach(([prodId, qty]) => {
      const current = getStock(almacenVenta, Number(prodId));
      if (qty > current) {
        const prod = state.productos.find(p => p.id === Number(prodId));
        errors.push({ productoId: Number(prodId), nombre: prod?.nombre || 'Producto', stock: current, solicitado: qty, diferencia: qty - current });
      }
    });
    return errors;
  }, [stockUsage, almacenVenta, state.productos, getStock]);

  const addVenta = () => {
    if (ventaLine.productoId && ventaLine.cantidad && ventaLine.precioVenta) {
      const prodId = Number(ventaLine.productoId);
      const cant = Number(ventaLine.cantidad);
      const currentStock = getStock(almacenVenta, prodId);
      const existingUsage = stockUsage[prodId] || 0;
      if (existingUsage + cant > currentStock) {
        const prod = state.productos.find(p => p.id === prodId);
        setStockErrors(prev => [...prev, { productoId: prodId, nombre: prod?.nombre || 'Producto', stock: currentStock, solicitado: existingUsage + cant, diferencia: existingUsage + cant - currentStock }]);
        return;
      }
      const prod = state.productos.find(p => p.id === prodId);
      setForm({ ...form, ventas: [...form.ventas, { productoId: prodId, cantidad: cant, precioVenta: Number(ventaLine.precioVenta), costoUnitario: prod?.precioCompra || 0 }] });
      setVentaLine({ productoId: '', cantidad: '', precioVenta: '' });
      setStockErrors(prev => prev.filter(e => e.productoId !== prodId));
    }
  };

  const addMerma = () => {
    if (mermaLine.productoId && mermaLine.cantidad && mermaLine.motivo) {
      const prodId = Number(mermaLine.productoId);
      const cant = Number(mermaLine.cantidad);
      const currentStock = getStock(almacenVenta, prodId);
      const existingUsage = stockUsage[prodId] || 0;
      if (existingUsage + cant > currentStock) {
        const prod = state.productos.find(p => p.id === prodId);
        setStockErrors(prev => [...prev, { productoId: prodId, nombre: prod?.nombre || 'Producto', stock: currentStock, solicitado: existingUsage + cant, diferencia: existingUsage + cant - currentStock }]);
        return;
      }
      const prod = state.productos.find(p => p.id === prodId);
      setForm({ ...form, mermas: [...form.mermas, { productoId: prodId, cantidad: cant, motivo: mermaLine.motivo, costoUnitario: prod?.precioCompra || 0 }] });
      setMermaLine({ productoId: '', cantidad: '', motivo: '' });
      setStockErrors(prev => prev.filter(e => e.productoId !== prodId));
    }
  };

  const addConsumo = () => {
    if (consumoLine.socioId && consumoLine.productoId && consumoLine.cantidad) {
      const prodId = Number(consumoLine.productoId);
      const cant = Number(consumoLine.cantidad);
      const currentStock = getStock(almacenVenta, prodId);
      const existingUsage = stockUsage[prodId] || 0;
      if (existingUsage + cant > currentStock) {
        const prod = state.productos.find(p => p.id === prodId);
        setStockErrors(prev => [...prev, { productoId: prodId, nombre: prod?.nombre || 'Producto', stock: currentStock, solicitado: existingUsage + cant, diferencia: existingUsage + cant - currentStock }]);
        return;
      }
      const prod = state.productos.find(p => p.id === prodId);
      const key = consumoLine.socioId;
      const existing = form.consumos[key] || [];
      setForm({ ...form, consumos: { ...form.consumos, [key]: [...existing, { productoId: prodId, cantidad: cant, costoUnitario: prod?.precioCompra || 0 }] } });
      setConsumoLine({ socioId: '', productoId: '', cantidad: '' });
      setStockErrors(prev => prev.filter(e => e.productoId !== prodId));
    }
  };

  const removeVenta = (i) => {
    const removed = form.ventas[i];
    setForm({ ...form, ventas: form.ventas.filter((_, idx) => idx !== i) });
    setStockErrors(prev => prev.filter(e => e.productoId !== removed.productoId));
  };
  const removeMerma = (i) => {
    const removed = form.mermas[i];
    setForm({ ...form, mermas: form.mermas.filter((_, idx) => idx !== i) });
    setStockErrors(prev => prev.filter(e => e.productoId !== removed.productoId));
  };
  const removeConsumo = (socioId, i) => {
    const updated = { ...form.consumos };
    const removed = updated[socioId][i];
    updated[socioId] = updated[socioId].filter((_, idx) => idx !== i);
    setForm({ ...form, consumos: updated });
    setStockErrors(prev => prev.filter(e => e.productoId !== removed.productoId));
  };

  const calcularGanancia = (ipv) => { const ingresos = ipv.ventas.reduce((s, v) => s + v.cantidad * v.precioVenta, 0); const costoVentas = ipv.ventas.reduce((s, v) => s + v.cantidad * v.costoUnitario, 0); const costoMermas = ipv.mermas.reduce((s, m) => s + m.cantidad * m.costoUnitario, 0); const costoConsumos = Object.values(ipv.consumos || {}).flat().reduce((s, c) => s + c.cantidad * c.costoUnitario, 0); return { ingresos, costoVentas, costoMermas, costoConsumos, neta: ingresos - costoVentas - costoMermas }; };

  const cerrarIPV = (ipv) => {
    if (ipv.estado === 'cerrado') return;
    const calc = calcularGanancia(ipv);
    ipv.ventas.forEach(v => { setStock({ almacenId: almacenVenta, productoId: v.productoId, cantidad: getStock(almacenVenta, v.productoId) - v.cantidad }); updatePrecioVenta({ productoId: v.productoId, nuevoPrecio: v.precioVenta }); });
    ipv.mermas.forEach(m => { setStock({ almacenId: almacenVenta, productoId: m.productoId, cantidad: getStock(almacenVenta, m.productoId) - m.cantidad }); });
    const updatedConsumos = { ...ipv.consumos };
    Object.entries(updatedConsumos).forEach(([, consumos]) => { consumos.forEach(c => { setStock({ almacenId: almacenVenta, productoId: c.productoId, cantidad: getStock(almacenVenta, c.productoId) - c.cantidad }); }); });
    const totalConsumosCosto = calc.costoConsumos;
    const gananciaAjustada = calc.neta - totalConsumosCosto;
    const reinversionMonto = gananciaAjustada * (state.reinversion.porcentaje / 100);
    const gananciaDistribuible = gananciaAjustada - reinversionMonto;
    addMovimientoBanco({ fecha: ipv.fecha, tipo: 'ingreso', descripcion: `IPV #${ipv.id} - Ventas`, monto: calc.ingresos });
    if (reinversionMonto > 0) addMovimientoBanco({ fecha: ipv.fecha, tipo: 'egreso', descripcion: `IPV #${ipv.id} - Reinversion`, monto: reinversionMonto });
    state.socios.forEach(socio => { const socioConsumos = (ipv.consumos?.[socio.id] || []).reduce((sum, c) => sum + c.cantidad * c.costoUnitario, 0); const gananciaSocio = (gananciaDistribuible * (socio.porcentaje / 100)) - socioConsumos; updateSocioGanancia({ socioId: socio.id, monto: gananciaSocio }); });
    Object.entries(updatedConsumos).forEach(([socioId, consumos]) => { const costoTotal = consumos.reduce((s, c) => s + c.cantidad * c.costoUnitario, 0); addRetiroSocio({ socioId: Number(socioId), monto: costoTotal, fecha: ipv.fecha, descripcion: `Consumo personal IPV #${ipv.id}` }); });
    updateIpv({ ...ipv, estado: 'cerrado', gananciaNeta: gananciaAjustada, reinversion: reinversionMonto });
  };

  const handleSubmit = () => { if (form.ventas.length === 0 && form.mermas.length === 0) return; if (stockExceeded.length > 0) return; addIpv({ ...form, estado: 'abierto', gananciaNeta: 0, reinversion: 0 }); setForm({ fecha: new Date().toISOString().split('T')[0], ventas: [], mermas: [], consumos: {} }); setStockErrors([]); setModalOpen(false); };
  const ipvs = [...state.ipvs].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header"><div /><button onClick={() => { setStockErrors([]); setModalOpen(true); }} className="btn btn-primary"><Icons.plus /> Nuevo IPV</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ipvs.map(ipv => { const calc = calcularGanancia(ipv); return (
          <div key={ipv.id} className="card-flat">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-slate-500">{ipv.fecha}</span><span className={`badge ${ipv.estado === 'cerrado' ? 'badge-success' : 'badge-warning'}`}>{ipv.estado === 'cerrado' ? 'CERRADO' : 'ABIERTO'}</span></div>
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between"><span className="text-slate-500">Ventas:</span><span className="font-medium text-emerald-600">${calc.ingresos.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Costo ventas:</span><span className="text-red-600">-${calc.costoVentas.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Mermas:</span><span className="text-red-600">-${calc.costoMermas.toFixed(2)}</span></div>
              {ipv.estado === 'cerrado' && <div className="flex justify-between font-semibold pt-2 border-t border-slate-100"><span>Ganancia neta:</span><span className={ipv.gananciaNeta >= 0 ? 'text-emerald-600' : 'text-red-600'}>${ipv.gananciaNeta.toFixed(2)}</span></div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDetailOpen(ipv)} className="btn btn-secondary flex-1"><Icons.eye /> Detalle</button>
              {ipv.estado === 'abierto' && <button onClick={() => cerrarIPV(ipv)} className="btn btn-success flex-1">Cerrar</button>}
            </div>
          </div>
        ); })}
      </div>
      {ipvs.length === 0 && <div className="card-flat"><div className="empty-state"><div className="empty-state-icon"><Icons.ipv /></div><p className="empty-state-title">No hay sesiones IPV</p><p className="empty-state-text">Crea tu primera sesion de venta</p></div></div>}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo IPV" size="lg">
        <div className="space-y-5">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label><input type="date" className="input" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>

          {stockExceeded.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-600 mt-0.5"><Icons.alertTriangle /></span>
              <div>
                <p className="text-sm font-medium text-red-900">Stock insuficiente</p>
                {stockExceeded.map((err, i) => (
                  <p key={i} className="text-xs text-red-700 mt-1">{err.nombre}: stock {err.stock}, solicitado {err.solicitado} (faltan {err.diferencia})</p>
                ))}
                <p className="text-xs text-red-700 mt-2 font-medium">No se puede crear el IPV hasta corregir el stock</p>
              </div>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl p-4">
            <p className="font-medium text-sm text-slate-900 mb-3">Ventas</p>
            <div className="flex gap-2 mb-3">
              <select className="select flex-1" value={ventaLine.productoId} onChange={e => { const prod = state.productos.find(p => p.id === Number(e.target.value)); setVentaLine({ ...ventaLine, productoId: e.target.value, precioVenta: prod?.precioVenta || '' }); }}><option value="">Producto...</option>{state.productos.map(p => { const stock = getStock(almacenVenta, p.id); const used = stockUsage[p.id] || 0; const disp = stock - used; return <option key={p.id} value={p.id}>{p.nombre} (disp: {disp})</option>; })}</select>
              <input type="number" min="1" placeholder="Cant." className="input w-24" value={ventaLine.cantidad} onChange={e => setVentaLine({ ...ventaLine, cantidad: e.target.value })} />
              <input type="number" step="0.01" min="0" placeholder="Precio" className="input w-28" value={ventaLine.precioVenta} onChange={e => setVentaLine({ ...ventaLine, precioVenta: e.target.value })} />
              <button type="button" onClick={addVenta} className="btn btn-primary"><Icons.plus /></button>
            </div>
            {form.ventas.length > 0 && <div className="space-y-1">{form.ventas.map((v, i) => { const prod = state.productos.find(p => p.id === v.productoId); return (<div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"><span className="text-slate-700">{prod?.nombre} x{v.cantidad}</span><div className="flex items-center gap-2"><span className="font-medium">${(v.cantidad * v.precioVenta).toFixed(2)}</span><button onClick={() => removeVenta(i)} className="text-slate-400 hover:text-red-600 transition-colors"><Icons.x /></button></div></div>); })}</div>}
          </div>
          <div className="border border-slate-200 rounded-xl p-4">
            <p className="font-medium text-sm text-slate-900 mb-3">Mermas</p>
            <div className="flex gap-2 mb-3">
              <select className="select flex-1" value={mermaLine.productoId} onChange={e => setMermaLine({ ...mermaLine, productoId: e.target.value })}><option value="">Producto...</option>{state.productos.map(p => { const stock = getStock(almacenVenta, p.id); const used = stockUsage[p.id] || 0; const disp = stock - used; return <option key={p.id} value={p.id}>{p.nombre} (disp: {disp})</option>; })}</select>
              <input type="number" min="1" placeholder="Cant." className="input w-24" value={mermaLine.cantidad} onChange={e => setMermaLine({ ...mermaLine, cantidad: e.target.value })} />
              <input className="input flex-1" placeholder="Motivo" value={mermaLine.motivo} onChange={e => setMermaLine({ ...mermaLine, motivo: e.target.value })} />
              <button type="button" onClick={addMerma} className="btn btn-primary"><Icons.plus /></button>
            </div>
            {form.mermas.length > 0 && <div className="space-y-1">{form.mermas.map((m, i) => { const prod = state.productos.find(p => p.id === m.productoId); return (<div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm"><span className="text-slate-700">{prod?.nombre} x{m.cantidad} - {m.motivo}</span><div className="flex items-center gap-2"><span className="font-medium text-red-600">-${(m.cantidad * m.costoUnitario).toFixed(2)}</span><button onClick={() => removeMerma(i)} className="text-slate-400 hover:text-red-600 transition-colors"><Icons.x /></button></div></div>); })}</div>}
          </div>
          <div className="border border-slate-200 rounded-xl p-4">
            <p className="font-medium text-sm text-slate-900 mb-3">Consumo Personal</p>
            <div className="flex gap-2 mb-3">
              <select className="select flex-1" value={consumoLine.socioId} onChange={e => setConsumoLine({ ...consumoLine, socioId: e.target.value })}><option value="">Socio...</option>{state.socios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
              <select className="select flex-1" value={consumoLine.productoId} onChange={e => setConsumoLine({ ...consumoLine, productoId: e.target.value })}><option value="">Producto...</option>{state.productos.map(p => { const stock = getStock(almacenVenta, p.id); const used = stockUsage[p.id] || 0; const disp = stock - used; return <option key={p.id} value={p.id}>{p.nombre} (disp: {disp})</option>; })}</select>
              <input type="number" min="1" placeholder="Cant." className="input w-24" value={consumoLine.cantidad} onChange={e => setConsumoLine({ ...consumoLine, cantidad: e.target.value })} />
              <button type="button" onClick={addConsumo} className="btn btn-primary"><Icons.plus /></button>
            </div>
            {Object.entries(form.consumos).map(([socioId, consumos]) => { const socio = state.socios.find(s => s.id === Number(socioId)); return (<div key={socioId} className="mb-3"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">{socio?.nombre}</p>{consumos.map((c, i) => { const prod = state.productos.find(p => p.id === c.productoId); return (<div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm mb-1"><span className="text-slate-700">{prod?.nombre} x{c.cantidad}</span><div className="flex items-center gap-2"><span className="text-red-600">-${(c.cantidad * c.costoUnitario).toFixed(2)}</span><button onClick={() => removeConsumo(socioId, i)} className="text-slate-400 hover:text-red-600 transition-colors"><Icons.x /></button></div></div>); })}</div>); })}
          </div>
          {totalVentas > 0 && <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"><span className="text-sm text-slate-600">Total Ventas</span><span className="text-xl font-semibold text-emerald-600 tracking-tight">${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>}
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancelar</button>
            <button onClick={handleSubmit} disabled={form.ventas.length === 0 && form.mermas.length === 0 || stockExceeded.length > 0} className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Crear IPV</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)} title={`IPV #${detailOpen?.id} - Detalle`} size="lg">
        {detailOpen && <div className="space-y-5">
          <div className="flex items-center justify-between"><span className="text-sm text-slate-500">{detailOpen.fecha}</span><span className={`badge ${detailOpen.estado === 'cerrado' ? 'badge-success' : 'badge-warning'}`}>{detailOpen.estado.toUpperCase()}</span></div>
          {detailOpen.ventas.length > 0 && <div><h4 className="text-sm font-medium text-slate-900 mb-2">Ventas</h4><div className="border border-slate-200 rounded-xl overflow-hidden"><table className="table"><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th className="text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-100">{detailOpen.ventas.map((v, i) => { const prod = state.productos.find(p => p.id === v.productoId); return (<tr key={i}><td className="font-medium">{prod?.nombre}</td><td>{v.cantidad}</td><td>${v.precioVenta.toFixed(2)}</td><td className="text-right font-medium">${(v.cantidad * v.precioVenta).toFixed(2)}</td></tr>); })}</tbody></table></div></div>}
          {detailOpen.mermas.length > 0 && <div><h4 className="text-sm font-medium text-slate-900 mb-2">Mermas</h4><div className="border border-slate-200 rounded-xl overflow-hidden"><table className="table"><thead><tr><th>Producto</th><th>Cantidad</th><th>Motivo</th><th className="text-right">Costo</th></tr></thead><tbody className="divide-y divide-slate-100">{detailOpen.mermas.map((m, i) => { const prod = state.productos.find(p => p.id === m.productoId); return (<tr key={i}><td>{prod?.nombre}</td><td>{m.cantidad}</td><td>{m.motivo}</td><td className="text-right text-red-600">-${(m.cantidad * m.costoUnitario).toFixed(2)}</td></tr>); })}</tbody></table></div></div>}
          {Object.entries(detailOpen.consumos || {}).length > 0 && <div><h4 className="text-sm font-medium text-slate-900 mb-2">Consumos Personales</h4>{Object.entries(detailOpen.consumos).map(([socioId, consumos]) => { const socio = state.socios.find(s => s.id === Number(socioId)); return (<div key={socioId} className="mb-3"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">{socio?.nombre}</p>{consumos.map((c, i) => { const prod = state.productos.find(p => p.id === c.productoId); return (<p key={i} className="text-sm text-slate-700">{prod?.nombre} x{c.cantidad} - ${(c.cantidad * c.costoUnitario).toFixed(2)}</p>); })}</div>); })}</div>}
          {detailOpen.estado === 'cerrado' && <div className="bg-slate-50 rounded-xl p-4"><h4 className="text-sm font-semibold text-slate-900 mb-2">Resumen Financiero</h4><div className="space-y-1 text-sm"><div className="flex justify-between"><span className="text-slate-500">Ganancia neta:</span><span className="font-semibold text-emerald-600">${detailOpen.gananciaNeta?.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-slate-500">Reinversion:</span><span className="font-semibold">${detailOpen.reinversion?.toFixed(2)}</span></div></div></div>}
        </div>}
      </Modal>
    </div>
  );
}
