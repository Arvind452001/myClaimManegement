import React, { useEffect, useState } from "react";
import { formatDateMMDDYY } from "../utils/dateUtils";
import { timeLossAPI } from "../utils/api";

type TimeLossRow = {
  id: string;
  date: string;
  checkNo: string;
  payee: string;
  totalCheck: number;
  iwjFee: number;
  paidOut: number;
  method: string;
  cleared: boolean;
  bank: string;
  accountNumber: string;
  notes: string;
};

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function TimeLossPage(): JSX.Element {
  const [rows, setRows] = useState<TimeLossRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [editData, setEditData] = useState<TimeLossRow | null>(null);
  const [viewData, setViewData] = useState<TimeLossRow | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await timeLossAPI.getAll();
      const data = res?.data || [];

      const formatted = data.map((item: any) => ({
        id: item._id,
        date: item.date,
        checkNo: item.checkNumber,
        payee: item.payee,
        totalCheck: item.totalCheck,
        iwjFee: item.iwjFee,
        paidOut: item.paidOut,
        method: item.method,
        cleared: item.cleared,
        bank: item.bank || "",
        accountNumber: item.accountNumber || "",
        notes: item.notes || "",
      }));

      setRows(formatted);
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const onDelete = async (row: TimeLossRow) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    await timeLossAPI.delete(row.id);
    fetchData();
  };

  /* ================= UPDATE ================= */

  const handleUpdate = async () => {
  if (!editData) return;

  const payload = {
    id: editData.id,   // ✅ ID body me
    date: new Date(editData.date).toISOString(),
    checkNumber: editData.checkNo,
    payee: editData.payee,
    totalCheck: Number(editData.totalCheck),
    iwjFee: Number(editData.iwjFee),
    paidOut: Number(editData.paidOut),
    method: editData.method,
    cleared: editData.cleared,
    bank: editData.bank,
    accountNumber: editData.accountNumber,
    notes: editData.notes,
  };

  await timeLossAPI.update(payload);  // ✅ sirf payload
alert('updated successfully')
  setIsEditOpen(false);
  fetchData();
};


  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <h4>
          <i className="fa fa-clock" /> Time Loss – Check Tracking
        </h4>

        <a className="btn btn-primary" href="/add-timeloss">
          Add New
        </a>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Check #</th>
                <th>Payee</th>
                <th>Total</th>
                <th>Fee</th>
                <th>Paid</th>
                <th>Method</th>
                <th>Cleared</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDateMMDDYY(r.date)}</td>
                    <td>{r.checkNo}</td>
                    <td>{r.payee}</td>
                    <td>{money(r.totalCheck)}</td>
                    <td>{money(r.iwjFee)}</td>
                    <td>{money(r.paidOut)}</td>
                    <td>{r.method}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.cleared ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {r.cleared ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setEditData(r);
                          setIsEditOpen(true);
                        }}
                      >
                        <i className="fa fa-edit" />
                      </button>

                      <button
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() => {
                          setViewData(r);
                          setIsViewOpen(true);
                        }}
                      >
                        <i className="fa fa-eye" />
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(r)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}

  {isEditOpen && editData && (
  <>
    <div className="modal fade show d-block">
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-3">
          <h5>Edit Time Loss</h5>

          {/* Date */}
          <input
            className="form-control mb-2"
            type="date"
            value={editData.date.slice(0, 10)}
            onChange={(e) =>
              setEditData({ ...editData, date: e.target.value })
            }
          />

          {/* Check Number */}
          <input
            className="form-control mb-2"
            placeholder="Check Number"
            value={editData.checkNo}
            onChange={(e) =>
              setEditData({ ...editData, checkNo: e.target.value })
            }
          />

          {/* Payee */}
          <input
            className="form-control mb-2"
            placeholder="Payee"
            value={editData.payee}
            onChange={(e) =>
              setEditData({ ...editData, payee: e.target.value })
            }
          />

          {/* Total Check */}
          <input
            type="number"
            className="form-control mb-2"
            placeholder="Total Check"
            value={editData.totalCheck}
            onChange={(e) =>
              setEditData({
                ...editData,
                totalCheck: Number(e.target.value),
              })
            }
          />

          {/* IWJ Fee */}
          <input
            type="number"
            className="form-control mb-2"
            placeholder="IWJ Fee"
            value={editData.iwjFee}
            onChange={(e) =>
              setEditData({
                ...editData,
                iwjFee: Number(e.target.value),
              })
            }
          />

          {/* Paid Out */}
          <input
            type="number"
            className="form-control mb-2"
            placeholder="Paid Out"
            value={editData.paidOut}
            onChange={(e) =>
              setEditData({
                ...editData,
                paidOut: Number(e.target.value),
              })
            }
          />

          {/* Method */}
          <select
            className="form-select mb-2"
            value={editData.method}
            onChange={(e) =>
              setEditData({
                ...editData,
                method: e.target.value,
              })
            }
          >
            <option value="Deposit">Deposit</option>
            <option value="Pick-up">Pick-up</option>
            <option value="Wire">Wire</option>
          </select>

          {/* Cleared */}
          <select
            className="form-select mb-2"
            value={editData.cleared ? "Yes" : "No"}
            onChange={(e) =>
              setEditData({
                ...editData,
                cleared: e.target.value === "Yes",
              })
            }
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>

          {/* Bank */}
          <input
            className="form-control mb-2"
            placeholder="Bank"
            value={editData.bank}
            onChange={(e) =>
              setEditData({ ...editData, bank: e.target.value })
            }
          />

          {/* Account Number */}
          <input
            className="form-control mb-2"
            placeholder="Account Number"
            value={editData.accountNumber}
            onChange={(e) =>
              setEditData({
                ...editData,
                accountNumber: e.target.value,
              })
            }
          />

          {/* Notes */}
          <textarea
            className="form-control mb-2"
            placeholder="Notes"
            value={editData.notes}
            onChange={(e) =>
              setEditData({ ...editData, notes: e.target.value })
            }
          />

          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={handleUpdate}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      className="modal-backdrop fade show"
      onClick={() => setIsEditOpen(false)}
    />
  </>
)}


      {/* ================= VIEW MODAL ================= */}

      {isViewOpen && viewData && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content p-3">
                <h5>View Time Loss</h5>

                <p><strong>Date:</strong> {formatDateMMDDYY(viewData.date)}</p>
                <p><strong>Check #:</strong> {viewData.checkNo}</p>
                <p><strong>Payee:</strong> {viewData.payee}</p>
                <p><strong>Total:</strong> {money(viewData.totalCheck)}</p>
                <p><strong>IWJ Fee:</strong> {money(viewData.iwjFee)}</p>
                <p><strong>Paid Out:</strong> {money(viewData.paidOut)}</p>
                <p><strong>Method:</strong> {viewData.method}</p>
                <p><strong>Bank:</strong> {viewData.bank}</p>
                <p><strong>Account:</strong> {viewData.accountNumber}</p>
                <p><strong>Cleared:</strong> {viewData.cleared ? "Yes" : "No"}</p>
                <p><strong>Notes:</strong> {viewData.notes}</p>

                <div className="text-end">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsViewOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setIsViewOpen(false)}
          />
        </>
      )}
    </>
  );
}
