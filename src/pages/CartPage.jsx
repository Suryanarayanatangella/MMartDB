import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import CartAISuggestions from "../pages/CartAISuggestions";
import api from "../api/api";
import { selectCurrentUser } from "../store/authSlice";
import { 
    fetchCart,
    removeFromCart, 
    updateCartItem, 
    clearCartApi,
    selectCartItems,
    selectCartTotal,
    selectCartLoading,
    selectCartError
 } from "../store/cartSlice";
 import { selectIsLoggedIn } from "../store/authSlice";

 export default function CartPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector(selectCurrentUser);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const items       = useSelector(selectCartItems);
    const total = useSelector(selectCartTotal);
    const loading = useSelector(selectCartLoading);
    const error = useSelector(selectCartError);

    //Ai component, and state
    const [aiSuggestions, setAiSuggestions] = useState(null)
    const [aiLoading, setAiLoading] = useState(false);

    //  redirect if not logged in
    useEffect(()=>{
        if(!isLoggedIn) {
            navigate('/login');
            return;
        } 
        dispatch(fetchCart());
    }, [isLoggedIn, dispatch, navigate]);

    // Trigger when cart loads:
    useEffect(() => {
        if (isLoggedIn && items.length > 0) fetchAISuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length]);

    //increase quantity by 1
    const handleIncrease = (item) => {
        dispatch(updateCartItem({
                itemId: item.id, quantity: item.quantity + 1
            }))
    }
    // Decrease quantity — remove if it would go to 0
    const handleDecrease = (item) => {
        if(item.quantity <= 1) {
            dispatch(removeFromCart(item.id));
        } else {
            dispatch(updateCartItem({ itemId: item.id, quantity: item.quantity - 1}))
        }
    }
    const handleRemove = (itemId) => {
        dispatch(removeFromCart(itemId))
    }

    const computedTotal = items.reduce((sum, item) => {
        const price = Number(item.product.price) || 0;
        const discount = Number(item.product.discount) || 0;
        const final = price - (price * discount / 100)
        return sum + final * item.quantity;
    }, 0)

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    
    const handleClearCart = () => {
        if (window.confirm('Remove all items from cart?')) {
            dispatch(clearCartApi());
        }
    };

    const fetchAISuggestions = async () => {
        if (items.length === 0) return;
            setAiLoading(true);
            try {
                const res = await api.post('/api/cart-ai/suggestions', {
                    cartItems: items.map(i => ({ productId: i.productId || i.product?.id }))
                });
                setAiSuggestions(res);
            } catch {
                // silently fail — suggestions are optional
            } finally {
                setAiLoading(false);
        }
    }

    const handleCheckout = () => {
        if(!isLoggedIn) {
            navigate('/login?redirect=/checkout');
            return;
        }
        navigate('/checkout')
    }
    
        const handleAddSuggestion = (item) => {
            dispatch(updateCartItem({ 
                itemId: item.productId, 
                quantity: item.quantity || 1,
                isNew: true
            }));
        };
    // Empty state
    if (!loading && items.length === 0) {
        return (
            <div>
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-24 text-center">
                    <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
                    <button
                        onClick={() => navigate('/store')}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
                    >
                        Continue Shopping
                    </button>
                </main>
                <Footer />
            </div>
        );
    }


    return (
        <div>
            <Header />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Page title */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Shopping Cart
                        <span className="ml-3 text-lg font-normal text-gray-500">
                            ({totalItems} item{totalItems !== 1 ? 's' : ''})
                        </span>
                    </h1>
                    <button
                        onClick={() => navigate('/store')}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                        <ArrowLeft size={16} /> Continue Shopping
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading cart...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ── Cart items list ─────────────────────────── */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => {
                                const price    = Number(item.product.price) || 0;
                                const discount = Number(item.product.discount) || 0;
                                const final    = price - (price * discount / 100);

                                return (
                                    <div key={item.id}
                                        className="flex gap-4 bg-white rounded-xl shadow-sm p-4 items-center">

                                        {/* Product image */}
                                        <img
                                            src={item.product.image || 'https://placehold.co/100x100?text=No+Image'}
                                            alt={item.product.name}
                                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                            onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                        />

                                        {/* Product info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-blue-600 font-medium uppercase mb-1">
                                                {item.product.category}
                                            </p>
                                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                                                {item.product.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-bold text-gray-900">
                                                    ₹{final.toFixed(2)}
                                                </span>
                                                {discount > 0 && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ₹{price.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity controls */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDecrease(item)}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-semibold text-gray-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleIncrease(item)}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Line total */}
                                        <div className="text-right min-w-[80px]">
                                            <p className="font-bold text-gray-900">
                                                ₹{(final * item.quantity).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Remove button */}
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            })}

                            {/* Clear cart */}
                            <div className="text-right">
                                <button
                                    onClick={handleClearCart}
                                    className="text-sm text-red-500 hover:underline"
                                >
                                    Clear entire cart
                                </button>
                            </div>

                            {/* AI Cart Suggestions — shown below the cart */}
                            <CartAISuggestions
                                suggestions={aiSuggestions}
                                loading={aiLoading}
                                onRefresh={fetchAISuggestions}
                            />
                        </div>

                        {/* ── Order summary ───────────────────────────── */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                                <div className="space-y-3 text-sm text-gray-600 mb-4">
                                    <div className="flex justify-between">
                                        <span>Subtotal ({totalItems} items)</span>
                                        <span className="font-medium text-gray-900">₹{computedTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery</span>
                                        <span className="text-green-600 font-medium">
                                            {computedTotal >= 500 ? 'FREE' : '₹50.00'}
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-base font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>
                                            ₹{(computedTotal + (computedTotal >= 500 ? 0 : 50)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {computedTotal < 500 && (
                                    <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-3 mb-4">
                                        Add ₹{(500 - computedTotal).toFixed(2)} more for free delivery!
                                    </p>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={() => navigate('/store')}
                                    className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                        

                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
    