import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { feeListAPI } from "../utils/api";

type AgreementType = "Standard" | "Custom";
type GuideType = "A" | "B" | "C" | "D";
type YesNo = "Yes" | "No";
type DisbursementMethod = "Deposit" | "Pick-Up";
type HoldStatus = "None" | "Client Request" | "Missing Docs" | "Compliance";

export default function ClientInfoPage(): JSX.Element {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState<any>({
    clientName: "",
    claimNumber: "",
    doi: "",
    agreementType: "Standard",
    guide: "A",
    timeLossStatus: "Yes",
    activeStatus: "Inactive",
  });

  const [disbursement, setDisbursement] = useState<any>({
    method: "Deposit",
    bankName: "",
    accountLast4: "",
    bankingVerified: "Yes",
    verifiedDate: "",
    verifiedBy: "",
    holdStatus: "None",
    holdReason: "",
    notes: "",
  });

  useEffect(() => {
    const fetchSingleUser = async () => {
      try {
        setLoading(true);

        const res = await feeListAPI.getById(id!);
       const data = res?.data;

        if (!data) return;

        // 🔥 Map Overview Data
        setOverview({
          clientName: data.clientName || "",
          claimNumber: data._id || "",
          doi: data.nextDueDate
            ? new Date(data.nextDueDate).toLocaleDateString()
            : "",
          agreementType: data.agreement || "Standard",
          guide: data.guide ? data.guide.toUpperCase() : "A",
          timeLossStatus: data.timeLoss || "Yes",
          activeStatus:
            data.status === "Fee Due" ? "Active" : "Inactive",
        });

        // 🔥 Map Disbursement Data
        setDisbursement({
          method: data.paymentMethod || "Deposit",
          bankName: data.bank || "",
          accountLast4: data.accountLast4
            ? `****${data.accountLast4}`
            : "",
          bankingVerified: "Yes",
          verifiedDate: data.updatedAt
            ? new Date(data.updatedAt).toLocaleDateString()
            : "",
          verifiedBy: data.createdBy?.name || "",
          holdStatus: "None",
          holdReason: "",
          notes: data.notes || "",
        });

      } catch (error) {
        console.error("Single fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSingleUser();
    }
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;

  const badgeClass =
    overview.activeStatus === "Active" ? "badge-clear" : "badge-hold";

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">TL Client Information</h4>
        <span className={`badge ${badgeClass} px-3 py-2`}>
          {overview.activeStatus}
        </span>
      </div>

      <div className="row g-4">

        {/* CLIENT OVERVIEW */}
        <div className="col-lg-4">
          <div className="card p-4">
            <h6 className="section-title">Client Overview</h6>

            <div className="mb-2">
              <div className="label">Client Name</div>
              <div className="value">{overview.clientName}</div>
            </div>

            {/* <div className="mb-2">
              <div className="label">Claim Number</div>
              <div className="value">{overview.claimNumber}</div>
            </div> */}

             <div className="mb-2">
              <div className="label">timeLoss</div>
              <div className="value">{overview.timeLoss == true?"YES":"NO"}</div>
            </div>

            <div className="mb-2">
              <div className="label">Date of Injury (DOI)</div>
              <div className="value">{overview.doi}</div>
            </div>

            <div className="mb-2">
              <div className="label">Agreement Type</div>
              <div className="value">{overview.agreementType}</div>
            </div>

            <div className="mb-3">
              <div className="label">Guide</div>
              <div className="value">{overview.guide}</div>
            </div>

            <div className="mb-3">
              <div className="label">Time Loss Status</div>
              <span
                className={`badge ${
                  overview.timeLossStatus === "Yes"
                    ? "bg-success"
                    : "bg-secondary"
                }`}
              >
                {overview.timeLossStatus}
              </span>
            </div>
          </div>
        </div>

        {/* DISBURSEMENT & BANKING */}
        <div className="col-lg-8">
          <div className="card p-4">
            <h6 className="section-title">Disbursement & Banking</h6>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Disbursement Method</label>
                <select
                  className="form-select"
                  value={disbursement.method}
                  onChange={(e) =>
                    setDisbursement((p: any) => ({
                      ...p,
                      method: e.target.value,
                    }))
                  }
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Pick-Up">Pick-Up</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Bank Name</label>
                <input
                  className="form-control"
                  value={disbursement.bankName}
                  onChange={(e) =>
                    setDisbursement((p: any) => ({
                      ...p,
                      bankName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Account (Last 4)</label>
                <input
                  className="form-control masked"
                  value={disbursement.accountLast4}
                  onChange={(e) =>
                    setDisbursement((p: any) => ({
                      ...p,
                      accountLast4: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Banking Verified</label>
                <select
                  className="form-select"
                  value={disbursement.bankingVerified}
                  onChange={(e) =>
                    setDisbursement((p: any) => ({
                      ...p,
                      bankingVerified: e.target.value,
                    }))
                  }
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Verified Date</label>
                <input
                  className="form-control"
                  value={disbursement.verifiedDate}
                  readOnly
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Verified By</label>
                <input
                  className="form-control"
                  value={disbursement.verifiedBy}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Hold Status</label>
                <select
                  className="form-select"
                  value={disbursement.holdStatus}
                  onChange={(e) =>
                    setDisbursement((p: any) => ({
                      ...p,
                      holdStatus: e.target.value,
                    }))
                  }
                >
                  <option value="None">None</option>
                  <option value="Client Request">Client Request</option>
                  <option value="Missing Docs">Missing Docs</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Hold Reason</label>
                <input
                  className="form-control"
                  value={disbursement.holdReason}
                  onChange={(e) =>
                    setDisbursement((p: any) => ({
                      ...p,
                      holdReason: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-12">
                <label className="form-label">Disbursement Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={disbursement.notes}
                  onChange={(e) =>
                    setDisbursement((p: any) => ({
                      ...p,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="text-end mt-4">
              <button className="btn btn-primary px-4" type="button">
                <i className="fa fa-save me-1" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .label {
          font-size: 0.85rem;
          color: #6b7280;
        }
        .value {
          font-weight: 600;
        }
        .masked {
          letter-spacing: 2px;
        }
        .badge-hold {
          background: #dc2626;
        }
        .badge-clear {
          background: #16a34a;
        }
        .section-title {
          font-weight: 700;
          margin-bottom: 16px;
        }
      `}</style>
    </>
  );
}