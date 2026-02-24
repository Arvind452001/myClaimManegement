import React, { useEffect, useMemo, useState } from "react";
import { casesAPI, timeLossAPI } from "../utils/api";

type Method = "Deposit" | "Pick-up";

type TimelossForm = {
  caseId: string;
  date: string;
  checkNumber: string;
  payee: string;
  totalCheck: string;
  iwjFee: string;
  paidOut: string;
  method: Method;
  cleared: boolean;
  bank: string;
  accountNumber: string;
  notes: string;
};

export default function AddTimelossPage(): JSX.Element {
  const initialState = useMemo<TimelossForm>(
    () => ({
      caseId: "",
      date: "",
      checkNumber: "",
      payee: "",
      totalCheck: "",
      iwjFee: "",
      paidOut: "",
      method: "Deposit",
      cleared: false,
      bank: "",
      accountNumber: "",
      notes: "",
    }),
    [],
  );

  const [form, setForm] = useState<TimelossForm>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [cases, setCases] = useState<{ _id: string; caseId: string }[]>([]);
  // console.log(cases)
  const update = <K extends keyof TimelossForm>(
    key: K,
    value: TimelossForm[K],
  ) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const reset = () => setForm(initialState);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        caseId: form.caseId,
        date: form.date,
        checkNumber: form.checkNumber,
        payee: form.payee,
        totalCheck: Number(form.totalCheck),
        iwjFee: Number(form.iwjFee),
        paidOut: Number(form.paidOut),
        method: form.method,
        accountNumber: form.accountNumber,
        bank: form.bank,
        cleared: form.cleared,
        notes: form.notes,
      };

      await timeLossAPI.create(payload);
      alert("Timeloss saved successfully.");
      reset();
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await casesAPI.getAllCases(); // use correct method
        const data = res.data || res || [];
        setCases(data);
      } catch (error) {
        console.error("Failed to fetch cases");
      }
    };

    fetchCases();
  }, []);
  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <h4 className="mb-0">
          <i className="fa fa-clock" /> Add Timeloss
        </h4>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row">
              {/* Case ID */}
              <div className="col-md-6 mb-2">
                <label className="form-label">Case ID</label>
                <select
                  className="form-select"
                  value={form.caseId}
                  onChange={(e) => update("caseId", e.target.value)}
                  required
                >
                  <option value="">Select Case</option>

                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.caseId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="col-md-6 mb-2">
                <label className="form-label">Date</label>
                <input
                  className="form-control"
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  required
                />
              </div>

              {/* Check Number */}
              <div className="col-md-4 mb-2">
                <label className="form-label">Check #</label>
                <input
                  className="form-control"
                  value={form.checkNumber}
                  onChange={(e) => update("checkNumber", e.target.value)}
                />
              </div>

              {/* Payee */}
              <div className="col-md-4 mb-2">
                <label className="form-label">Payee</label>
                <input
                  className="form-control"
                  value={form.payee}
                  onChange={(e) => update("payee", e.target.value)}
                />
              </div>

              {/* Total Check */}
              <div className="col-md-4 mb-2">
                <label className="form-label">Total Check</label>
                <input
                  className="form-control"
                  type="number"
                  value={form.totalCheck}
                  onChange={(e) => update("totalCheck", e.target.value)}
                />
              </div>

              {/* IWJ Fee */}
              <div className="col-md-4 mb-2">
                <label className="form-label">IWJ Fee</label>
                <input
                  className="form-control"
                  type="number"
                  value={form.iwjFee}
                  onChange={(e) => update("iwjFee", e.target.value)}
                />
              </div>

              {/* Paid Out */}
              <div className="col-md-4 mb-2">
                <label className="form-label">Paid Out</label>
                <input
                  className="form-control"
                  type="number"
                  value={form.paidOut}
                  onChange={(e) => update("paidOut", e.target.value)}
                />
              </div>

              {/* Method */}
              <div className="col-md-4 mb-2">
                <label className="form-label">Method</label>
                <select
                  className="form-select"
                  value={form.method}
                  onChange={(e) => update("method", e.target.value as Method)}
                >
                  <option value="Deposit">Deposit</option>
                  {/* <option value="Pick-up">Pick-up</option> */}
                </select>
              </div>

              {/* Bank */}
              <div className="col-md-6 mb-2">
                <label className="form-label">Bank</label>
                <input
                  className="form-control"
                  value={form.bank}
                  onChange={(e) => update("bank", e.target.value)}
                />
              </div>

              {/* Account Number */}
              <div className="col-md-6 mb-2">
                <label className="form-label">Account Number</label>
                <input
                  className="form-control"
                  value={form.accountNumber}
                  onChange={(e) => update("accountNumber", e.target.value)}
                />
              </div>

              {/* Cleared */}
              <div className="col-md-6 mb-2">
                <label className="form-label">Cleared</label>
                <select
                  className="form-select"
                  value={form.cleared ? "Yes" : "No"}
                  onChange={(e) => update("cleared", e.target.value === "Yes")}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {/* Notes */}
              <div className="col-12 mb-2">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>

              <div className="col-12 d-flex gap-2">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>

                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={reset}
                  disabled={submitting}
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
