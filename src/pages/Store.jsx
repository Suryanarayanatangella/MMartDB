import { useState, useEffect } from 'react';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import SmartSearchBar from '../components/ui/SmartSearchBar';

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
    const searchParams = new URLSearchParams(location.search);
    const searchQuery     = searchParams.get('search')   || '';
    const aiQuery         = searchParams.get('aiQuery')   || '';
    const categoryFromUrl = searchParams.get('category') || '';

    // ── State ────────────────────────────────────────────────────────────────
    const [products, setProducts]           = useState([]);
    const [allByCategory, setAllByCategory] = useState({});
    const [categories, setCategories]       = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);
    const [page, setPage]       = useState(1);
    const [limit]               = useState(12);

    // AI search results — when set, overrides the normal product grid
    const [aiResults, setAiResults] = useState(null); // { products, intent, filters, total }

    // ── Sync category from URL ───────────────────────────────────────────────
    useEffect(() => {
        setSelectedCategory(categoryFromUrl);
        setPage(1);
        setAiResults(null); // clear AI results when navigating
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFromUrl]);

    // ── Fetch AI results when aiQuery is present ───────────────────────────────
    useEffect(() => {
        if (!aiQuery) {
            setAiResults(null);
            return;
        }

        const fetchAIResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.post('/api/search/ai', { query: aiQuery });
                setAiResults(res);
                setSelectedCategory('');
                setPage(1);
            } catch (err) {
                setError(err.message || 'AI search failed');
                setAiResults(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAIResults();
    }, [aiQuery]);

    // ── Fetch all categories once on mount ───────────────────────────────────
    useEffect(() => {
        api.get('/api/products', { params: { limit: 100 } })
            .then(res => {
                const allProducts = res.products || [];

                const normalize = (str) =>
                    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;

                const derived = Array.from(
                    new Set(allProducts.map(p => normalize(p.category)).filter(Boolean))
                );
                setCategories(derived);

                const grouped = {};
                derived.forEach(cat => {
                    grouped[cat] = allProducts.filter(p => normalize(p.category) === cat);
                });
                setAllByCategory(grouped);
            })
            .catch(() => {});
    }, []);

    // ── Fetch filtered products ──────────────────────────────────────────────
    const fetchProducts = async () => {
        if (aiQuery) {
            setProducts([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const params = { page, limit };
            if (selectedCategory) params.category = selectedCategory;
            if (searchQuery)       params.search   = searchQuery;

            const res = await api.get('/api/products', { params });
            setProducts(res.products || []);
        } catch (err) {
            setError(err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, searchQuery, page, limit, aiQuery]);

    // ── AI search handlers ───────────────────────────────────────────────────
    const handleAIResults = (res) => {
        setAiResults(res);
        setSelectedCategory('');
        setPage(1);
    };

    const clearAISearch = () => {
        setAiResults(null);
    };

    // ── Derived flags ────────────────────────────────────────────────────────
    const isSearching        = searchQuery.length > 0;
    const isCategoryFiltered = selectedCategory.length > 0;
    const isAIMode           = !!aiResults;

    return (
        <div>
            <Header />

            {/* ── Swiper banner ──────────────────────────────────────────── */}
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
                        640:  { slidesPerView: 1 },
                        768:  { slidesPerView: 1 },
                        1024: { slidesPerView: 1 },
                    }}
                >
                    <SwiperSlide><img src={crockeryBrands}   alt="Crockery Brands"   className="w-full h-auto" /></SwiperSlide>
                    <SwiperSlide><img src={detergentBrands}  alt="Detergent Brands"  className="w-full h-auto" /></SwiperSlide>
                    <SwiperSlide><img src={diaperBrands}     alt="Diaper Brands"     className="w-full h-auto" /></SwiperSlide>
                    <SwiperSlide><img src={halfpriceStore}   alt="Half Price Store"  className="w-full h-auto" /></SwiperSlide>
                    <SwiperSlide><img src={riceBrands}       alt="Rice Brands"       className="w-full h-auto" /></SwiperSlide>
                </Swiper>
            </div>

            {/* ── AI Smart Search bar ─────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 mt-6 mb-2">
                <SmartSearchBar onResults={handleAIResults} className="w-full" />
                <p className="text-xs text-gray-400 text-center mt-2">
                    💡 Try: "healthy snacks under ₹200" · "warm clothing" · "cheap beverages"
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">

                {/* ── MODE AI: Smart search results ───────────────────────── */}
                {isAIMode && (
                    <div className="mb-8">
                        {/* Intent banner */}
                        <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-purple-900">{aiResults.intent}</p>
                                    <p className="text-xs text-purple-600 mt-0.5">
                                        {aiResults.total} product{aiResults.total !== 1 ? 's' : ''} found
                                        {aiResults.filters?.category  && ` in ${aiResults.filters.category}`}
                                        {aiResults.filters?.maxPrice  && ` under ₹${aiResults.filters.maxPrice}`}
                                        {aiResults.filters?.minPrice  && ` above ₹${aiResults.filters.minPrice}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={clearAISearch}
                                className="flex items-center gap-1 text-xs text-purple-600 hover:underline flex-shrink-0"
                            >
                                <X size={12} /> Clear
                            </button>
                        </div>

                        {/* AI result products */}
                        {aiResults.products.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Sparkles size={40} className="mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No products matched your search.</p>
                                <p className="text-sm mt-1">Try different words like "snacks", "tea", or "shirt".</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                {aiResults.products.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Normal modes (hidden when AI mode is active) ─────────── */}
                {!isAIMode && (
                    <div className="row-wrap">

                        {/* Sidebar categories */}
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

                        {/* Main content */}
                        <div className="grid-80">
                            {loading && <div className="py-8 text-center text-gray-500">Loading products...</div>}
                            {error   && <div className="text-red-500 py-4">{error}</div>}

                            {/* MODE A: Regular keyword search */}
                            {isSearching && !loading && (
                                <>
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

                                    {products.length > 0 ? (
                                        <div className="flex flex-wrap gap-4 mb-10">
                                            {products.map(p => <ProductCard key={p.id} product={p} />)}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-gray-500 mb-10">
                                            No products found for "{searchQuery}"
                                        </div>
                                    )}

                                    <div className="border-t pt-8 mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1">Browse Other Categories</h2>
                                        <p className="text-sm text-gray-500">You might also like these</p>
                                    </div>

                                    {categories.map(cat => {
                                        const catProducts = allByCategory[cat] || [];
                                        if (catProducts.length === 0) return null;
                                        return (
                                            <div key={cat} className="mb-10">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-800">{cat}</h3>
                                                    <button
                                                        onClick={() => { setSelectedCategory(cat); navigate('/store'); }}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        View all →
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-4">
                                                    {catProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {/* MODE B: Category selected */}
                            {isCategoryFiltered && !isSearching && !loading && (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-gray-800">{selectedCategory}</h2>
                                        <span className="text-sm text-gray-500">{products.length} products</span>
                                    </div>
                                    {products.length > 0 ? (
                                        <div className="flex flex-wrap gap-4">
                                            {products.map(p => <ProductCard key={p.id} product={p} />)}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-gray-500">
                                            No products in this category
                                        </div>
                                    )}
                                </>
                            )}

                            {/* MODE C: No filter — grouped by category */}
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
                                                    {catProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
