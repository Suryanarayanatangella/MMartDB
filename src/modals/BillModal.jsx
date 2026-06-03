export default function BillModal({order, onClose}) {
    const handlePrint = () => {
        window.print();
    }
    if(!order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            {/* Modal box */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Modal header — not printed */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 print:hidden">
                    <h2 className="text-lg font-bold text-gray-900">Order Bill</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                            🖨️ Print
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* ── Bill content (this part prints) ── */}
                <div id="bill-content" className="px-8 py-6">

                    {/* Store header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-blue-700">M-Mart</h1>
                        <p className="text-sm text-gray-500">123 Market Street, Hyderabad</p>
                        <p className="text-sm text-gray-500">support@mmart.com  |  +91 98765 43210</p>
                        <div className="mt-3 border-t-2 border-b-2 border-gray-300 py-1">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">Tax Invoice / Bill</p>
                        </div>
                    </div>

                    {/* Order meta + Customer info */}
                    <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">Bill To:</p>
                            <p className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</p>
                            <p className="text-gray-600">{order.user.email}</p>
                            <p className="text-gray-600">{order.shippingAddress}</p>
                            <p className="text-gray-600">{order.shippingCity}, {order.shippingState} — {order.shippingZip}</p>
                            <p className="text-gray-600">📞 {order.shippingPhone}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-700 mb-1">Invoice Details:</p>
                            <p className="text-gray-600">Order: <span className="font-medium text-gray-900">{order.orderNumber}</span></p>
                            <p className="text-gray-600">Date: <span className="font-medium text-gray-900">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })}
                            </span></p>
                            <p className="text-gray-600">Status:
                                <span className={`ml-1 font-semibold ${
                                    order.status === 'DELIVERED' ? 'text-green-600' :
                                    order.status === 'CANCELLED' ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                    {order.status}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Items table */}
                    <table className="w-full text-sm mb-6">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left px-3 py-2 rounded-tl-lg">#</th>
                                <th className="text-left px-3 py-2">Product</th>
                                <th className="text-center px-3 py-2">Qty</th>
                                <th className="text-right px-3 py-2">Unit Price</th>
                                <th className="text-right px-3 py-2 rounded-tr-lg">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={item.id} className="border-b border-gray-100">
                                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                                    <td className="px-3 py-2 text-gray-900 font-medium">
                                        {item.product?.name || 'Product'}
                                    </td>
                                    <td className="px-3 py-2 text-center text-gray-700">{item.quantity}</td>
                                    <td className="px-3 py-2 text-right text-gray-700">₹{Number(item.price).toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right font-medium text-gray-900">
                                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-6">
                        <div className="w-64 space-y-2 text-sm">
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
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className={Number(order.finalAmount) - (Number(order.totalAmount) - Number(order.discount)) === 0 ? 'text-green-600' : ''}>
                                    {Number(order.finalAmount) === (Number(order.totalAmount) - Number(order.discount))
                                        ? 'FREE' : '₹50.00'}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-300 pt-2">
                                <span>Total Paid</span>
                                <span>₹{Number(order.finalAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
                        <p>Thank you for shopping with M-Mart!</p>
                        <p>This is a computer-generated bill. No signature required.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}