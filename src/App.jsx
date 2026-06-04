import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import './App.css'
import Register from './pages/Register'
import NoPage from './pages/NoPage'
import Store from './pages/Store'
import AdminProductForm from './pages/AdminProductForm'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccssPage'
import Categories from './pages/Categories'
import AdminOrders from './pages/AdminOrders'
import MyOrders from './pages/MyOrders'
import ChatWidget from './pages/ChatWidget'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/store' element={<Store />}/>
        <Route path='/categories' element={<Categories />} />
        <Route path='/admin/products/new' element={<AdminProductForm />} />
        <Route path='/admin/products/:id/edit' element={<AdminProductForm />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/order-success' element = {<OrderSuccessPage />}/>
        <Route path='/admin/orders' element={<AdminOrders />} />
        <Route path='/orders' element={<MyOrders />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
      <ChatWidget /> 
    </Router>
  )
}

export default App

