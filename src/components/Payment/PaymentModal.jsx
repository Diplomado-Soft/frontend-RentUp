import React, { useState, useContext, useRef } from "react";
import { UserContext } from "../../contexts/UserContext";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { createPaymentIntent, confirmPayment, downloadReceipt, createPayPalOrder, capturePayPalOrder } from "../../apis/paymentController";

const STRIPE_PK = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const HAS_STRIPE = Boolean(STRIPE_PK);
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const HAS_PAYPAL = Boolean(PAYPAL_CLIENT_ID);

function PayPalOrderButton({ agreement_id, amount, onSuccess, onError }) {
  const paymentIdRef = useRef(null);

  return (
    <PayPalButtons
      createOrder={async () => {
        const result = await createPayPalOrder(agreement_id, amount);
        if (!result || !result.orderID) throw new Error("Error creating PayPal order");
        paymentIdRef.current = result.payment_id;
        return result.orderID;
      }}
      onApprove={async (data) => {
        const pid = paymentIdRef.current;
        if (!pid) { onError("Error: no se encontró el pago"); return; }
        const result = await capturePayPalOrder(pid, data.orderID);
        if (result) {
          onSuccess(result);
        } else {
          onError("Error al confirmar el pago PayPal");
        }
      }}
      onError={(err) => {
        console.error("PayPal error:", err);
        onError("Error en el pago con PayPal");
      }}
    />
  );
}

function PaymentModal({ contract, onClose, onSuccess }) {
  const { user } = useContext(UserContext);
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form");
  const [paymentResult, setPaymentResult] = useState(null);

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(price || 0);

  const handlePaySimulated = async () => {
    const result = await createPaymentIntent(contract.agreement_id, contract.monthly_rent, paymentMethod);
    if (!result) {
      alert("Error al crear el pago. Intenta de nuevo.");
      setLoading(false);
      return;
    }
    await new Promise(r => setTimeout(r, 1500));
    const confirmResult = await confirmPayment(result.payment_id);
    if (confirmResult) {
      setPaymentResult(confirmResult.payment || { payment_id: result.payment_id, amount: contract.monthly_rent });
      setStep("success");
      if (onSuccess) onSuccess(confirmResult);
    }
  };

  const handlePayStripe = async () => {
    if (!stripe || !elements) {
      alert("Stripe no está listo. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    const cardEl = elements.getElement(CardElement);
    if (!cardEl) {
      alert("Error con el elemento de tarjeta");
      setLoading(false);
      return;
    }

    const result = await createPaymentIntent(contract.agreement_id, contract.monthly_rent, "card");
    if (!result || !result.clientSecret) {
      alert("Error al crear el pago con Stripe");
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(result.clientSecret, {
      payment_method: { card: cardEl }
    });

    if (error) {
      alert("Error en el pago: " + (error.message || "Desconocido"));
      setLoading(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      const confirmResult = await confirmPayment(result.payment_id, paymentIntent.id);
      if (confirmResult) {
        setPaymentResult(confirmResult.payment || { payment_id: result.payment_id, amount: contract.monthly_rent });
        setStep("success");
        if (onSuccess) onSuccess(confirmResult);
      }
    }
  };

  const handlePay = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (HAS_STRIPE && stripe && elements && paymentMethod === "card" && (contract.monthly_rent || 0) >= 2000) {
        await handlePayStripe();
      } else if (paymentMethod === "paypal" && HAS_PAYPAL) {
        return; // PayPalButtons maneja el flujo directamente
      } else {
        await handlePaySimulated();
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Error al procesar el pago");
    }
    setLoading(false);
  };

  const tenantName = user?.nombre || user?.user_name || "Inquilino";
  const tenantFull = user?.nombre && user?.apellido
    ? `${user.nombre} ${user.apellido}`
    : (user?.user_name && user?.user_lastname ? `${user.user_name} ${user.user_lastname}` : tenantName);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "14px",
        color: "#0e1a2b",
        fontFamily: "inherit",
        "::placeholder": { color: "#cdc6b3" },
      },
      invalid: { color: "#dc2626" },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-[672px]">
        <div className="bg-white rounded-2xl shadow-xl border border-[#e5dfd2] overflow-hidden">
          <div className="bg-[#0e1a2b] px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <p className="text-white font-bold text-2xl">RentUp</p>
                <p className="text-[#cdc6b3] text-sm">Pago de arriendo</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[#cdc6b3] hover:text-white transition-colors">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M1 1L16 16M16 1L1 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {step === "form" && (
            <div className="bg-[#faf8f3] p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-white border border-[#e5dfd2] rounded-xl p-4 space-y-3">
                  <p className="text-[#536379] font-bold text-xs tracking-[1.2px] uppercase">Cliente</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#f1ede4] rounded-lg flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#536379"/>
                      </svg>
                    </div>
                    <p className="text-[#0e1a2b] font-medium text-base">{tenantFull}</p>
                  </div>
                  <div className="border-t border-[#e5dfd2] pt-3 space-y-1">
                    <p className="text-[#536379] font-bold text-xs tracking-[1.2px] uppercase">Dirección</p>
                    <div className="flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#2e5a88"/>
                      </svg>
                      <p className="text-[#0e1a2b] text-base">{contract.direccion_apt || contract.barrio || "Vivienda"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white border border-[#e5dfd2] rounded-xl p-4 space-y-4">
                  <p className="text-[#536379] font-bold text-xs tracking-[1.2px] uppercase">Resumen</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#536379]">Arriendo mensual</span>
                      <span className="text-[#0e1a2b] font-semibold">{formatPrice(contract.monthly_rent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#536379]">Cargos</span>
                      <span className="text-[#0e1a2b]">$0</span>
                    </div>
                    <div className="border-t border-[#e5dfd2] pt-2 flex justify-between">
                      <span className="text-[#0e1a2b] font-bold">Total</span>
                      <span className="text-[#2e5a88] font-bold text-lg">{formatPrice(contract.monthly_rent)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={loading || (!stripe && paymentMethod === 'card' && HAS_STRIPE)}
                    className={`w-full bg-[#2e5a88] text-white font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-[#264c74] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      paymentMethod === "paypal" && HAS_PAYPAL && (contract.monthly_rent || 0) >= 2000 ? "hidden" : ""
                    }`}
                  >
                    {loading ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Procesando...</>
                    ) : (
                      <>Pagar {formatPrice(contract.monthly_rent)}</>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#e5dfd2] rounded-xl overflow-hidden">
                <div className="bg-[#f1ede4] border-b border-[#e5dfd2] flex">
                  <div className="flex-1 px-4 py-2.5">
                    <p className="text-[#536379] font-bold text-xs tracking-[1.2px]">Producto</p>
                  </div>
                  <div className="w-24 px-4 py-2.5 text-center">
                    <p className="text-[#536379] font-bold text-xs tracking-[1.2px]">Cant.</p>
                  </div>
                  <div className="w-24 px-4 py-2.5 text-right">
                    <p className="text-[#536379] font-bold text-xs tracking-[1.2px]">Precio</p>
                  </div>
                  <div className="w-24 px-4 py-2.5 text-right">
                    <p className="text-[#536379] font-bold text-xs tracking-[1.2px]">Total</p>
                  </div>
                </div>
                <div className="border-b border-[#e5dfd2] flex">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 bg-[#faf8f3] border border-[#e5dfd2] rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M19 9.3V4H16.7L12 0L7.3 4H5V9.3C2.3 11.4 1 14.5 1 18C1 20.8 2.1 23.2 3.7 24H20.3C21.9 23.2 23 20.8 23 18C23 14.5 21.7 11.4 19 9.3ZM12 3.1L14.9 6H9.1L12 3.1ZM12 20C9.8 20 8 18.2 8 16C8 13.8 9.8 12 12 12C14.2 12 16 13.8 16 16C16 18.2 14.2 20 12 20Z" fill="#536379"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[#0e1a2b] font-medium text-sm">Arriendo mensual</p>
                      <p className="text-[#536379] text-xs">{contract.barrio_name || contract.barrio || "Vivienda"}</p>
                    </div>
                  </div>
                  <div className="w-24 flex items-center justify-center">
                    <p className="text-[#0e1a2b] text-sm">1</p>
                  </div>
                  <div className="w-24 flex items-center justify-end px-4">
                    <p className="text-[#536379] text-sm">{formatPrice(contract.monthly_rent)}</p>
                  </div>
                  <div className="w-24 flex items-center justify-end px-4">
                    <p className="text-[#0e1a2b] text-sm font-bold">{formatPrice(contract.monthly_rent)}</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 bg-[#faf8f3] border border-[#e5dfd2] rounded-lg flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="1" y="4" width="22" height="16" rx="2" stroke="#536379" strokeWidth="2"/>
                        <line x1="1" y1="10" x2="23" y2="10" stroke="#536379" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[#0e1a2b] font-medium text-sm">
                        {paymentMethod === "card" ? "Tarjeta de crédito/débito" :
                         paymentMethod === "paypal" ? "PayPal" : "Transferencia bancaria"}
                      </p>
                      <p className="text-[#536379] text-xs">Método de pago</p>
                    </div>
                  </div>
                  <div className="w-24 flex items-center justify-center text-[#536379] text-sm">1</div>
                  <div className="w-24 flex items-center justify-end px-4 text-[#536379] text-sm">$0</div>
                  <div className="w-24 flex items-center justify-end px-4 text-[#0e1a2b] text-sm font-bold">$0</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-48 space-y-2">
                  <p className="text-[#536379] font-bold text-xs tracking-[1.2px] uppercase">Método</p>
                    {[
                      { id: "card", label: "Tarjeta" },
                      ...(HAS_PAYPAL ? [{ id: "paypal", label: "PayPal" }] : []),
                    ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                        paymentMethod === m.id
                          ? "border-[#2e5a88] bg-[#eef3f9]"
                          : "border-[#e5dfd2] bg-white hover:bg-[#faf8f3]"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === m.id ? "border-[#2e5a88]" : "border-[#cdc6b3]"
                      }`}>
                        {paymentMethod === m.id && <div className="w-2 h-2 rounded-full bg-[#2e5a88]" />}
                      </div>
                      <span className="text-sm text-[#0e1a2b]">{m.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex-1 space-y-2">
                  {paymentMethod === "card" && (
                    <>
                      <p className="text-[#536379] font-bold text-xs tracking-[1.2px] uppercase">Datos de tarjeta</p>
                      <div className="bg-white border border-[#e5dfd2] rounded-lg px-3 py-2.5">
                        <CardElement options={cardElementOptions} />
                      </div>
                      {HAS_STRIPE ? (
                        <p className="text-xs text-[#2e5a88] flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="#2e5a88"/>
                          </svg>
                          Stripe — pago seguro con tarjeta
                        </p>
                      ) : (
                        <p className="text-xs text-[#536379] flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#536379" strokeWidth="2"/>
                            <line x1="12" y1="8" x2="12" y2="14" stroke="#536379" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="12" cy="17" r="1" fill="#536379"/>
                          </svg>
                          Modo simulado — no se realizará un cobro real
                        </p>
                      )}
                    </>
                  )}
                  {paymentMethod === "paypal" && (
                    <div className="bg-white border border-[#e5dfd2] rounded-xl p-4">
                      {(contract.monthly_rent || 0) >= 2000 ? (
                        <PayPalOrderButton
                          agreement_id={contract.agreement_id}
                          amount={contract.monthly_rent}
                          onSuccess={(result) => {
                            setPaymentResult(result.payment || { payment_id: result.payment?.payment_id, amount: contract.monthly_rent });
                            setStep("success");
                            if (onSuccess) onSuccess(result);
                          }}
                          onError={(msg) => alert(msg)}
                        />
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-lg font-bold">
                            <span className="text-[#003087]">Pay</span><span className="text-[#009cde]">Pal</span>
                          </p>
                          <p className="text-[#536379] text-xs mt-2">Monto mínimo: $2,000 COP</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="bg-[#faf8f3] p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-[#eef3f9] rounded-full flex items-center justify-center mx-auto">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="#2e5a88"/>
                </svg>
              </div>
              <p className="text-[#0e1a2b] font-bold text-xl">¡Pago exitoso!</p>
              <p className="text-[#536379] text-sm">
                Tu pago de {formatPrice(paymentResult?.amount || contract.monthly_rent)} ha sido procesado.
              </p>
              <div className="bg-white border border-[#e5dfd2] rounded-xl p-3 inline-block">
                <p className="text-[#536379] text-xs">Recibo N°</p>
                <p className="text-[#0e1a2b] text-sm font-mono font-bold">{paymentResult?.payment_id}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => downloadReceipt(paymentResult?.payment_id)}
                  className="bg-[#2e5a88] rounded-lg px-4 py-2.5 text-white font-bold text-sm hover:bg-[#264c74] transition-all flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill="white"/>
                  </svg>
                  Descargar Recibo
                </button>
                <button
                  onClick={onClose}
                  className="bg-white border border-[#e5dfd2] rounded-lg px-4 py-2.5 text-[#0e1a2b] font-bold text-sm hover:bg-[#faf8f3] transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border-t border-[#e5dfd2] px-6 py-4 flex items-center justify-between">
            <p className="text-[#536379] text-xs">Pago seguro · No compartimos tus datos</p>
            <div className="text-right">
              <p className="text-[#2e5a88] font-bold text-xl">
                Total: {formatPrice(contract.monthly_rent)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
