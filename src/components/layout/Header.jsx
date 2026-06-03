import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Menu, X, User, Bell, LogOut, ChevronDown } from 'lucide-react';
import { href, Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartCount, fetchCart, clearCart } from '../../store/cartSlice';
import { selectCurrentUser, selectIsLoggedIn, logout } from '../../store/authSlice';

export default function Header() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const cartCount = useSelector(selectCartCount);
  const user = useSelector(selectCurrentUser);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const currentSearch = new URLSearchParams(location.search);
  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchCart());
  }, [isLoggedIn, dispatch]);

  useEffect(() => {
    setSearchValue(new URLSearchParams(location.search).get('search') || '');
  }, [location.search]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    dispatch(logout());      // clears auth state + localStorage
    dispatch(clearCart());   // clears cart state
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    ...(isLoggedIn?[{name:'Store', href:'/store'}]:[]),
    // { name: 'Store', href: '/store' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    ...(user?.role === 'ADMIN' ? [
      { name: 'Add Product', href: '/admin/products/new' },
      { name: 'Orders', href: '/admin/orders' },
] : [])
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      navigate(`/store?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/store');
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start sm:justify-between gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-1">
            <div className="w-5 h-5 flex items-center justify-center">
              <img src='../../../public/favicon.svg' className='img-fluid' alt='Logo' />
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:inline">
              M-Mart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='flex items-center justify-between w-full gap-4'>
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search products..."
                  className="bg-transparent outline-none text-sm text-gray-700 w-48"
                />
                <button type="submit">
                  <Search size={18} className="text-gray-500 hover:text-blue-600" />
                </button>
              </form>

              {/* Bell */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} className="text-gray-700" />
              </button>

              {/* User menu — dropdown when logged in, login link when not */}
              <div className="relative" ref={userMenuRef}>
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user?.firstName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                        {user?.firstName}
                      </span>
                      <ChevronDown size={14} className="text-gray-500" />
                    </button>

                    {/* Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          {user?.role === 'ADMIN' && (
                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              Admin
                            </span>
                          )}
                        </div>

                        {/* Menu items */}
                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/cart"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          My Cart
                          {cartCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {cartCount}
                            </span>
                          )}
                        </Link>

                        <hr className="my-1 border-gray-100" />

                        {/* Sign out */}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User size={20} className="text-gray-700" />
                  </button>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart size={20} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="px-4 py-2">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm text-gray-700 flex-1"
                />
                <button type="submit">
                  <Search size={18} className="text-gray-500" />
                </button>
              </div>
            </form>

            {/* Mobile sign out */}
            {isLoggedIn && (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
