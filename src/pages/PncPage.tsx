import React, { useEffect, useState } from "react";

import { formatDateMMDDYY } from "../utils/dateUtils";
import { clientsAPI } from "../utils/api";

type IntakeStage = "Review" | "Mark Done";
type IntakeStatus = "Open" | "Closed";

type PncRow = {
  id: string;
  clientName: string;
  employer: string;
  claimNo: string;
  accidentDate: string;
  stage: IntakeStage;
  status: IntakeStatus;
};

export default function PncPage(): JSX.Element {
  const [rows, setRows] = useState<PncRow[]>([]);
  const [loading, setLoading] = useState(false);
  // console.log("rows1",rows)
  // ================= FETCH CLIENTS =================
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);

      const res = await clientsAPI.getAll();
      // Your response structure:
      // { statusCode: 200, data: [...], success: true }
      const clients = res?.data || [];

      const formatted: PncRow[] = clients.map((c: any) => ({
        id: c._id,
        clientName: c.clientName,
        employer: c.employer,
        claimNo: c.lAndIClaimNo,
        accidentDate: c.dateOfAccident,
        stage: c.claimStatus === "Closed" ? "Mark Done" : "Review",
        status: c.claimStatus === "Closed" ? "Closed" : "Open",
      }));

      setRows(formatted);
    } catch (err) {
      console.error("Failed to fetch clients");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const stageBadgeClass = (stage: IntakeStage) => {
    if (stage === "Review") return "bg-info";
    return "bg-success";
  };

  const statusBadgeClass = (status: IntakeStatus) => {
    if (status === "Open") return "bg-warning";
    return "bg-secondary";
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this intake?",
    );
    if (!confirmDelete) return;

    try {
      await clientsAPI.delete(id); // 👈 your delete API
      fetchClients(); // 👈 refetch table data
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">PNC Intake Information</h4>
        <a className="btn btn-primary" href="/intake-form">
          + New Intake
        </a>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Client Name</th>
                <th>Employer</th>
                <th>Claim No</th>
                <th>Accident Date</th>
                <th>Stage</th>
                <th>Status</th>
                <th style={{ width: 150 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No intakes found.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.id}>
                    <td>{idx + 1}</td>
                    <td>{r.clientName}</td>
                    <td>{r.employer}</td>
                    <td>{r.claimNo}</td>
                    <td>
                      {r.accidentDate
                        ? formatDateMMDDYY(r.accidentDate)
                        : "N/A"}
                    </td>

                    <td>
                      <span className={`badge ${stageBadgeClass(r.stage)}`}>
                        {r.stage}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${statusBadgeClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        {r.status === "Open" ? (
                          <>
                            {/* View / Edit */}
                            <a
                              className="btn btn-sm btn-outline-primary"
                              href={`/intake-form/${r.id}`}
                              title="Edit / View"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </a>

                            {/* Delete */}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(r.id)}
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Locked */}
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              disabled
                              title="Locked"
                            >
                              <i className="fa-solid fa-lock"></i>
                            </button>

                            {/* Delete */}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(r.id)}
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
