import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck, MapPin, Edit2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { selectCartItems } from '../store/cartSlice';
import { selectCurrentUser, selectIsLoggedIn } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';
import api from '../api/api';

// const shippingSchema = z.object({
//     shippingAddress: z.string().min(5, 'Address is required'),
//     shippingCity:    z.string().min(2, 'City is required'),
//     shippingState:   z.string().min(2, 'State is required'),
//     shippingZip:     z.string().min(4, 'PIN code is required'),
//     shippingPhone:   z.string().min(10, 'Valid phone number is required'),
// });

// export default function CheckoutPage() {
//     const dispatch   = useDispatch();
//     const navigate   = useNavigate();
//     const isLoggedIn = useSelector(selectIsLoggedIn);
//     const user       = useSelector(selectCurrentUser);
//     const items      = useSelector(selectCartItems);
//     const [paying, setPaying]         = useState(false);
//     const [error, setError]           = useState('');
//     const [savedAddress, setSavedAddress] = useState(null);   // from last order
//     const [editingAddress, setEditingAddress] = useState(false); // toggle edit mode

//     // Guard — not logged in
//     useEffect(() => {
//         if (!isLoggedIn) navigate('/login?redirect=/checkout');
//     }, [isLoggedIn, navigate]);

//     // Guard — empty cart
//     useEffect(() => {
//         if (isLoggedIn && items.length === 0) navigate('/cart');
//     }, [items, isLoggedIn, navigate]);

//     const { register, handleSubmit, reset, formState: { errors } } = useForm({
//         resolver: zodResolver(shippingSchema),
//     });

//     // Fetch last used address on mount
//     useEffect(() => {
//         if (!isLoggedIn) return;
//         api.get('/api/orders/last-address')
//             .then(res => {
//                 if (res.address) {
//                     setSavedAddress(res.address);
//                     // Pre-fill the form with the saved address
//                     reset(res.address);
//                 }
//                 // If null — first-time buyer, form stays empty
//             })
//             .catch(() => {
//                 // No previous orders or error — just leave form empty
//             });
//     }, [isLoggedIn, reset]);

//     // Computed totals
//     const subtotal = items.reduce((sum, item) => {
//         const price    = Number(item.product.price) || 0;
//         const discount = Number(item.product.discount) || 0;
//         const final    = price - (price * discount / 100);
//         return sum + final * item.quantity;
//     }, 0);
//     const delivery   = subtotal >= 500 ? 0 : 50;
//     const grandTotal = subtotal + delivery;

//     const onSubmit = async (shippingData) => {
//         setError('');
//         setPaying(true);
//         try {
//             const { orderId, amount, currency, keyId } =
//                 await api.post('/api/orders/razorpay/create-order', {});

//             const options = {
//                 key:         keyId,
//                 amount,
//                 currency,
//                 name:        'M-Mart',
//                 description: 'Order Payment',
//                 order_id:    orderId,
//                 prefill: {
//                     name:    `${user.firstName} ${user.lastName}`,
//                     email:   user.email,
//                     contact: shippingData.shippingPhone,
//                 },
//                 theme: { color: '#2563eb' },
//                 handler: async (response) => {
//                     try {
//                         const result = await api.post('/api/orders/razorpay/verify', {
//                             razorpay_order_id:   response.razorpay_order_id,
//                             razorpay_payment_id: response.razorpay_payment_id,
//                             razorpay_signature:  response.razorpay_signature,
//                             ...shippingData,
//                         });
//                         dispatch(clearCart());
//                         navigate(`/order-success?orderId=${result.order.id}`);
//                     } catch (err) {
//                         setError(err.message || 'Payment verification failed');
//                         setPaying(false);
//                     }
//                 },
//                 modal: { ondismiss: () => setPaying(false) },
//             };

//             const rzp = new window.Razorpay(options);
//             rzp.open();
//         } catch (err) {
//             setError(err.message || 'Failed to initiate payment');
//             setPaying(false);
//         }
//     };

//     // ── Saved address summary card (shown when address exists and not editing)
//     const AddressSummary = () => (
//         <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start justify-between gap-4">
//             <div className="flex gap-3">
//                 <MapPin size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
//                 <div className="text-sm text-gray-700 space-y-0.5">
//                     <p className="font-medium text-gray-900">Delivering to saved address</p>
//                     <p>{savedAddress.shippingAddress}</p>
//                     <p>{savedAddress.shippingCity}, {savedAddress.shippingState} — {savedAddress.shippingZip}</p>
//                     <p className="text-gray-500">📞 {savedAddress.shippingPhone}</p>
//                 </div>
//             </div>
//             <button
//                 type="button"
//                 onClick={() => setEditingAddress(true)}
//                 className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline flex-shrink-0"
//             >
//                 <Edit2 size={13} /> Change
//             </button>
//         </div>
//     );

//     return (
//         <div>
//             <Header />
//             <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//                 <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

//                 {error && (
//                     <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit(onSubmit)}>
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//                         {/* ── Shipping section ───────────────────────── */}
//                         <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-4">
//                             <div className="flex items-center justify-between">
//                                 <h2 className="text-lg font-bold text-gray-900">Shipping Details</h2>
//                                 {savedAddress && !editingAddress && (
//                                     <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
//                                         ✓ Saved from last order
//                                     </span>
//                                 )}
//                             </div>

//                             {/* Show summary card if saved address exists and not editing */}
//                             {savedAddress && !editingAddress ? (
//                                 <AddressSummary />
//                             ) : (
//                                 <>
//                                     {savedAddress && editingAddress && (
//                                         <div className="flex items-center justify-between text-sm">
//                                             <span className="text-gray-500">Edit your delivery address below</span>
//                                             <button
//                                                 type="button"
//                                                 onClick={() => { reset(savedAddress); setEditingAddress(false); }}
//                                                 className="text-blue-600 hover:underline text-xs"
//                                             >
//                                                 ← Restore saved address
//                                             </button>
//                                         </div>
//                                     )}

//                                     <div>
//                                         <label className="block text-sm font-medium mb-1">Full Address</label>
//                                         <textarea {...register('shippingAddress')} rows={3}
//                                             className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                             placeholder="House no, Street, Area" />
//                                         {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>}
//                                     </div>

//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium mb-1">City</label>
//                                             <input {...register('shippingCity')}
//                                                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                 placeholder="Hyderabad" />
//                                             {errors.shippingCity && <p className="text-red-500 text-xs mt-1">{errors.shippingCity.message}</p>}
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium mb-1">State</label>
//                                             <input {...register('shippingState')}
//                                                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                 placeholder="Telangana" />
//                                             {errors.shippingState && <p className="text-red-500 text-xs mt-1">{errors.shippingState.message}</p>}
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium mb-1">PIN Code</label>
//                                             <input {...register('shippingZip')}
//                                                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                 placeholder="500001" />
//                                             {errors.shippingZip && <p className="text-red-500 text-xs mt-1">{errors.shippingZip.message}</p>}
//                                         </div>
//                                         <div>
//                                             <label className="block text-sm font-medium mb-1">Phone</label>
//                                             <input {...register('shippingPhone')}
//                                                 className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                 placeholder="9876543210" />
//                                             {errors.shippingPhone && <p className="text-red-500 text-xs mt-1">{errors.shippingPhone.message}</p>}
//                                         </div>
//                                     </div>
//                                 </>
//                             )}
//                         </div>

//                         {/* ── Order summary ──────────────────────────── */}
//                         <div className="lg:col-span-1">
//                             <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
//                                 <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

//                                 <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
//                                     {items.map(item => {
//                                         const price    = Number(item.product.price) || 0;
//                                         const discount = Number(item.product.discount) || 0;
//                                         const final    = price - (price * discount / 100);
//                                         return (
//                                             <div key={item.id} className="flex items-center gap-3">
//                                                 <img src={item.product.image || 'https://placehold.co/48x48'}
//                                                     alt={item.product.name}
//                                                     className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
//                                                 <div className="flex-1 min-w-0">
//                                                     <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
//                                                     <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
//                                                 </div>
//                                                 <p className="text-sm font-semibold">₹{(final * item.quantity).toFixed(2)}</p>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>

//                                 <hr className="mb-4" />

//                                 <div className="space-y-2 text-sm text-gray-600 mb-6">
//                                     <div className="flex justify-between">
//                                         <span>Subtotal</span>
//                                         <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span>Delivery</span>
//                                         <span className={delivery === 0 ? 'text-green-600 font-medium' : 'font-medium text-gray-900'}>
//                                             {delivery === 0 ? 'FREE' : `₹${delivery}`}
//                                         </span>
//                                     </div>
//                                     <hr />
//                                     <div className="flex justify-between text-base font-bold text-gray-900">
//                                         <span>Total</span>
//                                         <span>₹{grandTotal.toFixed(2)}</span>
//                                     </div>
//                                 </div>

//                                 <button type="submit" disabled={paying}
//                                     className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
//                                     {paying
//                                         ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
//                                         : <><ShieldCheck size={18} /> Pay ₹{grandTotal.toFixed(2)}</>
//                                     }
//                                 </button>

//                                 <p className="text-xs text-center text-gray-400 mt-3">
//                                     Secured by Razorpay
//                                 </p>
//                             </div>
//                         </div>

//                     </div>
//                 </form>
//             </main>
//             <Footer />
//         </div>
//     );
// }

const shippingSchema = z.object({
    shippingAddress: z.string().min(5, 'Address is required'),
    shippingCity:    z.string().min(2, 'City is required'),
    shippingState:   z.string().min(2, 'State is required'),
    shippingZip:     z.string().min(4, 'PIN code is required'),
    shippingPhone:   z.string().min(10, 'Valid phone number is required'),
});

export default function CheckoutPage() {
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const user       = useSelector(selectCurrentUser);
    const items      = useSelector(selectCartItems);
    const [paying, setPaying]   = useState(false);
    const [error, setError]     = useState('');

    // Guard — not logged in
    useEffect(() => {
        if (!isLoggedIn) navigate('/login?redirect=/checkout');
    }, [isLoggedIn, navigate]);

    // Guard — empty cart
    useEffect(() => {
        if (isLoggedIn && items.length === 0) navigate('/cart');
    }, [items, isLoggedIn, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(shippingSchema),
    });

    // Computed totals
    const subtotal = items.reduce((sum, item) => {
        const price    = Number(item.product.price) || 0;
        const discount = Number(item.product.discount) || 0;
        const final    = price - (price * discount / 100);
        return sum + final * item.quantity;
    }, 0);
    const delivery    = subtotal >= 500 ? 0 : 50;
    const grandTotal  = subtotal + delivery;

    const onSubmit = async (shippingData) => {
        setError('');
        setPaying(true);
        try {
            // 1. Create Razorpay order on backend
            const { orderId, amount, currency, keyId } =
                await api.post('/api/orders/razorpay/create-order', {});

            // 2. Open Razorpay checkout popup
            const options = {
                key:         keyId,
                amount,
                currency,
                name:        'M-Mart',
                description: 'Order Payment',
                order_id:    orderId,
                prefill: {
                    name:    `${user.firstName} ${user.lastName}`,
                    email:   user.email,
                    contact: shippingData.shippingPhone,
                },
                theme: { color: '#2563eb' },

                handler: async (response) => {
                    try {
                        // 3. Verify payment and create order in DB
                        const result = await api.post('/api/orders/razorpay/verify', {
                            razorpay_order_id:   response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature:  response.razorpay_signature,
                            ...shippingData,
                        });

                        // 4. Clear Redux cart and go to success page
                        dispatch(clearCart());
                        navigate(`/order-success?orderId=${result.order.id}`);
                    } catch (err) {
                        setError(err.message || 'Payment verification failed');
                        setPaying(false);
                    }
                },

                modal: {
                    ondismiss: () => setPaying(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            setError(err.message || 'Failed to initiate payment');
            setPaying(false);
        }
    };

    return (
        <div>
            <Header />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ── Shipping form ──────────────────────────── */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Shipping Details</h2>

                            <div>
                                <label className="block text-sm font-medium mb-1">Full Address</label>
                                <textarea {...register('shippingAddress')} rows={3}
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="House no, Street, Area" />
                                {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <input {...register('shippingCity')}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Hyderabad" />
                                    {errors.shippingCity && <p className="text-red-500 text-xs mt-1">{errors.shippingCity.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">State</label>
                                    <input {...register('shippingState')}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Telangana" />
                                    {errors.shippingState && <p className="text-red-500 text-xs mt-1">{errors.shippingState.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">PIN Code</label>
                                    <input {...register('shippingZip')}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="500001" />
                                    {errors.shippingZip && <p className="text-red-500 text-xs mt-1">{errors.shippingZip.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input {...register('shippingPhone')}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="9876543210" />
                                    {errors.shippingPhone && <p className="text-red-500 text-xs mt-1">{errors.shippingPhone.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ── Order summary ──────────────────────────── */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                                {/* Items list */}
                                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                    {items.map(item => {
                                        const price    = Number(item.product.price) || 0;
                                        const discount = Number(item.product.discount) || 0;
                                        const final    = price - (price * discount / 100);
                                        return (
                                            <div key={item.id} className="flex items-center gap-3">
                                                <img src={item.product.image || 'https://placehold.co/48x48'}
                                                    alt={item.product.name}
                                                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-semibold">₹{(final * item.quantity).toFixed(2)}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <hr className="mb-4" />

                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery</span>
                                        <span className={delivery === 0 ? 'text-green-600 font-medium' : 'font-medium text-gray-900'}>
                                            {delivery === 0 ? 'FREE' : `₹${delivery}`}
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-base font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button type="submit" disabled={paying}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                                    {paying
                                        ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                        : <><ShieldCheck size={18} /> Pay ₹{grandTotal.toFixed(2)}</>
                                    }
                                </button>

                                <p className="text-xs text-center text-gray-400 mt-3">
                                    Secured by Razorpay
                                </p>
                            </div>
                        </div>

                    </div>
                </form>
            </main>
            <Footer />
        </div>
    );
}
