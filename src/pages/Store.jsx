import { useState, useEffect } from 'react';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import {useLocation, useNavigate} from 'react-router-dom';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import crockeryBrands from '../assets/images/crockery-brands.jpg';
import detergentBrands from '../assets/images/detergent-brands.jpg';
import diaperBrands from '../assets/images/diapper-brands.jpg';
import halfpriceStore from '../assets/images/halfprice-store.jpg';
import riceBrands from '../assets/images/Rice-brands.jpg';
import api from '../api/api';
import ProductCard from '../components/ui/ProductCard';

export default function Store() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchQuery    = new URLSearchParams(location.search).get('search')  || '';
    const categoryFromUrl = new URLSearchParams(location.search).get('category') || '';

    const [products, setProducts] = useState([]);
    const [allByCategory, setAllByCategory] = useState({})
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);

    // Sync selectedCategory when URL ?category= changes (e.g. navigating from Categories page)
    useEffect(() => {
        setSelectedCategory(categoryFromUrl);
        setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFromUrl]);

    // Fetch all categories once on mount — never overwrite when filtering
    useEffect(() => {
    api.get('/api/products', { params: { limit: 100 } })
        .then(res => {
            const allProducts = res.products || [];

            // Normalize category names — Title Case
            const normalize = (str) =>
                str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;

            // Extract unique normalized categories
            const derived = Array.from(
                new Set(allProducts.map(p => normalize(p.category)).filter(Boolean))
            );
            setCategories(derived);

            // Build grouped map with normalized keys
            const grouped = {};
            derived.forEach(cat => {
                grouped[cat] = allProducts.filter(
                    p => normalize(p.category) === cat
                );
            });
            setAllByCategory(grouped);
        })
        .catch(() => {});
}, []);
    const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
        const params = { page, limit };
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;

        const res = await api.get('/api/products', { params });
        setProducts(res.products || []);
        setTotalPages(res.pagination?.pages || 1);
    } catch (err) {
        setError(err.message || 'Failed to load products');
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedCategory, searchQuery, page, limit]);

const isSearching = searchQuery.length > 0;
const isCategoryFiltered = selectedCategory.length > 0;

    return (
        <div>
            <Header />

            {/* Swiper banner */}
            <div className="max-w-full mx-auto p-0">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={3}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000 }}
                    loop={true}
                    breakpoints={{
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 1 },
                        1024: { slidesPerView: 1 },
                    }}
                >
                    <SwiperSlide><img src={crockeryBrands} alt="Crockery Brands" className="w-full h-auto" /></SwiperSlide>
                    <SwiperSlide><img src={detergentBrands} alt="Detergent Brands" className="w-full h-auto" /></SwiperSlide>
                    <SwiperSlide><img src={diaperBrands} alt="Diaper Brands" className="w-full h-auto" /></SwiperSlide>
                    <SwiperSlide><img src={halfpriceStore} alt="Half Price Store" className="w-full h-auto" /></SwiperSlide>
                    <SwiperSlide><img src={riceBrands} alt="Rice Brands" className="w-full h-auto" /></SwiperSlide>
                </Swiper>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">   
                <div className="row-wrap">

                    {/* ── Sidebar categories ───────────────────────────── */}
                    <div className="grid-20">
                        <div className="flex flex-col gap-2 mr-4 sticky top-24">
                            <button
                                onClick={() => { setSelectedCategory(''); setPage(1); }}
                                className={`px-3 py-1 rounded text-left ${selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setSelectedCategory(cat); setPage(1); }}
                                    className={`px-3 py-1 rounded text-left ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Main content ─────────────────────────────────── */}
                    <div className="grid-80">
                        {loading && <div className="py-8 text-center text-gray-500">Loading products...</div>}
                        {error && <div className="text-red-500 py-4">{error}</div>}

                        {/* ── MODE A: Search active ───────────────────── */}
                        {isSearching && !loading && (
                            <>
                                {/* Search results header */}
                                <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        Results for{' '}
                                        <span className="font-semibold text-blue-700">"{searchQuery}"</span>
                                        {' '}— {products.length} product{products.length !== 1 ? 's' : ''} found
                                    </p>
                                    <button
                                        onClick={() => { navigate('/store'); setPage(1); }}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Clear search ✕
                                    </button>
                                </div>

                                {/* Search result products */}
                                {products.length > 0 ? (
                                    <div className="flex flex-wrap gap-4 mb-10">
                                        {products.map(p => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500 mb-10">
                                        No products found for "{searchQuery}"
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t pt-8 mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 mb-1">Browse Other Categories</h2>
                                    <p className="text-sm text-gray-500">You might also like these</p>
                                </div>

                                {/* All other categories grouped */}
                                {categories.map(cat => {
                                    const catProducts = allByCategory[cat] || [];
                                    if (catProducts.length === 0) return null;
                                    return (
                                        <div key={cat} className="mb-10">
                                            <div className="flex items-center justify-between sm:justify-end mb-4">
                                                <h3 className="text-lg font-semibold text-gray-800">{cat}</h3>
                                                <button
                                                    onClick={() => { setSelectedCategory(cat); navigate('/store'); }}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    View all →
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                {catProducts.slice(0, 4).map(p => (
                                                    <ProductCard key={p.id} product={p} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}

                        {/* ── MODE B: Category selected ───────────────── */}
                        {isCategoryFiltered && !isSearching && !loading && (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">{selectedCategory}</h2>
                                    <span className="text-sm text-gray-500">{products.length} products</span>
                                </div>
                                {products.length > 0 ? (
                                    <div className="flex flex-wrap gap-4">
                                        {products.map(p => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        No products in this category
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── MODE C: No filter — grouped by category ─── */}
                        {!isCategoryFiltered && !isSearching && !loading && (
                            <>
                                {categories.map(cat => {
                                    const catProducts = allByCategory[cat] || [];
                                    if (catProducts.length === 0) return null;
                                    return (
                                        <div key={cat} className="mb-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-800">{cat}</h3>
                                                <button
                                                    onClick={() => { setSelectedCategory(cat); setPage(1); }}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    View all →
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                {catProducts.slice(0, 4).map(p => (
                                                    <ProductCard key={p.id} product={p} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
