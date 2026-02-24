import React from "react";
import { DocsForm } from "../types/case.types";

type Props = {
  caseId: string | null;
  docs: DocsForm;
  setDocs: React.Dispatch<React.SetStateAction<DocsForm>>;
  saving: boolean;
  onSave: () => void;
};

export default function DocumentsTab({
  caseId,
  docs,
  setDocs,
  saving,
  onSave,
}: Props) {
  const handleChange = (field: keyof DocsForm, value: any) => {
    setDocs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="tab-pane fade show active">
      <div className="section-card">
        <div className="section-title">
          <i className="fa fa-folder-open" /> Upload Document
        </div>

        <div className="row g-3">
          {/* Case ID (Readonly) */}
          {/* <div className="col-md-6">
            <label className="form-label">Case</label>
            <input
              className="form-control bg-light"
              value={caseId || ""}
              readOnly
            />
          </div> */}

          {/* Category */}
          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={docs.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Medical">Medical</option>
              <option value="Vocational">Vocational</option>
              <option value="Dept Letters">Dept Letters</option>
              <option value="Draft Copies">Draft Copies</option>
              <option value="WSF">WSF</option>
              <option value="SI CFU">SI CFU</option>
            </select>
          </div>

          {/* Description */}
          <div className="col-md-12">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter document description"
              value={docs.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div className="col-md-12">
            <label className="form-label">Upload File</label>
            <input
              className="form-control"
              type="file"
              onChange={(e) =>
                handleChange("file", e.target.files?.[0] ?? null)
              }
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-4">
          <button
            className="btn btn-primary"
            type="button"
            disabled={
              saving || !docs.file || !docs.category || !docs.description
            }
            onClick={() => {
              if (!caseId) {
                alert("Please create/save case first.");
                return;
              }

              onSave();
            }}
          >
            {saving ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </div>
    </div>
  );
}
