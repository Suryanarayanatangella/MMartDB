import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function OrderSuccessPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const orderId  = params.get('orderId');

    return (
        <div>
            <Header />
            <main className="max-w-lg mx-auto px-4 py-24 text-center">
                <CheckCircle size={72} className="mx-auto text-green-500 mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
                <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
                {orderId && (
                    <p className="text-sm text-gray-500 mb-8">
                        Order ID: <span className="font-mono font-semibold text-gray-700">{orderId}</span>
                    </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => navigate('/store')}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700">
                        Continue Shopping
                    </button>
                    <button onClick={() => navigate('/orders')}
                        className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50">
                        View Orders
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}