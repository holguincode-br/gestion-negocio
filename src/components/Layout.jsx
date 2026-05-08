import { useState } from 'react';
import { Icons } from './Icons';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { id: 'productos', label: 'Productos', icon: Icons.productos },
  { id: 'almacenes', label: 'Almacenes', icon: Icons.almacenes },
  { id: 'banco', label: 'Banco', icon: Icons.banco },
  { id: 'compras', label: 'Compras', icon: Icons.compras },
  { id: 'ipv', label: 'IPV', icon: Icons.ipv },
  { id: 'socios', label: 'Socios', icon: Icons.socios },
  { id: 'finanzas', label: 'Finanzas', icon: Icons.finanzas },
  { id: 'configuracion', label: 'Configuracion', icon: Icons.settings },
];

export default function Layout({ activePage, onNavigate, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/20">
            <span className="text-white font-bold text-xs tracking-tight">MN</span>
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 text-sm tracking-tight">Mi Negocio</h1>
            <p className="text-[11px] text-slate-400 font-medium">Sistema de Gestion</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activePage === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`transition-colors ${activePage === item.id ? 'text-indigo-500' : 'text-slate-400'}`}><item.icon /></span>
              {item.label}
              {activePage === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 px-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
            <Icons.menu />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight capitalize">{activePage}</h2>
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
