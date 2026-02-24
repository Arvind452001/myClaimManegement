import React from "react";
import { ProtestForm } from "../types/case.types";

type ProtestTabProps = {
  caseId: string | null;
  protest: ProtestForm;
  setProtest: React.Dispatch<React.SetStateAction<ProtestForm>>;
  saving: boolean;
  onSave: () => void;
};

const ProtestTab: React.FC<ProtestTabProps> = ({
  caseId,
  protest,
  setProtest,
  saving,
  onSave,
}) => {
  return (
    <div className="tab-pane fade show active">
      <div className="section-card">
        <div className="section-title">
          <i className="fa fa-scale-balanced" /> Protest Entry
        </div>

        <div className="row g-3">

          {/* DO Date */}
          <div className="col-md-4">
            <label className="form-label">DO Date</label>
            <input
              type="date"
              className="form-control"
              value={protest.doDate}
              onChange={(e) =>
                setProtest((p) => ({
                  ...p,
                  doDate: e.target.value,
                }))
              }
            />
          </div>

          {/* Deadline */}
          <div className="col-md-4">
            <label className="form-label text-danger">
              Deadline *
            </label>
            <input
              type="date"
              className="form-control"
              value={protest.deadline}
              onChange={(e) =>
                setProtest((p) => ({
                  ...p,
                  deadline: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Status */}
          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={protest.status}
              onChange={(e) =>
                setProtest((p) => ({
                  ...p,
                  status: e.target.value as ProtestForm["status"],
                }))
              }
            >
            <option value="Protested">Protested</option>
              <option value="Appealed">Appealed</option>
              <option value="NoAction">No Action</option>
            </select>
          </div>

          {/* Description */}
          <div className="col-md-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={protest.description}
              onChange={(e) =>
                setProtest((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
            />
          </div>

          {/* Notes */}
          <div className="col-md-12">
            <label className="form-label">Notes</label>
            <textarea
              className="form-control"
              rows={3}
              value={protest.notes}
              onChange={(e) =>
                setProtest((p) => ({
                  ...p,
                  notes: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          className="btn btn-primary mt-3"
          type="button"
          disabled={saving}
          onClick={() => {
            if (!caseId) {
              alert("Case ID missing.");
              return;
            }

            if (!protest.deadline) {
              alert("Deadline is required.");
              return;
            }

            onSave();
          }}
        >
          {saving ? "Saving..." : "Save Protest"}
        </button>
      </div>
    </div>
  );
};

export default ProtestTab;