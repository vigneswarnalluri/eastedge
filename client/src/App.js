import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import NewArrivals from './pages/NewArrivals';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import Admin from './pages/Admin';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <UserPreferencesProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <Routes>
                {/* Admin Panel - No Header/Footer */}
                <Route path="/admin" element={<Admin />} />
                
                {/* Main Website - With Header/Footer */}
                <Route path="*" element={
                  <div className="App">
                    <Header />
                    <main>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/new-arrivals" element={<NewArrivals />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/about" element={<AboutUs />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </UserPreferencesProvider>
    </AuthProvider>
  );
}

export default App;
