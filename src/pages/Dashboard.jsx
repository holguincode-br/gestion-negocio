import { useData } from '../context/DataContext';
import { Icons } from '../components/Icons';

export default function Dashboard() {
  const { state, getStock } = useData();
  const productosBajoStock = state.productos.filter(p => getStock(1, p.id) <= p.stockMinimo);
  const ultimosMovimientos = [...state.banco.movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
  const ultimasCompras = [...state.compras].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 3);
  const ultimosIpvs = [...state.ipvs].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 3);
  const totalVentas = state.ipvs.reduce((s, ipv) => s + ipv.ventas.reduce((sv, v) => sv + v.cantidad * v.precioVenta, 0), 0);
  const totalGanancias = state.socios.reduce((s, socio) => s + socio.gananciasAcumuladas, 0);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Icons.dollarSign />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium">Balance del Banco</p>
              <p className={`text-xl font-semibold tracking-tight mt-0.5 ${state.banco.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                ${state.banco.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Icons.arrowUp />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium">Total Ventas</p>
              <p className="text-xl font-semibold text-emerald-600 tracking-tight mt-0.5">${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
              <Icons.package />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium">Productos</p>
              <p className="text-xl font-semibold text-slate-900 tracking-tight mt-0.5">{state.productos.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Icons.socios />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium">Ganancias Distribuidas</p>
              <p className="text-xl font-semibold text-purple-600 tracking-tight mt-0.5">${totalGanancias.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {productosBajoStock.length > 0 && (
        <div className="card border-red-200/80 bg-red-50/30">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <Icons.alertTriangle />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 tracking-tight">Alertas de Stock Bajo</h3>
              <p className="text-xs text-red-600/70">{productosBajoStock.length} producto{productosBajoStock.length > 1 ? 's' : ''} por debajo del minimo</p>
            </div>
            <span className="ml-auto badge badge-danger">{productosBajoStock.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {productosBajoStock.map(p => {
              const stock = getStock(1, p.id);
              const pct = Math.max(0, (stock / p.stockMinimo) * 100);
              return (
                <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3.5 py-2.5 border border-red-100">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">{p.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-1 rounded-full transition-all ${pct < 50 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-danger ml-3 flex-shrink-0">{stock}/{p.stockMinimo}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-flat">
          <h3 className="section-title mb-1">Ultimos Movimientos</h3>
          <p className="section-subtitle mb-4">Actividad reciente del banco</p>
          {ultimosMovimientos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Icons.banco /></div>
              <p className="empty-state-title">Sin movimientos</p>
              <p className="empty-state-text">Los movimientos del banco apareceran aqui</p>
            </div>
          ) : (
            <div className="space-y-0">
              {ultimosMovimientos.map((m, i) => (
                <div key={m.id} className={`flex items-center justify-between py-3 ${i < ultimosMovimientos.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${(m.tipo === 'ingreso' || m.tipo === 'deposito') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {(m.tipo === 'ingreso' || m.tipo === 'deposito') ? <Icons.arrowUp /> : <Icons.arrowDown />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.descripcion}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{m.fecha}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${(m.tipo === 'ingreso' || m.tipo === 'deposito') ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(m.tipo === 'ingreso' || m.tipo === 'deposito') ? '+' : '-'}${m.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-flat">
          <h3 className="section-title mb-1">Ultimas Operaciones</h3>
          <p className="section-subtitle mb-4">Compras y sesiones de venta</p>
          <div className="space-y-4">
            {ultimasCompras.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Compras Recientes</p>
                <div className="space-y-0">
                  {ultimasCompras.map((c, i) => (
                    <div key={c.id} className={`flex items-center justify-between py-2.5 ${i < ultimasCompras.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Icons.compras /></div>
                        <div>
                          <span className="text-sm text-slate-700">{c.fecha}</span>
                          <span className="text-xs text-slate-400 ml-2">{c.productos.length} productos</span>
                        </div>
                      </div>
                      <span className="font-medium text-sm text-red-600">-${c.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {ultimosIpvs.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">IPVs Recientes</p>
                <div className="space-y-0">
                  {ultimosIpvs.map((ipv, i) => (
                    <div key={ipv.id} className={`flex items-center justify-between py-2.5 ${i < ultimosIpvs.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500"><Icons.ipv /></div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-700">{ipv.fecha}</span>
                          <span className={`badge ${ipv.estado === 'cerrado' ? 'badge-success' : 'badge-warning'}`}>
                            {ipv.estado === 'cerrado' ? 'Cerrado' : 'Abierto'}
                          </span>
                        </div>
                      </div>
                      {ipv.estado === 'cerrado' && (
                        <span className="font-medium text-sm text-emerald-600">${ipv.gananciaNeta?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {ultimasCompras.length === 0 && ultimosIpvs.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><Icons.ipv /></div>
                <p className="empty-state-title">Sin operaciones</p>
                <p className="empty-state-text">Las compras y ventas apareceran aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
