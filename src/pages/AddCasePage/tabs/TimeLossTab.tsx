import React, { useEffect } from "react";
import { TLForm } from "../types/case.types";

type Props = {
  tl: TLForm;
  setTl: React.Dispatch<React.SetStateAction<TLForm>>;
  saving: boolean;
  onSave: (payload: any) => void;
};

export default function TimeLossTab({
  tl,
  setTl,
  saving,
  onSave,
}: Props) {

  // Auto calculate paidOut
  useEffect(() => {
    const total = Number(tl.totalCheck || 0);
    const fee = Number(tl.iwjFee || 0);

    setTl((prev) => ({
      ...prev,
      paidOut: String(total - fee),
    }));
  }, [tl.totalCheck, tl.iwjFee]);

  const handleSubmit = () => {
    const payload = {
      date: tl.date,
      checkNumber: tl.checkNumber,
      payee: tl.payee,
      totalCheck: Number(tl.totalCheck),
      iwjFee: Number(tl.iwjFee),
      paidOut: Number(tl.paidOut),
      method: tl.method,
      accountNumber: tl.accountNumber,
      bank: tl.bank,
      cleared: tl.cleared,
      notes: tl.notes,
    };

    onSave(payload);
  };

  return (
    <div className="section-card">
      <div className="section-title">
        <i className="fa fa-money-bill me-2" />
        Time-Loss Payment Entry
      </div>

      <div className="row g-3">

        <div className="col-md-4">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={tl.date}
            onChange={(e) =>
              setTl((p) => ({ ...p, date: e.target.value }))
            }
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Check Number</label>
          <input
            className="form-control"
            value={tl.checkNumber}
            onChange={(e) =>
              setTl((p) => ({ ...p, checkNumber: e.target.value }))
            }
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Payee</label>
          <input
            className="form-control"
            value={tl.payee}
            onChange={(e) =>
              setTl((p) => ({ ...p, payee: e.target.value }))
            }
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Total Check</label>
          <input
            type="number"
            className="form-control"
            value={tl.totalCheck}
            onChange={(e) =>
              setTl((p) => ({ ...p, totalCheck: e.target.value }))
            }
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">IWJ Fee</label>
          <input
            type="number"
            className="form-control"
            value={tl.iwjFee}
            onChange={(e) =>
              setTl((p) => ({ ...p, iwjFee: e.target.value }))
            }
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Paid Out</label>
          <input
            type="number"
            className="form-control bg-light"
            value={tl.paidOut}
            readOnly
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Method</label>
          <select
            className="form-select"
            value={tl.method}
            onChange={(e) =>
              setTl((p) => ({
                ...p,
                method: e.target.value as TLForm["method"],
              }))
            }
          >
            <option value="Deposit">Deposit</option>
            <option value="Check">Check</option>
            <option value="Wire">Wire</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Account Number</label>
          <input
            className="form-control"
            value={tl.accountNumber}
            onChange={(e) =>
              setTl((p) => ({ ...p, accountNumber: e.target.value }))
            }
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Bank</label>
          <input
            className="form-control"
            value={tl.bank}
            onChange={(e) =>
              setTl((p) => ({ ...p, bank: e.target.value }))
            }
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Cleared</label>
          <select
            className="form-select"
            value={tl.cleared ? "true" : "false"}
            onChange={(e) =>
              setTl((p) => ({
                ...p,
                cleared: e.target.value === "true",
              }))
            }
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="col-md-12">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            rows={3}
            value={tl.notes}
            onChange={(e) =>
              setTl((p) => ({ ...p, notes: e.target.value }))
            }
          />
        </div>

      </div>

      <div className="d-flex justify-content-end mt-4">
        <button
          className="btn btn-primary px-4"
          type="button"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </div>
  );
}