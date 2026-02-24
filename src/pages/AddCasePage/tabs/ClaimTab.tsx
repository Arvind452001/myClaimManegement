import React from "react";

type VocationalStatus =
  | "VR"
  | "AWA"
  | "Plan Development"
  | "Plan Implementation"
  | "Closed";

type YesNo = "Yes" | "No";

type Props = {
  overview: any;
  setOverview: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
};

export default function ClaimTab({
  overview,
  setOverview,
  saving,
  onSave,
  onBack,
}: Props) {
  return (
    <div className="tab-pane fade show active">
      <div className="section-card">
        <div className="section-title">
          <i className="fa fa-file-contract" /> Claim Information
        </div>

        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Claim No</label>
            <input
              className="form-control"
              value={overview.claimNo}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  claimNo: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">DOI</label>
            <input
              type="date"
              className="form-control"
              value={overview.doi}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  doi: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">CM</label>
            <input
              className="form-control"
              value={overview.cm}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  cm: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">CM Phone</label>
            <input
              className="form-control"
              value={overview.cmPhone}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  cmPhone: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Supervisor</label>
            <input
              className="form-control"
              value={overview.supervisor}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  supervisor: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Supervisor Phone</label>
            <input
              className="form-control"
              value={overview.supervisorPhone}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  supervisorPhone: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Employer</label>
            <input
              className="form-control"
              value={overview.employer}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  employer: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">TPA</label>
            <input
              className="form-control"
              value={overview.tpa}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  tpa: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">TPA Phone</label>
            <input
              className="form-control"
              value={overview.tpaPhone}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  tpaPhone: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">SI</label>
            <input
              className="form-control"
              value={overview.si}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  si: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">SI Phone</label>
            <input
              className="form-control"
              value={overview.siPhone}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  siPhone: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Provider</label>
            <input
              className="form-control"
              value={overview.provider}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  provider: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Provider Phone</label>
            <input
              className="form-control"
              value={overview.providerPhone}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  providerPhone: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">VRC</label>
            <input
              className="form-control"
              value={overview.vrc}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  vrc: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">VRC Phone</label>
            <input
              className="form-control"
              value={overview.vrcPhone}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  vrcPhone: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Vocational Status</label>
            <select
              className="form-select"
              value={overview.vocationalStatus}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  vocationalStatus: e.target.value as VocationalStatus,
                }))
              }
            >
              <option value="">Select Status</option>
              <option value="VR">VR</option>
              <option value="AWA">AWA</option>
              <option value="Plan Development">Plan Development</option>
              <option value="Plan Implementation">
                Plan Implementation
              </option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">ROA</label>
            <input
              className="form-control"
              value={overview.roa}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  roa: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Allowed Conditions</label>
            <input
              className="form-control"
              value={overview.allowedConditions}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  allowedConditions: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">TL</label>
            <select
              className="form-select"
              value={overview.tl}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  tl: e.target.value as YesNo,
                }))
              }
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Last APF</label>
            <input
              type="date"
              className="form-control"
              value={overview.lastApf}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  lastApf: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Last WSF</label>
            <input
              type="date"
              className="form-control"
              value={overview.lastWsf}
              onChange={(e) =>
                setOverview((p: any) => ({
                  ...p,
                  lastWsf: e.target.value,
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>

        <button
          className="btn btn-primary"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save & Next"}
        </button>
      </div>
    </div>
  );
}
