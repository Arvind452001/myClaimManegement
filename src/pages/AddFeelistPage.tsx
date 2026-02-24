import React, { useMemo, useState } from "react";
import { feeListAPI } from "../utils/api";

type TimeLossOption = "Yes" | "No";
type PaymentMethod = "Pick-Up" | "Deposit";

type FeeListForm = {
  client: string;
  timeLoss: TimeLossOption;
  agreement: string;
  method: PaymentMethod;
  bank: string;
  accountLast4: string;
  guide: string;
  notes: string;
};

export default function AddFeelistPage(): JSX.Element {
  const initialState = useMemo<FeeListForm>(
    () => ({
      client: "",
      timeLoss: "Yes",
      agreement: "",
      method: "Pick-Up",
      bank: "",
      accountLast4: "",
      guide: "",
      notes: "",
    }),
    []
  );

  const [form, setForm] = useState<FeeListForm>(initialState);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FeeListForm>(key: K, value: FeeListForm[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const reset = () => setForm(initialState);

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.client.trim()) {
    alert("Client is required.");
    return;
  }

  if (form.accountLast4 && !/^\d{4}$/.test(form.accountLast4)) {
    alert("Account Last 4 must be exactly 4 digits.");
    return;
  }

  setSubmitting(true);

  try {
    const payload = {
      clientName: form.client,
      timeLoss: form.timeLoss,
      agreement: form.agreement,
      paymentMethod: form.method,
      bank: form.bank,
      accountLast4: form.accountLast4,
      guide: form.guide,
      notes: form.notes,
      nextDueDate: new Date().toISOString(),
      status: "Fee Due",
    };

    const response = await feeListAPI.create(payload);

    console.log("Created:", response);
    alert("FeeList saved successfully!");

    reset();
  } catch (error: any) {
    console.error(error?.response?.data || error.message);
    alert("Something went wrong while saving.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div>
      <div className="d-flex justify-content-between mb-2">
        <h4>
          <i className="fa fa-dollar" /> Add Feelist
        </h4>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-md-6 mb-2">
                <label className="form-label">Client</label>
                <input
                  className="form-control"
                  value={form.client}
                  onChange={(e) => update("client", e.target.value)}
                  placeholder="Client name"
                />
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label">Time Loss</label>
                <select
                  className="form-select"
                  value={form.timeLoss}
                  onChange={(e) => update("timeLoss", e.target.value as TimeLossOption)}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label">Agreement</label>
                <input
                  className="form-control"
                  value={form.agreement}
                  onChange={(e) => update("agreement", e.target.value)}
                  placeholder="e.g. Standard / Custom"
                />
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label">P/U or Deposit</label>
                <select
                  className="form-select"
                  value={form.method}
                  onChange={(e) => update("method", e.target.value as PaymentMethod)}
                >
                  <option value="Pick-Up">Pick-Up</option>
                  <option value="Deposit">Deposit</option>
                </select>
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label">Bank</label>
                <input
                  className="form-control"
                  value={form.bank}
                  onChange={(e) => update("bank", e.target.value)}
                  placeholder="Bank name"
                />
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label">Account Last 4</label>
                <input
                  className="form-control"
                  value={form.accountLast4}
                  onChange={(e) => update("accountLast4", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  inputMode="numeric"
                  maxLength={4}
                />
                <div className="small text-muted">Only 4 digits</div>
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label">Guide</label>
                <input
                  className="form-control"
                  value={form.guide}
                  onChange={(e) => update("guide", e.target.value)}
                  placeholder="A / B / C / D"
                />
              </div>

              <div className="col-md-6 mb-2">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Internal notes..."
                  rows={3}
                />
              </div>

              <div className="col-12 d-flex gap-2 mt-2">
                <button className="btn btn-secondary" type="button" onClick={reset} disabled={submitting}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
