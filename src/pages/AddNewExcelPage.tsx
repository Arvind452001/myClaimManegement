import React, { useMemo, useState } from "react";
import { excelAPI } from "../utils/api";

type SheetType = "Contacts" | "Tasks" | "PNCs" | "Cases";

type ExcelForm = {
  sheetName: string;
  sheetType: SheetType;
  excelFile: File | null;
};

export default function AddNewExcelPage(): JSX.Element {
  const initialState = useMemo<ExcelForm>(
    () => ({
      sheetName: "",
      sheetType: "Contacts",
      excelFile: null,
    }),
    []
  );

  const [form, setForm] = useState<ExcelForm>(initialState);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof ExcelForm>(key: K, value: ExcelForm[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const reset = () => setForm(initialState);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.sheetName.trim()) {
      alert("Sheet Name is required.");
      return;
    }

    if (!form.excelFile) {
      alert("Please upload an Excel file.");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ Create FormData
      const formData = new FormData();
      formData.append("sheetName", form.sheetName);
      formData.append("sheetType", form.sheetType);
      formData.append("file", form.excelFile);

      // ✅ API CALL
      const response = await excelAPI.upload(formData)
// console.log("response",formData)
      // if (!response.ok) {
      //   throw new Error("Upload failed");
      // }

      alert("Excel uploaded successfully.");

      reset();

      // optional redirect
      window.location.href = "/excel-list";
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong while uploading.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>Add New Excel</strong>

        <div>
          <a className="btn btn-primary" href="/excel-list">
            <i className="fa fa-eye" /> View All
          </a>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Sheet Name</label>
              <input
                className="form-control"
                type="text"
                value={form.sheetName}
                onChange={(e) => update("sheetName", e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Sheet Type</label>
              <select
                className="form-select"
                value={form.sheetType}
                onChange={(e) =>
                  update("sheetType", e.target.value as SheetType)
                }
              >
                <option value="Contacts">Contacts</option>
                <option value="Tasks">Tasks</option>
                <option value="PNCs">PNCs</option>
                <option value="Cases">Cases</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">Excel File</label>
              <input
                className="form-control"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) =>
                  update("excelFile", e.target.files?.[0] ?? null)
                }
              />
              {form.excelFile && (
                <div className="small text-muted mt-1">
                  Selected: {form.excelFile.name}
                </div>
              )}
            </div>

            <div className="col-12 d-flex gap-2">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={reset}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
