import React from "react";

type Props = {
  caseId: string | null;
  communication: any;
  setCommunication: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  onSave: () => void;
};

export default function CommunicationTab({
  caseId,
  communication,
  setCommunication,
  saving,
  onSave,
}: Props) {
  return (
    <div className="tab-pane fade show active">
      <div className="section-card">
        <div className="section-title">
          <i className="fa fa-comments" /> Communication Log
        </div>

        <div className="row g-3">

          {/* Case ID (readonly) */}
          {/* <div className="col-md-4">
            <label className="form-label">Case ID</label>
            <input
              className="form-control bg-light"
              value={caseId || ""}
              readOnly
            />
          </div> */}

          {/* Regarding */}
          <div className="col-md-4">
            <label className="form-label">Regarding</label>
            <select
              className="form-select"
              value={communication.regarding}
              onChange={(e) =>
                setCommunication((prev: any) => ({
                  ...prev,
                  regarding: e.target.value,
                }))
              }
            >
              <option value="">Select</option>
              <option value="Client">Client</option>
              <option value="Employer">Employer</option>
              <option value="Provider">Provider</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={communication.status}
              onChange={(e) =>
                setCommunication((prev: any) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              <option value="">Select</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          {/* Message */}
          <div className="col-md-12">
            <label className="form-label">Message</label>
            <textarea
              className="form-control"
              rows={3}
              value={communication.message}
              onChange={(e) =>
                setCommunication((prev: any) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
            />
          </div>

          {/* Action */}
         <div className="col-md-6">
  <label className="form-label">Action</label>
  <select
    className="form-select"
    value={communication.action}
    onChange={(e) =>
      setCommunication((prev: any) => ({
        ...prev,
        action: e.target.value,
      }))
    }
  >
    <option value="">Select Action</option>
    <option value="Call Back">Call Back</option>
    {/* <option value="Email Sent">Email Sent</option> */}
    {/* <option value="Follow-Up Required">Follow-Up Required</option> */}
    {/* <option value="Escalated">Escalated</option> */}
    {/* <option value="No Action">No Action</option> */}
    {/* <option value="Resolved">Resolved</option> */}
  </select>
</div>

          {/* Note */}
          <div className="col-md-6">
            <label className="form-label">Note</label>
            <input
              className="form-control"
              value={communication.note}
              onChange={(e) =>
                setCommunication((prev: any) => ({
                  ...prev,
                  note: e.target.value,
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
          {saving ? "Saving..." : "Save Communication"}
        </button>
      </div>
    </div>
  );
}