import AdminLoginPage from './pages/AdminLoginPage.jsx';
import PublicDisplayPage from './pages/PublicDisplayPage.jsx';

function App() {
  if (window.location.pathname === '/kf-control') {
    return <AdminLoginPage />;
  }

  return <PublicDisplayPage />;
}

export default App;
