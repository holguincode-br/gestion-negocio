import { useState } from 'react';
import { DataProvider } from './context/DataContext';
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

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const Page = pages[activePage] || Dashboard;

  return (
    <DataProvider>
      <Layout activePage={activePage} onNavigate={setActivePage}>
        <Page />
      </Layout>
    </DataProvider>
  );
}

export default App;
