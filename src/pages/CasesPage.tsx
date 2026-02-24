import React, { useEffect, useState } from "react";
import { casesAPI } from "../utils/api";

type CaseStatus = "Active" | "Intake" | "Closed";

type CaseRow = {
  id: string;
  caseId: string;
  caseTitle: string;
  clientName: string;
  clientPhone: string;
  tl: string;
  status: CaseStatus;
  createdAt: string;
};

const getStatusBadgeClass = (status: CaseStatus) => {
  switch (status) {
    case "Active":
      return "bg-success";
    case "Intake":
      return "bg-warning text-dark";
    case "Closed":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

export default function CasesPage(): JSX.Element {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await casesAPI.getAllCases();
        const raw = response?.data ?? response ?? [];

        const casesData: CaseRow[] = raw.map((c: any) => ({
          id: c._id,
          caseId: c.caseId,
          caseTitle: c.caseTitle,
          clientName: c.clientName,
          clientPhone: c.clientPhone,
          tl: c.tl,
          status: c.status as CaseStatus,
          createdAt: c.createdAt,
        }));

        setCases(casesData);
      } catch (err: any) {
        console.error("API failed, using dummy data", err);

        // ✅ fallback here
        // setCases(dummyCases);
        setError("API not available. Showing sample data.");
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
   

    fetchCases();
  }, []);


  const handleDeleteCase = async (id: string) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this case?");
  if (!confirmDelete) return;

  try {
    await casesAPI.deleteCase(id);

    // ✅ Option 1: Refetch from backend
    await fetchCases();

    // OR ✅ Option 2: Remove locally (faster UI)
    // setCases(prev => prev.filter(caseItem => caseItem.id !== id));

  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete case");
  }
};

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  {
    error && <div className="alert alert-warning">{error}</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <h4 className="mb-0">📁 All Cases</h4>
        <a className="btn btn-primary" href="/add-case">
          + New Case
        </a>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle datatable mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Case ID</th>
                <th>Client Name</th>
                <th>Case Title</th>
                <th>Phone</th>
                <th>Time Loss</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {cases.map((c: any, idx: number) => (
                <tr key={c.id}>
                  <td>{idx + 1}</td>

                  {/* caseId from API */}
                  <td className="fw-bold">{c.caseId}</td>

                  <td>{c.clientName}</td>

                  <td>{c.caseTitle}</td>

                  <td>{c.clientPhone || "-"}</td>

                  <td>
                    <span
                      className={`badge ${c.tl === "Yes" ? "bg-danger" : "bg-secondary"}`}
                    >
                      {c.tl}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>

                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>

                  <td>
                    <a
                      className="btn btn-sm btn-outline-primary"
                      href={`/case-details/${c.id}`}
                      title="View Case"
                    >
                      <i className="fa fa-eye" />
                    </a>

                    <button
                      className="btn btn-sm btn-outline-danger mx-1"
                      type="button"
                      title="Delete Case"
                      onClick={() => handleDeleteCase(c.id)}
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}

              {cases.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    No cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
