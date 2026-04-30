import { useMemo, useState } from "react";
import CreatePaymentModal from "./components/CreatePaymentModal";
import PaymentReceiptModal from "./components/PaymentReceiptModal";
import { initialPayments, mockStudents } from "./data/mockPayments";
import { formatCOP } from "./utils/formatCurrency";
import { getPaymentStatus, paymentMethodLabel, PAYMENT_VALIDITY_DAYS } from "./utils/paymentLabels";

function SocialIcon({ href, label, children }) {
  return (
    <a
      className="social-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
    >
      {children}
    </a>
  );
}

export default function App() {
  const [payments, setPayments] = useState(initialPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [expandedStudents, setExpandedStudents] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const studentById = useMemo(
    () =>
      mockStudents.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {}),
    []
  );

  const groupedPayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    const groups = payments.reduce((acc, payment) => {
      if (!acc[payment.studentId]) acc[payment.studentId] = [];
      acc[payment.studentId].push(payment);
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([studentId, studentPayments]) => {
        const sorted = [...studentPayments].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
        return {
          studentId,
          student: studentById[studentId],
          latest: sorted[0],
          history: sorted.slice(1),
        };
      })
      .filter((group) => {
        const name = (group.student?.student?.fullName || "").toLowerCase();
        const document = (group.student?.student?.documentNumber || "").toLowerCase();
        const place = (group.student?.training?.placeName || "").toLowerCase();
        const status = getPaymentStatus(group.latest);

        const matchSearch =
          !query || name.includes(query) || document.includes(query) || place.includes(query);
        const matchStatus =
          statusFilter === "all" ||
          (statusFilter === "paid" && status === "Pagado") ||
          (statusFilter === "expired" && status === "Vencido");

        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.latest.paidAt) - new Date(a.latest.paidAt));
  }, [payments, search, statusFilter, studentById]);

  const counters = useMemo(() => {
    const paid = payments.filter((payment) => getPaymentStatus(payment) === "Pagado").length;
    const expired = payments.filter((payment) => getPaymentStatus(payment) === "Vencido").length;
    return { total: payments.length, paid, expired };
  }, [payments]);

  const selectedStudent = selectedPayment ? studentById[selectedPayment.studentId] : null;

  const nextReceiptNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const next = payments.filter((p) => p.receiptNumber?.includes(`REC-${year}-`)).length + 1;
    return `REC-${year}-${String(next).padStart(4, "0")}`;
  }, [payments]);

  const registerPayment = (form) => {
    const paidAtDate = new Date(`${form.validFrom}T12:00:00`);
    const validUntil = new Date(paidAtDate);
    validUntil.setDate(validUntil.getDate() + PAYMENT_VALIDITY_DAYS);

    const newPayment = {
      id: `pay-${crypto.randomUUID()}`,
      studentId: form.studentId,
      amount: form.amount,
      method: form.method,
      receiptNumber: nextReceiptNumber,
      paidAt: paidAtDate.toISOString(),
      validFrom: paidAtDate.toISOString(),
      validUntil: validUntil.toISOString(),
      notes: form.notes || "",
      status: "paid",
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);
  };

  return (
    <main className="app-shell-wrap">
      <header className="hero">
        <p className="eyebrow">Demo Interactivo</p>
        <h1>Pagos, estados y contacto WhatsApp</h1>
        <p className="hero-description">
          Registro de Pagos, historial por alumno, estado pagado/vencido, comprobante descargable y
          contacto directo por WhatsApp con mensaje dinámico.
        </p>

        <div className="social-links" aria-label="Redes y portafolio">
          <SocialIcon href="https://www.instagram.com/kamilo_blandon" label="Instagram">
            <svg viewBox="0 0 24 24">
              <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
            </svg>
          </SocialIcon>
          <SocialIcon href="https://github.com/KamiloB" label="GitHub">
            <svg viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.21.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.17-1.11-1.48-1.11-1.48-.91-.61.07-.59.07-.59 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.25-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.4 9.4 0 0 1 5 0c1.9-1.33 2.74-1.05 2.74-1.05.56 1.42.21 2.47.11 2.73.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.83-4.59 5.08.36.32.68.95.68 1.93v2.86c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
            </svg>
          </SocialIcon>
          <SocialIcon href="https://kamilob.dev" label="Portafolio">
            <svg viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.93 9h-3.07a15.6 15.6 0 0 0-1.37-5.02A8.03 8.03 0 0 1 19.93 11zM12 4c1.37 0 2.95 2.2 3.57 7H8.43C9.05 6.2 10.63 4 12 4zM4.07 13h3.07a15.6 15.6 0 0 0 1.37 5.02A8.03 8.03 0 0 1 4.07 13zm3.07-2H4.07a8.03 8.03 0 0 1 4.44-5.02A15.6 15.6 0 0 0 7.14 11zm4.86 9c-1.37 0-2.95-2.2-3.57-7h7.14c-.62 4.8-2.2 7-3.57 7zm3.49-1.98A15.6 15.6 0 0 0 16.86 13h3.07a8.03 8.03 0 0 1-4.44 5.02z" />
            </svg>
          </SocialIcon>
        </div>
      </header>

      <section className="panel">
        <div className="top-row">
          <div>
            <h2>Panel de pagos</h2>
            <p className="subtitle">
              Cards por alumno, último pago visible, historial desplegable y recibo con acciones.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            Registrar pago
          </button>
        </div>

        <div className="stats">
          <article>
            <p>Total registros</p>
            <strong>{counters.total}</strong>
          </article>
          <article>
            <p>Pagados activos</p>
            <strong>{counters.paid}</strong>
          </article>
          <article>
            <p>Vencidos</p>
            <strong>{counters.expired}</strong>
          </article>
        </div>

        <div className="filters">
          <input
            className="field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por estudiante, documento o sede..."
          />
          <select
            className="field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="paid">Pagado</option>
            <option value="expired">Vencido</option>
          </select>
        </div>

        <div className="cards">
          {groupedPayments.map(({ studentId, student, latest, history }) => {
            const status = getPaymentStatus(latest);
            return (
              <article className="payment-card" key={studentId}>
                <div className="card-top">
                  <div>
                    <h3>{student?.student?.fullName || "Alumno sin nombre"}</h3>
                    <p>
                      {student?.training?.placeName || "—"} · Doc:{" "}
                      {student?.student?.documentNumber || "—"}
                    </p>
                    <p>
                      {formatCOP(latest.amount)} · {paymentMethodLabel(latest.method)}
                    </p>
                    <span
                      className={`badge ${status === "Pagado" ? "badge-paid" : "badge-expired"}`}
                    >
                      {status}
                    </span>
                  </div>
                  <button className="btn btn-primary" onClick={() => setSelectedPayment(latest)}>
                    Ver comprobante
                  </button>
                </div>

                {history.length > 0 && (
                  <div className="history">
                    <button
                      className="ghost-link"
                      onClick={() =>
                        setExpandedStudents((prev) => ({ ...prev, [studentId]: !prev[studentId] }))
                      }
                    >
                      {expandedStudents[studentId] ? "▲ Ocultar historial" : "▼ Ver historial"}
                    </button>
                    {expandedStudents[studentId] && (
                      <ul>
                        {history.map((payment) => (
                          <li key={payment.id}>
                            <span>
                              {new Date(payment.paidAt).toLocaleDateString("es-CO")} ·{" "}
                              {formatCOP(payment.amount)} · {paymentMethodLabel(payment.method)}
                            </span>
                            <button
                              className="btn btn-soft"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              Ver comprobante
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {showCreateModal && (
        <CreatePaymentModal
          students={mockStudents}
          nextReceiptNumber={nextReceiptNumber}
          onClose={() => setShowCreateModal(false)}
          onCreate={registerPayment}
        />
      )}
      {selectedPayment && (
        <PaymentReceiptModal
          payment={selectedPayment}
          student={selectedStudent}
          clubName="MiClubManager Demo Club"
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </main>
  );
}
