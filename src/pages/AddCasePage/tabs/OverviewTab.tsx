import React from "react";

type Props = {
  overview: any;
  setOverview: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  onSave: () => void;
};

export default function OverviewTab({
  overview,
  setOverview,
  saving,
  onSave,
}: Props) {
  return (
    <div className="tab-pane fade show active">
      <div className="section-card">
        <div className="row g-3">
          <div className="col-md-12">
            <label className="form-label">Case Title</label>
            <input
              className="form-control"
              value={overview.caseTitle}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  caseTitle: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">
          <i className="fa fa-user" /> Client Information
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={overview.clientName}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  clientName: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Phone</label>
            <input
              className="form-control"
              value={overview.clientPhone}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  clientPhone: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Address</label>
            <input
              className="form-control"
              value={overview.clientAddress}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  clientAddress: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Work</label>
            <input
              className="form-control"
              value={overview.clientWork}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  clientWork: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">DOB</label>
            <input
              type="date"
              className="form-control"
              value={overview.clientDob}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  clientDob: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Emergency Contact</label>
            <input
              className="form-control"
              value={overview.emergencyContact}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  emergencyContact: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary"
        type="button"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
