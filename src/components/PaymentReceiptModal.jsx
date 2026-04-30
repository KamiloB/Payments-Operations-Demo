import html2canvas from "html2canvas";
import { formatCOP } from "../utils/formatCurrency";
import receiptTopLogo from "../assets/receipt-top-logo.png";
import receiptWatermarkLogo from "../assets/receipt-watermark-logo.png";

export default function PaymentReceiptModal({ payment, student, clubName, onClose }) {
  const paidAt = payment?.paidAt ? new Date(payment.paidAt) : null;
  const validFrom = payment?.validFrom ? new Date(payment.validFrom) : null;
  const validUntil = payment?.validUntil ? new Date(payment.validUntil) : null;

  const whatsappMessage = `
Hola,

Te envío el comprobante de pago de:
Alumno: ${student?.student?.fullName || "—"}

Monto: ${formatCOP(payment?.amount || 0)}
Vigencia: ${validFrom?.toLocaleDateString("es-CO") || "—"} → ${validUntil?.toLocaleDateString("es-CO") || "—"}
Comprobante: ${payment?.receiptNumber || "—"}

Cualquier duda quedo atento.
Gracias.
`.trim();

  const saveImage = async () => {
    const node = document.getElementById("payment-receipt");
    if (!node) return;

    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = payment?.receiptNumber ? `${payment.receiptNumber}.png` : "comprobante.png";
    link.click();
  };

  const sendWhatsApp = async () => {
    await saveImage();

    const phone = student?.guardians?.primaryPhone || student?.guardians?.secondaryPhone;
    if (!phone) {
      window.alert("Este alumno no tiene número registrado.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/57${cleanPhone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="receipt" id="payment-receipt" onClick={(e) => e.stopPropagation()}>
        <img src={receiptWatermarkLogo} alt="marca de agua" className="receipt-watermark" />
        <img src={receiptTopLogo} alt="logo" className="receipt-top-logo" />
        <div className="receipt-header">
          <h3>{clubName}</h3>
          <p className="subtitle">Comprobante de pago</p>
          <p className="receipt-number">Nº {payment?.receiptNumber || "—"}</p>
        </div>

        <div className="receipt-rows">
          <Row label="Alumno">{student?.student?.fullName || "—"}</Row>
          <Row label="Fecha de pago">{paidAt?.toLocaleDateString("es-CO") || "—"}</Row>
          <Row label="Método">{payment?.method === "cash" ? "Efectivo" : "Transferencia"}</Row>
        </div>

        <div className="receipt-validity">
          <p className="receipt-validity-title">Vigencia del servicio</p>
          <p>
            {validFrom?.toLocaleDateString("es-CO") || "—"} →{" "}
            {validUntil?.toLocaleDateString("es-CO") || "—"}
          </p>
        </div>

        <div className="receipt-total">
          <span>Total pagado</span>
          <strong>{formatCOP(payment?.amount || 0)}</strong>
        </div>

        {payment?.notes && (
          <div className="receipt-notes">
            <p>Notas</p>
            <p>{payment.notes}</p>
          </div>
        )}

        <span className="badge badge-paid">Pagado</span>

        <div className="actions">
          <button className="btn btn-danger" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn btn-primary" onClick={saveImage}>
            💾 Guardar
          </button>
          <button className="btn btn-whatsapp" onClick={sendWhatsApp}>
            📲 Enviar a WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="kv">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}
