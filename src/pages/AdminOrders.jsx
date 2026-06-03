import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronDown, ChevronUp, Package, RefreshCw } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { selectCurrentUser } from '../store/authSlice';
import api from '../api/api';
import BillModal from '../modals/BillModal';

const STATUS_COLORS = {
    PENDING:    'bg-yellow-100 text-yellow-800',
    CONFIRMED:  'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED:    'bg-indigo-100 text-indigo-800',
    DELIVERED:  'bg-green-100 text-green-800',
    CANCELLED:  'bg-red-100 text-red-800',
    RETURNED:   'bg-gray-100 text-gray-800',
};

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

export default function AdminOrders() {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const [billOrders, setBillOrders] = useState(null);

    // Guard
    if (user && user.role !== 'ADMIN') {
        return (
            <div>
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
                    <p className="text-gray-600">You must be an admin to view this page.</p>
                </main>
                <Footer />
            </div>
        );
    }

    const fetchOrders = async (status = '') => {
        setLoading(true);
        setError('');
        try {
            const params = { limit: 50 };
            if (status) params.status = status;
            const res = await api.get('/api/orders/admin/all', { params });
            setOrders(res.orders || []);
        } catch (err) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
            // Update locally without refetch
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
        } catch (err) {
            alert(err.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    // Summary counts
    const counts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Page header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                        <p className="text-gray-500 mt-1">{orders.length} orders {filterStatus ? `with status: ${filterStatus}` : 'total'}</p>
                    </div>
                    <button
                        onClick={() => fetchOrders(filterStatus)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                {/* Status summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                    {ALL_STATUSES.map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                            className={`p-3 rounded-xl text-center border-2 transition-all ${
                                filterStatus === s
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-transparent bg-white'
                            }`}
                        >
                            <p className="text-xl font-bold text-gray-900">{counts[s] || 0}</p>
                            <p className={`text-xs font-medium mt-1 px-1.5 py-0.5 rounded-full ${STATUS_COLORS[s]}`}>
                                {s}
                            </p>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Package size={48} className="mx-auto mb-4 opacity-40" />
                        <p>No orders found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">

                                {/* Order header row */}
                                <div
                                    className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                    {/* Order number + date */}
                                    <div className="min-w-[160px]">
                                        <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    {/* Customer */}
                                    <div className="flex-1 min-w-[160px]">
                                        <p className="text-sm font-medium text-gray-900">
                                            {order.user.firstName} {order.user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{order.user.email}</p>
                                    </div>

                                    {/* Items count */}
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-900">{order.items.length}</p>
                                        <p className="text-xs text-gray-500">items</p>
                                    </div>

                                    {/* Total */}
                                    <div className="text-right min-w-[80px]">
                                        <p className="text-sm font-bold text-gray-900">₹{Number(order.finalAmount).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">total</p>
                                    </div>

                                    {/* Status badge + selector */}
                                    <div onClick={e => e.stopPropagation()}>
                                        <select
                                            value={order.status}
                                            disabled={updatingId === order.id}
                                            onChange={e => handleStatusUpdate(order.id, e.target.value)}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[order.status]}`}
                                        >
                                            {ALL_STATUSES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Expand toggle */}
                                    <div className="text-gray-400">
                                        {expandedOrder === order.id
                                            ? <ChevronUp size={18} />
                                            : <ChevronDown size={18} />
                                        }
                                    </div>
                                    {/* View Bill button */}
                                    <div onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => setBillOrders(order)}
                                            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors"
                                        >
                                            🧾 View Bill
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                {expandedOrder === order.id && (
                                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Items list */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h4>
                                                <div className="space-y-2">
                                                    {order.items.map(item => (
                                                        <div key={item.id} className="flex items-center gap-3">
                                                            <img
                                                                src={item.product?.image || 'https://placehold.co/48x48'}
                                                                alt={item.product?.name}
                                                                className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                                                                onError={e => { e.target.src = 'https://placehold.co/48x48'; }}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                                    {item.product?.name || 'Deleted product'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                ₹{(Number(item.price) * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Totals */}
                                                <div className="mt-4 pt-3 border-t border-gray-200 space-y-1 text-sm">
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
                                                    <div className="flex justify-between font-bold text-gray-900">
                                                        <span>Total Paid</span>
                                                        <span>₹{Number(order.finalAmount).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shipping address */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Shipping Details</h4>
                                                <div className="bg-white rounded-lg p-4 text-sm text-gray-700 space-y-1 border border-gray-100">
                                                    <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                                                    <p>{order.shippingAddress}</p>
                                                    <p>{order.shippingCity}, {order.shippingState} — {order.shippingZip}</p>
                                                    <p className="text-gray-500">📞 {order.shippingPhone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
            <BillModal order={billOrders} onClose={() => setBillOrders(null)} />
        </div>
    );
}