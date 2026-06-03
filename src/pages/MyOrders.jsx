import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { selectIsLoggedIn } from '../store/authSlice';
import api from '../api/api';

// Status config — color + icon label for each stage
const STATUS_CONFIG = {
    PENDING:    { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400', label: 'Order Pending',    desc: 'Your order has been received.' },
    CONFIRMED:  { color: 'bg-blue-100 text-blue-800 border-blue-200',       dot: 'bg-blue-400',   label: 'Confirmed',        desc: 'Your order has been confirmed.' },
    PROCESSING: { color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-400', label: 'Processing',       desc: 'Your order is being prepared.' },
    SHIPPED:    { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', dot: 'bg-indigo-400', label: 'Shipped',          desc: 'Your order is on the way.' },
    DELIVERED:  { color: 'bg-green-100 text-green-800 border-green-200',    dot: 'bg-green-500',  label: 'Delivered',        desc: 'Your order has been delivered.' },
    CANCELLED:  { color: 'bg-red-100 text-red-800 border-red-200',          dot: 'bg-red-400',    label: 'Cancelled',        desc: 'Your order was cancelled.' },
    RETURNED:   { color: 'bg-gray-100 text-gray-700 border-gray-200',       dot: 'bg-gray-400',   label: 'Returned',         desc: 'Your order has been returned.' },
};

// Visual progress bar steps (only for active orders)
const PROGRESS_STEPS = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function StatusProgress({ status }) {
    if (['CANCELLED', 'RETURNED', 'PENDING'].includes(status)) return null;

    const current = PROGRESS_STEPS.indexOf(status);

    return (
        <div className="flex items-center gap-1 mt-3">
            {PROGRESS_STEPS.map((step, idx) => {
                const done    = idx <= current;
                const active  = idx === current;
                return (
                    <div key={step} className="flex items-center flex-1">
                        <div className={`flex flex-col items-center flex-1`}>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors
                                ${done
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-400'
                                } ${active ? 'ring-2 ring-blue-300' : ''}`}
                            >
                                {done ? '✓' : idx + 1}
                            </div>
                            <span className={`text-xs mt-1 text-center leading-tight ${done ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                                {step.charAt(0) + step.slice(1).toLowerCase()}
                            </span>
                        </div>
                        {idx < PROGRESS_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 mb-4 rounded ${idx < current ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function MyOrders() {
    const navigate    = useNavigate();
    const isLoggedIn  = useSelector(selectIsLoggedIn);

    const [orders, setOrders]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login?redirect=/orders');
            return;
        }
        api.get('/api/orders')
            .then(res => setOrders(res.orders || []))
            .catch(err => setError(err.message || 'Failed to load orders'))
            .finally(() => setLoading(false));
    }, [isLoggedIn, navigate]);

    if (loading) {
        return (
            <div>
                <Header />
                <main className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
                    Loading your orders...
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-500 mb-8">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && orders.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <ShoppingBag size={56} className="mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium text-gray-600 mb-2">No orders yet</p>
                        <p className="text-sm mb-6">You haven't placed any orders. Start shopping!</p>
                        <button
                            onClick={() => navigate('/store')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
                        >
                            Browse Store
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {orders.map(order => {
                        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                        const isOpen = expanded === order.id;

                        return (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">

                                {/* ── Order header ─────────────────────── */}
                                <div
                                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpanded(isOpen ? null : order.id)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: order meta */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                                                {/* Status badge */}
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'long', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                            </p>

                                            {/* Status description */}
                                            <p className="text-xs text-gray-600 mt-2 italic">{cfg.desc}</p>

                                            {/* Progress bar */}
                                            <StatusProgress status={order.status} />
                                        </div>

                                        {/* Right: total + toggle */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-gray-900">₹{Number(order.finalAmount).toFixed(2)}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Total paid</p>
                                            <div className="mt-3 text-gray-400">
                                                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Expanded details ─────────────────── */}
                                {isOpen && (
                                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-4">

                                        {/* Items */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</h4>
                                            <div className="space-y-3">
                                                {order.items?.map(item => {
                                                    const price    = Number(item.price) || 0;
                                                    return (
                                                        <div key={item.id} className="flex items-center gap-3">
                                                            <img
                                                                src={item.product?.image || 'https://placehold.co/56x56'}
                                                                alt={item.product?.name}
                                                                className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                                                                onError={e => { e.target.src = 'https://placehold.co/56x56'; }}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                                    {item.product?.name || 'Product'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                ₹{(price * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Price breakdown */}
                                        <div className="border-t border-gray-200 pt-3 space-y-1.5 text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Subtotal</span>
                                                <span>₹{Number(order.totalAmount).toFixed(2)}</span>
                                            </div>
                                            {Number(order.discount) > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount</span>
                                                    <span>-₹{Number(order.discount).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1.5">
                                                <span>Total Paid</span>
                                                <span>₹{Number(order.finalAmount).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Delivery address */}
                                        <div className="border-t border-gray-200 pt-3">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</h4>
                                            <div className="text-sm text-gray-700 space-y-0.5">
                                                <p>{order.shippingAddress}</p>
                                                <p>{order.shippingCity}, {order.shippingState} — {order.shippingZip}</p>
                                                <p className="text-gray-500">📞 {order.shippingPhone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
            <Footer />
        </div>
    );
}
