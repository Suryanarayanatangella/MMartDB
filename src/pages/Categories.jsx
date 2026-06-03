import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, ArrowRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../api/api';
import { selectIsLoggedIn } from '../store/authSlice';
import { useSelector } from 'react-redux';

// Fallback images per category name — add more as needed
const CATEGORY_IMAGES = {
    'Clothing':       'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    'Footwear':       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    'Accessories':    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop',
    'Grocery':        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
    'Beverages':      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
    'Snacks':         'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop',
    'Personal Care':  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
    'Electronics':    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    'Fashion':        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=300&fit=crop',
    'Sports':         'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    'Home & Living':  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop';

export default function Categories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);   // [{ name, count, image }]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isLoggedIn = useSelector(selectIsLoggedIn);
    useEffect(() => {
        const normalize = (str) =>
        str
            ? str.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            : str;

    api.get('/api/products', { params: { limit: 100 } })
        .then(res => {
            const allProducts = res.products || [];

            const map = {};
            allProducts.forEach(p => {
                const cat = normalize(p.category);   // ← normalize here
                if (!cat) return;
                if (!map[cat]) {
                    map[cat] = { count: 0, image: p.image || null };
                }
                map[cat].count += 1;
                if (!map[cat].image && p.image) {
                    map[cat].image = p.image;
                }
            });

            const list = Object.entries(map).map(([name, data]) => ({
                name,
                count: data.count,
                image: data.image || CATEGORY_IMAGES[name] || DEFAULT_IMAGE,
            }));

            setCategories(list);
        })
        .catch(() => setError('Failed to load categories'))
        .finally(() => setLoading(false));
    }, []);

    const handleCategoryClick = (categoryName) => {
        if(isLoggedIn) {
            navigate(`/store?category=${encodeURIComponent(categoryName)}`);
        } else return navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h1>
                    <p className="text-gray-500">Browse products by category</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 rounded-xl h-44 mb-3" />
                                <div className="bg-gray-200 rounded h-4 w-2/3 mb-2" />
                                <div className="bg-gray-200 rounded h-3 w-1/3" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Category grid */}
                {!loading && !error && categories.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <Tag size={48} className="mx-auto mb-4 opacity-40" />
                        <p className="text-lg">No categories found</p>
                    </div>
                )}

                {!loading && categories.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {categories.map(cat => (
                            <div
                                key={cat.name}
                                onClick={() => handleCategoryClick(cat.name)}
                                className="group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                            >
                                {/* Image */}
                                <div className="relative h-44 overflow-hidden">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                    />
                                    {/* Dark overlay */}
                                    <div className="absolute inset-0 bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
                                    {/* Product count badge */}
                                    <div className="absolute top-3 right-3 bg-white bg-opacity-90 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                                        {cat.count} item{cat.count !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {cat.count} product{cat.count !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
