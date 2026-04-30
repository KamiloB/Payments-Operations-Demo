import { useMemo, useState } from "react";
import { parseCOP } from "../utils/parseCurrency";
import { formatCOP } from "../utils/formatCurrency";

export default function CreatePaymentModal({ students, nextReceiptNumber, onClose, onCreate }) {
  const [form, setForm] = useState({
    studentId: "",
    amount: 0,
    method: "cash",
    validFrom: "",
    notes: "",
  });
  const [displayAmount, setDisplayAmount] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentList, setShowStudentList] = useState(false);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    return students
      .filter((student) => (student.student?.fullName || "").toLowerCase().includes(query))
      .sort((a, b) => (a.student?.fullName || "").localeCompare(b.student?.fullName || ""));
  }, [students, studentSearch]);

  const selectedStudent = students.find((student) => student.id === form.studentId);

  const handleSelectStudent = (studentId) => {
    setForm((prev) => ({ ...prev, studentId }));
    setShowStudentList(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.validFrom || !form.amount) return;
    onCreate(form);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Registrar pago</h3>

        <label className="label">Comprobante</label>
        <input className="field field-muted" value={nextReceiptNumber} readOnly />

        <label className="label">Estudiante</label>
        <button
          type="button"
          onClick={() => setShowStudentList((prev) => !prev)}
          className="field student-trigger"
        >
          {selectedStudent?.student?.fullName || "Seleccionar alumno"}
        </button>

        {showStudentList && (
          <div className="student-picker">
            <input
              type="text"
              placeholder="Escribe para filtrar..."
              className="field"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              autoFocus
            />

            <div className="student-results">
              {filteredStudents.length === 0 ? (
                <p className="empty-state">No hay estudiantes que coincidan con la búsqueda.</p>
              ) : (
                <ul>
                  {filteredStudents.map((student) => (
                    <li key={student.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectStudent(student.id)}
                        className="student-option"
                      >
                        {student.student?.fullName || "—"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {!form.studentId && <p className="hint">Debes seleccionar un estudiante.</p>}

        <label className="label">Monto</label>
        <input
          className="field"
          value={displayAmount}
          onChange={(e) => {
            const value = parseCOP(e.target.value);
            setForm((prev) => ({ ...prev, amount: value }));
            setDisplayAmount(value ? formatCOP(value) : "");
          }}
          placeholder="$ 0"
          required
        />

        <div className="grid-2">
          <div>
            <label className="label">Fecha de pago</label>
            <input
              className="field"
              type="date"
              value={form.validFrom}
              onChange={(e) => setForm((prev) => ({ ...prev, validFrom: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Método</label>
            <select
              className="field"
              value={form.method}
              onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
        </div>

        <label className="label">Notas</label>
        <textarea
          className="field"
          rows="3"
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        />

        <div className="actions">
          <button type="button" className="btn btn-danger" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar pago
          </button>
        </div>
      </form>
    </div>
  );
}
