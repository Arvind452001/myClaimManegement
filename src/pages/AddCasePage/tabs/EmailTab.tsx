import React from "react";
import { EmailDirection, EmailForm } from "../types/case.types";

type Props = {
  caseId: string | null;
  email: EmailForm;
  setEmail: React.Dispatch<React.SetStateAction<EmailForm>>;
  saving: boolean;
  loggedInUser: any;
  onSave: () => void;
};

export default function EmailsTab({
  caseId,
  email,
  setEmail,
  saving,
  loggedInUser,
  onSave,
}: Props) {
  return (
    <div className="tab-pane fade show active">
      <div className="section-card">
        <div className="section-title">
          <i className="fa fa-envelope" /> Email Log
        </div>

        <div className="row g-3">
          {/* Case */}
          {/* <div className="col-md-4">
            <label className="form-label">Case</label>
            <input
              className="form-control bg-light"
              value={caseId || ""}
              readOnly
            />
          </div> */}

          {/* Date/Time */}
          {/* <div className="col-md-4">
            <label className="form-label">Email Date/Time</label>
            <input
              className="form-control bg-light"
              value={new Date().toLocaleString()}
              readOnly
            />
          </div> */}

          {/* Direction */}
          <div className="col-md-4">
            <label className="form-label">Direction</label>
            <select
              className="form-select"
              value={email.direction}
              onChange={(e) =>
                setEmail((prev) => ({
                  ...prev,
                  direction: e.target.value as EmailDirection,
                }))
              }
            >
              <option value="Incoming">Incoming</option>
              <option value="Outgoing">Outgoing</option>
            </select>
          </div>

          {/* To */}
          <div className="col-md-6">
            <label className="form-label">To</label>
            <input
              className="form-control"
              value={email.to}
              onChange={(e) =>
                setEmail((prev) => ({
                  ...prev,
                  to: e.target.value,
                }))
              }
            />
          </div>

          {/* CC */}
          <div className="col-md-6">
            <label className="form-label">CC</label>
            <input
              className="form-control"
              value={email.cc}
              onChange={(e) =>
                setEmail((prev) => ({
                  ...prev,
                  cc: e.target.value,
                }))
              }
            />
          </div>

          {/* Subject */}
          <div className="col-md-12">
            <label className="form-label">Subject</label>
            <input
              className="form-control"
              value={email.subject}
              onChange={(e) =>
                setEmail((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))
              }
            />
          </div>

          {/* Body */}
          <div className="col-md-12">
            <label className="form-label">Email Body</label>
            <textarea
              className="form-control"
              rows={5}
              value={email.body}
              onChange={(e) =>
                setEmail((prev) => ({
                  ...prev,
                  body: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <button
          className="btn btn-primary mt-3"
          type="button"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Email"}
        </button>
      </div>
    </div>
  );
}
