import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Almacenes from './pages/Almacenes';
import Banco from './pages/Banco';
import Compras from './pages/Compras';
import IPV from './pages/IPV';
import Socios from './pages/Socios';
import Finanzas from './pages/Finanzas';
import Configuracion from './pages/Configuracion';

const pages = {
  dashboard: Dashboard,
  productos: Productos,
  almacenes: Almacenes,
  banco: Banco,
  compras: Compras,
  ipv: IPV,
  socios: Socios,
  finanzas: Finanzas,
  configuracion: Configuracion,
};

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  const { loading } = useData();
  const Page = pages[activePage] || Dashboard;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      <Page />
    </Layout>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;
