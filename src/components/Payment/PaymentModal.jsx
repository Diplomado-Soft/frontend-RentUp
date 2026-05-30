import React, { useState, useContext, useRef, useEffect } from "react";
import { UserContext } from "../../contexts/UserContext";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { createPaymentIntent, confirmPayment, downloadReceipt, createPayPalOrder, capturePayPalOrder, getPaymentsByAgreement } from "../../apis/paymentController";

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
  const [isFirstPayment, setIsFirstPayment] = useState(true);

  useEffect(() => {
    getPaymentsByAgreement(contract.agreement_id).then(payments => {
      const hasCompleted = payments.some(p => p.status === 'completed');
      setIsFirstPayment(!hasCompleted);
    });
  }, [contract.agreement_id]);

  const depositApplies = isFirstPayment && Number(contract.deposit_amount) > 0;
  const totalAmount = Math.max(0, (contract.monthly_rent || 0) - (depositApplies ? Number(contract.deposit_amount) : 0));

  useEffect(() => {
    if (paymentMethod === 'card' && totalAmount < 3500) {
      setPaymentMethod('simulated');
    }
    if (paymentMethod === 'paypal' && totalAmount < 3500) {
      setPaymentMethod('simulated');
    }
  }, [totalAmount, paymentMethod]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(price || 0);

  const handlePaySimulated = async () => {
    const result = await createPaymentIntent(contract.agreement_id, totalAmount, paymentMethod === 'simulated' ? 'other' : paymentMethod);
    if (!result) {
      alert("Error al crear el pago. Intenta de nuevo.");
      setLoading(false);
      return;
    }
    await new Promise(r => setTimeout(r, 1500));
    const confirmResult = await confirmPayment(result.payment_id);
    if (confirmResult) {
      setPaymentResult(confirmResult.payment || { payment_id: result.payment_id, amount: totalAmount });
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

    const result = await createPaymentIntent(contract.agreement_id, totalAmount, "card");
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
        setPaymentResult(confirmResult.payment || { payment_id: result.payment_id, amount: totalAmount });
        setStep("success");
        if (onSuccess) onSuccess(confirmResult);
      }
    }
  };

  const handlePay = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (HAS_STRIPE && stripe && elements && paymentMethod === "card" && (totalAmount || 0) >= 3500) {
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
        <div className="bg-white rounded-2xl shadow-xl border border-line overflow-hidden">
          <div className="bg-ink px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <p className="text-white font-bold text-2xl">RentUp</p>
                <p className="text-ink-muted text-sm">Pago de arriendo</p>
              </div>
            </div>
            <button onClick={onClose} className="text-ink-muted hover:text-white transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {step === "form" && (
            <div className="bg-paper p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-white border border-line rounded-xl p-4 space-y-3">
                  <p className="text-ink-muted font-bold text-xs tracking-[1.2px] uppercase">Cliente</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-paper-sunk rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-ink-muted text-sm">person</span>
                    </div>
                    <p className="text-ink font-medium text-base">{tenantFull}</p>
                  </div>
                  <div className="border-t border-line pt-3 space-y-1">
                    <p className="text-ink-muted font-bold text-xs tracking-[1.2px] uppercase">Dirección</p>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-brand-500">location_on</span>
                      <p className="text-ink text-base">{contract.direccion_apt || contract.barrio || "Vivienda"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white border border-line rounded-xl p-4 space-y-4">
                  <p className="text-ink-muted font-bold text-xs tracking-[1.2px] uppercase">Resumen</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Arriendo mensual</span>
                      <span className="text-ink font-semibold">{formatPrice(contract.monthly_rent)}</span>
                    </div>
                    {depositApplies && (
                      <div className="flex justify-between text-sm">
                        <span className="text-brand-500">Descuento depósito</span>
                        <span className="text-brand-500 font-semibold">-{formatPrice(contract.deposit_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-muted">Cargos</span>
                      <span className="text-ink">$0</span>
                    </div>
                    <div className="border-t border-line pt-2 flex justify-between">
                      <span className="text-ink font-bold">Total</span>
                      <span className="text-brand-500 font-bold text-lg">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={loading || (!stripe && paymentMethod === 'card' && HAS_STRIPE)}
                    className={`w-full bg-brand-500 text-white font-bold text-sm rounded-lg px-4 py-2.5 hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      paymentMethod === "paypal" ? "hidden" : ""
                    }`}
                  >
                    {loading ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Procesando...</>
                    ) : (
                      <>Pagar {formatPrice(totalAmount)}</>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white border border-line rounded-xl overflow-hidden">
                <div className="bg-paper-sunk border-b border-line flex">
                  <div className="flex-1 px-4 py-2.5">
                    <p className="text-ink-muted font-bold text-xs tracking-[1.2px]">Producto</p>
                  </div>
                  <div className="w-24 px-4 py-2.5 text-center">
                    <p className="text-ink-muted font-bold text-xs tracking-[1.2px]">Cant.</p>
                  </div>
                  <div className="w-24 px-4 py-2.5 text-right">
                    <p className="text-ink-muted font-bold text-xs tracking-[1.2px]">Precio</p>
                  </div>
                  <div className="w-24 px-4 py-2.5 text-right">
                    <p className="text-ink-muted font-bold text-xs tracking-[1.2px]">Total</p>
                  </div>
                </div>
                <div className="border-b border-line flex">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 bg-paper border border-line rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-ink-muted">home</span>
                    </div>
                    <div>
                      <p className="text-ink font-medium text-sm">Arriendo mensual</p>
                      <p className="text-ink-muted text-xs">{contract.barrio_name || contract.barrio || "Vivienda"}</p>
                    </div>
                  </div>
                  <div className="w-24 flex items-center justify-center">
                    <p className="text-ink text-sm">1</p>
                  </div>
                  <div className="w-24 flex items-center justify-end px-4">
                    <p className="text-ink-muted text-sm">{formatPrice(contract.monthly_rent)}</p>
                  </div>
                  <div className="w-24 flex items-center justify-end px-4">
                    <p className="text-ink text-sm font-bold">{formatPrice(contract.monthly_rent)}</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 bg-paper border border-line rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-ink-muted">credit_card</span>
                    </div>
                    <div>
                      <p className="text-ink font-medium text-sm">
                        {paymentMethod === "card" ? "Tarjeta de crédito/débito" :
                         paymentMethod === "paypal" ? "PayPal" : "Transferencia bancaria"}
                      </p>
                      <p className="text-ink-muted text-xs">Método de pago</p>
                    </div>
                  </div>
                  <div className="w-24 flex items-center justify-center text-ink-muted text-sm">1</div>
                  <div className="w-24 flex items-center justify-end px-4 text-ink-muted text-sm">$0</div>
                  <div className="w-24 flex items-center justify-end px-4 text-ink text-sm font-bold">$0</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-48 space-y-2">
                  <p className="text-ink-muted font-bold text-xs tracking-[1.2px] uppercase">Método</p>
                    {[
                      ...(totalAmount >= 3500 ? [{ id: "card", label: "Tarjeta" }] : []),
                      ...(HAS_PAYPAL && totalAmount >= 3500 ? [{ id: "paypal", label: "PayPal" }] : []),
                      { id: "simulated", label: "Simulado" },
                    ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                        paymentMethod === m.id
                          ? "border-brand-500 bg-brand-50"
                          : "border-line bg-white hover:bg-paper"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === m.id ? "border-brand-500" : "border-outline"
                      }`}>
                        {paymentMethod === m.id && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                      </div>
                      <span className="text-sm text-ink">{m.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex-1 space-y-2">
                  {paymentMethod === "card" && (
                    <>
                      <p className="text-ink-muted font-bold text-xs tracking-[1.2px] uppercase">Datos de tarjeta</p>
                      <div className="bg-white border border-line rounded-lg px-3 py-2.5">
                        <CardElement options={cardElementOptions} />
                      </div>
                      {HAS_STRIPE ? (
                        <p className="text-xs text-brand-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-brand-500">check_circle</span>
                          Stripe — pago seguro con tarjeta
                        </p>
                      ) : (
                        <p className="text-xs text-ink-muted flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-ink-muted">info</span>
                          Modo simulado — no se realizará un cobro real
                        </p>
                      )}
                    </>
                  )}
                  {paymentMethod === "paypal" && (
                    <div className="bg-white border border-line rounded-xl p-4">
                      {(totalAmount || 0) >= 3500 ? (
                        <PayPalOrderButton
                          agreement_id={contract.agreement_id}
                          amount={totalAmount}
                          onSuccess={(result) => {
                            setPaymentResult(result.payment || { payment_id: result.payment?.payment_id, amount: totalAmount });
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
                          <p className="text-ink-muted text-xs mt-2">Monto mínimo: $3,500 COP</p>
                        </div>
                      )}
                    </div>
                  )}
                  {paymentMethod === "simulated" && (
                    <div className="bg-white border border-line rounded-xl p-4 text-center">
                      <p className="text-base font-bold text-ink">Pago simulado</p>
                      <p className="text-xs text-ink-muted mt-2">
                        No se realizará un cobro real. Usá este método para montos pequeños o pruebas.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {step === "success" && (
            <div className="bg-paper p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl text-brand-500">check_circle</span>
              </div>
              <p className="text-ink font-bold text-xl">¡Pago exitoso!</p>
              <p className="text-ink-muted text-sm">
                Tu pago de {formatPrice(paymentResult?.amount || contract.monthly_rent)} ha sido procesado.
              </p>
              <div className="bg-white border border-line rounded-xl p-3 inline-block">
                <p className="text-ink-muted text-xs">Recibo N°</p>
                <p className="text-ink text-sm font-mono font-bold">{paymentResult?.payment_id}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => downloadReceipt(paymentResult?.payment_id)}
                  className="bg-brand-500 rounded-lg px-4 py-2.5 text-white font-bold text-sm hover:bg-brand-600 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Descargar Recibo
                </button>
                <button
                  onClick={onClose}
                  className="bg-white border border-line rounded-lg px-4 py-2.5 text-ink font-bold text-sm hover:bg-paper transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border-t border-line px-6 py-4 flex items-center justify-between">
            <p className="text-ink-muted text-xs">Pago seguro · No compartimos tus datos</p>
            <div className="text-right">
              <p className="text-brand-500 font-bold text-xl">
                Total: {formatPrice(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
