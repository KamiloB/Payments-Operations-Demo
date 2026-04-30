const dayMs = 24 * 60 * 60 * 1000;
const addDays = (date, days) => new Date(date.getTime() + dayMs * days);

function buildPayment({ id, studentId, amount, method, paidAt, notes = "", offset = 0 }) {
  const paid = new Date(paidAt);
  const validUntil = addDays(paid, 30);
  return {
    id,
    studentId,
    amount,
    method,
    paidAt: paid.toISOString(),
    validFrom: paid.toISOString(),
    validUntil: validUntil.toISOString(),
    receiptNumber: `REC-${paid.getFullYear()}-${String(offset + 1).padStart(4, "0")}`,
    notes,
    status: "paid",
    createdAt: addDays(paid, 1).toISOString(),
  };
}

export const mockStudents = [
  {
    id: "stu-001",
    student: { fullName: "Valentina Rojas", documentNumber: "1032456789" },
    guardians: { primaryPhone: "3001234567", secondaryPhone: "" },
    training: { placeName: "Sede Centro", trainerName: "Laura Ruiz" },
  },
  {
    id: "stu-002",
    student: { fullName: "Matías Gómez", documentNumber: "1008765432" },
    guardians: { primaryPhone: "3015551122", secondaryPhone: "3028884433" },
    training: { placeName: "Sede Norte", trainerName: "Diego Morales" },
  },
  {
    id: "stu-003",
    student: { fullName: "Juliana Pérez", documentNumber: "1019988776" },
    guardians: { primaryPhone: "", secondaryPhone: "" },
    training: { placeName: "Sede Sur", trainerName: "Camilo Parra" },
  },
];

const now = new Date();

export const initialPayments = [
  buildPayment({
    id: "pay-001",
    studentId: "stu-001",
    amount: 180000,
    method: "transfer",
    paidAt: addDays(now, -5),
    notes: "Mensualidad abril",
    offset: 0,
  }),
  buildPayment({
    id: "pay-002",
    studentId: "stu-001",
    amount: 180000,
    method: "cash",
    paidAt: addDays(now, -38),
    notes: "Mensualidad marzo",
    offset: 1,
  }),
  buildPayment({
    id: "pay-003",
    studentId: "stu-002",
    amount: 170000,
    method: "cash",
    paidAt: addDays(now, -20),
    notes: "Pago presencial",
    offset: 2,
  }),
  buildPayment({
    id: "pay-004",
    studentId: "stu-003",
    amount: 160000,
    method: "transfer",
    paidAt: addDays(now, -70),
    notes: "Pendiente renovación",
    offset: 3,
  }),
];
