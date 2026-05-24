import axiosInstance from '../contexts/axiosInstance';

export const createPaymentIntent = async (agreement_id, amount, payment_method) => {
    try {
        const response = await axiosInstance.post('/payments/create-intent', {
            agreement_id,
            amount,
            payment_method
        });
        return response.data;
    } catch (error) {
        console.error("Error creating payment intent:", error);
        return null;
    }
};

export const confirmPayment = async (payment_id, payment_intent_id = null, paypal_order_id = null) => {
    try {
        const response = await axiosInstance.post('/payments/confirm', {
            payment_id,
            payment_intent_id,
            paypal_order_id
        });
        return response.data;
    } catch (error) {
        console.error("Error confirming payment:", error);
        return null;
    }
};

export const registerManualPayment = async (data) => {
    try {
        const response = await axiosInstance.post('/payments/manual', {
            agreement_id: data.agreement_id,
            amount: data.amount,
            payment_method: data.payment_method || 'cash',
            paid_at: data.paid_at || new Date().toISOString()
        });
        return response.data;
    } catch (error) {
        console.error("Error registering manual payment:", error.response?.data || error.message);
        return null;
    }
};

export const getPaymentHistory = async () => {
    try {
        const response = await axiosInstance.get('/payments/history');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("Error fetching payment history:", error);
        return [];
    }
};

export const getPaymentStats = async () => {
    try {
        const response = await axiosInstance.get('/payments/stats');
        return response.data;
    } catch (error) {
        console.error("Error fetching payment stats:", error);
        return null;
    }
};

export const getReceiptUrl = (payment_id) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = storedUser.token || localStorage.getItem('token');
    return `${API_URL}/payments/receipt/${payment_id}?token=${token}`;
};

export const downloadReceipt = (payment_id) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000';
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = storedUser.token || localStorage.getItem('token');

    const link = document.createElement('a');
    link.href = `${API_URL}/payments/receipt/${payment_id}`;
    link.setAttribute('download', `recibo_pago_${payment_id}.pdf`);
    link.style.display = 'none';

    fetch(`${API_URL}/payments/receipt/${payment_id}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Error downloading receipt');
        return res.blob();
    })
    .then(blob => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    })
    .catch(err => console.error("Error downloading receipt:", err));
};

export const createPayPalOrder = async (agreement_id, amount) => {
    try {
        const response = await axiosInstance.post('/payments/create-paypal-order', { agreement_id, amount });
        return response.data;
    } catch (error) {
        console.error("Error creating PayPal order:", error);
        return null;
    }
};

export const capturePayPalOrder = async (payment_id, order_id) => {
    try {
        const response = await axiosInstance.post('/payments/capture-paypal-order', { payment_id, order_id });
        return response.data;
    } catch (error) {
        console.error("Error capturing PayPal order:", error);
        return null;
    }
};
