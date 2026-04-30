export const PAYMENT_VALIDITY_DAYS = 30;

export const paymentMethodLabel = (method) => {
  switch (method) {
    case "cash":
      return "Efectivo";
    case "transfer":
      return "Transferencia";
    default:
      return method;
  }
};

export function isPaymentActive(validUntil) {
  if (!validUntil) return true;
  const validDate = new Date(validUntil);
  if (Number.isNaN(validDate.getTime())) return false;
  return validDate >= new Date();
}

export function getPaymentStatus(payment) {
  if (!payment?.validUntil) return "Pagado";
  return isPaymentActive(payment.validUntil) ? "Pagado" : "Vencido";
}
