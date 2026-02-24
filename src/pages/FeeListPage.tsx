import React, { useEffect, useMemo, useState } from "react";
import { formatDateMMDDYY } from "../utils/dateUtils";
import { feeListAPI } from "../utils/api";
import { Link } from "react-router-dom";

type YesNo = "Yes" | "No";
type AgreementType = "Standard" | "Custom";
type PaymentMethod = "Deposit" | "Pick-Up";
type GuideType = "A" | "B" | "C" | "D";

type FeeRow = {
  id: string;
  clientName: string;
  clientLink: string;
  tl: YesNo;
  lastTL: string;
  agreement: AgreementType;
  method: PaymentMethod;
  bank: string;
  accountMasked: string;
  guide: GuideType;
  notes: string;
};

export default function FeeListPage(): JSX.Element {
  const initialRows: FeeRow[] = useMemo(() => [], []);

  const [rows, setRows] = useState<FeeRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({
    clientName: "",
    timeLoss: "Yes",
    agreement: "Standard",
    paymentMethod: "Deposit",
    bank: "",
    accountLast4: "",
    guide: "A",
    notes: "",
  });
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await feeListAPI.getAll();
      const apiData = res.data || [];

      const mapped: FeeRow[] = apiData.map((item: any) => ({
        id: item._id,
        clientName: item.clientName,
        clientLink: "/client-info",
        tl: item.timeLoss,
        lastTL: item.nextDueDate || "-",
        agreement: item.agreement,
        method: item.paymentMethod,
        bank: item.bank || "-",
        accountMasked: item.accountLast4 ? `****${item.accountLast4}` : "-",
        guide: item.guide,
        notes: item.notes,
      }));

      setRows(mapped);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onEdit = (row: FeeRow) => {
    setEditingId(row.id);

    setEditForm({
      clientName: row.clientName,
      timeLoss: row.tl,
      agreement: row.agreement,
      paymentMethod: row.method,
      bank: row.bank === "-" ? "" : row.bank,
      accountLast4:
        row.accountMasked && row.accountMasked !== "-"
          ? row.accountMasked.replace("****", "")
          : "",
      guide: row.guide,
      notes: row.notes,
    });

    setShowModal(true); // ✅ open modal immediately
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const payload = {
        id: editingId,
        clientName: editForm.clientName,
        timeLoss: editForm.timeLoss,
        agreement: editForm.agreement,
        paymentMethod: editForm.paymentMethod,
        bank: editForm.bank,
        accountLast4: editForm.accountLast4,
        guide: editForm.guide,
        notes: editForm.notes,
      };
      console.log(payload);
      await feeListAPI.update(payload);

      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Update error:", error);
    }
  };
  const onDelete = async (row: FeeRow) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    try {
      await feeListAPI.delete(row.id);
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      {/* BLUR WRAPPER */}
      <div className={showModal ? "blur-content" : ""}>
        <div className="d-flex justify-content-between mb-2">
          <h4 className="mb-0">
            <i className="fa fa-dollar" /> Fee List
          </h4>

          <div className="d-flex justify-content-between">
            <a className="btn btn-success me-3" href="/fee-calendar">
              <i className="fa fa-calendar" /> Fee Calendar
            </a>

            <a className="btn btn-primary" href="/add-feelist">
              Add New
            </a>
          </div>
        </div>

        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle datatable mb-0">
              <thead className="table-light">
                <tr>
                  <th>Client Name</th>
                  <th>TL</th>
                  <th>Last TL</th>
                  <th>Agreement</th>
                  <th>P/U or Deposit</th>
                  <th>Bank</th>
                  <th>Account</th>
                  <th>Guide</th>
                  <th>Notes</th>
                  <th style={{ width: 180 }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link
                        to={`/client-info/${r.id}`}
                        className="text-decoration-none"
                      >
                        {r.clientName}
                      </Link>
                    </td>

                    <td>
                      <span
                        className={`badge ${r.tl === "Yes" ? "bg-success" : "bg-secondary"}`}
                      >
                        {r.tl}
                      </span>
                    </td>

                    <td>
                      {r.lastTL && r.lastTL !== "-"
                        ? formatDateMMDDYY(r.lastTL)
                        : "not found"}
                    </td>

                    <td>{r.agreement}</td>
                    <td>{r.method}</td>
                    <td>{r.bank}</td>
                    <td className="masked">{r.accountMasked}</td>
                    <td>{r.guide}</td>
                    <td>{r.notes}</td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => onEdit(r)}
                      >
                        <i className="fa fa-edit" />
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(r)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-muted py-4">
                      {loading ? "Loading..." : "No fee records found."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Fee</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label>Client Name</label>
                      <input
                        className="form-control"
                        value={editForm.clientName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            clientName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-6 mb-2">
                      <label>Bank</label>
                      <input
                        className="form-control"
                        value={editForm.bank}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bank: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6 mb-2">
                      <label>Account Last 4</label>
                      <input
                        className="form-control"
                        value={editForm.accountLast4}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            accountLast4: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-12 mb-2">
                      <label>Notes</label>
                      <textarea
                        className="form-control"
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm({ ...editForm, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleUpdate}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
  .masked {
    letter-spacing: 2px;
  }

  .blur-content {
    filter: blur(2px);
    pointer-events: none;
    user-select: none;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
  }

  .modal {
    z-index: 1060;
  }
`}</style>
    </>
  );
}
