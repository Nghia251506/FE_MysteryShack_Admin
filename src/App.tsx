import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import TarotList from './pages/tarot/TarotList';
import TarotForm from './pages/tarot/TarotForm';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import OrderList from './pages/orders/OrderList';
import OrderForm from './pages/orders/OrderForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tarot" element={<TarotList />} />
          <Route path="tarot/new" element={<TarotForm />} />
          <Route path="tarot/edit/:id" element={<TarotForm />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/new" element={<OrderForm />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
