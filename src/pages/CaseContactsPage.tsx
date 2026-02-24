import React, { useEffect, useState } from "react";
import { casesAPI, contactsAPI } from "../utils/api";

type CaseType = {
  _id: string;
  caseId?: string;
};

type ContactType = {
  _id: string;
  firstName: string;
  lastName: string;
};

type CaseContact = {
  _id: string;
  caseId: CaseType;
  contactId: ContactType;
  roleOnCase: string;
  isPrimary: boolean;
  caseNotes: string;
};

export default function CaseContactsPage() {
  const [records, setRecords] = useState<CaseContact[]>([
  {
    "_id": "cc001",
    "caseId": {
      "_id": "698c1fa42d21eff59e057aa0",
      "caseId": "C-101"
    },
    "contactId": {
      "_id": "69954bba6143b8ecd9d17fa8",
      "firstName": "Rohit",
      "lastName": "Verma"
    },
    "roleOnCase": "Employer",
    "isPrimary": true,
    "caseNotes": "Primary HR contact for employment verification."
  },
  {
    "_id": "cc002",
    "caseId": {
      "_id": "698c1fa42d21eff59e057aa1",
      "caseId": "C-102"
    },
    "contactId": {
      "_id": "69954bba6143b8ecd9d17fa9",
      "firstName": "Anita",
      "lastName": "Sharma"
    },
    "roleOnCase": "Attorney",
    "isPrimary": false,
    "caseNotes": "Handles legal documentation."
  },
  {
    "_id": "cc003",
    "caseId": {
      "_id": "698c1fa42d21eff59e057aa2",
      "caseId": "C-103"
    },
    "contactId": {
      "_id": "69954bba6143b8ecd9d17faa",
      "firstName": "Vikram",
      "lastName": "Singh"
    },
    "roleOnCase": "Medical",
    "isPrimary": true,
    "caseNotes": "Primary treating physician."
  },
  {
    "_id": "cc004",
    "caseId": {
      "_id": "698c1fa42d21eff59e057aa3",
      "caseId": "C-104"
    },
    "contactId": {
      "_id": "69954bba6143b8ecd9d17fab",
      "firstName": "Neha",
      "lastName": "Gupta"
    },
    "roleOnCase": "Client",
    "isPrimary": false,
    "caseNotes": "Secondary contact person."
  },
  {
    "_id": "cc005",
    "caseId": {
      "_id": "698c1fa42d21eff59e057aa4",
      "caseId": "C-105"
    },
    "contactId": {
      "_id": "69954bba6143b8ecd9d17fac",
      "firstName": "Amit",
      "lastName": "Kumar"
    },
    "roleOnCase": "Other",
    "isPrimary": false,
    "caseNotes": "Vendor for document processing."
  }
]
);
  const [cases, setCases] = useState<CaseType[]>([]);
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewData, setViewData] = useState<CaseContact | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [form, setForm] = useState({
    caseId: "",
    contactId: "",
    roleOnCase: "",
    isPrimary: false,
    caseNotes: "",
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetchRecords();
    fetchCases();
    fetchContacts();
  }, []);

  const fetchRecords = async () => {
    const res = await contactsAPI.getAllCaseContacts?.(); // Use correct API
    setRecords(res?.data || res || []);
  };

  const fetchCases = async () => {
    const res = await casesAPI.getAllCases();
    setCases(res?.data || res || []);
  };

  const fetchContacts = async () => {
    const res = await contactsAPI.getAll();
    setContacts(res?.data || res || []);
  };

  /* ================= CREATE ================= */

  const handleSave = async () => {
    try {
      const payload = {
        caseId: form.caseId,
        contactId: form.contactId,
        roleOnCase: form.roleOnCase,
        isPrimary: form.isPrimary,
        caseNotes: form.caseNotes,
      };

      await contactsAPI.createCaseContact?.(payload);
      alert("Created successfully");

      setIsModalOpen(false);
      setForm({
        caseId: "",
        contactId: "",
        roleOnCase: "",
        isPrimary: false,
        caseNotes: "",
      });

      fetchRecords();
    } catch (err: any) {
      alert(err.message || "Create failed");
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await contactsAPI.deleteCaseContact?.(id);
      alert("Deleted successfully");
      fetchRecords();
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h4>📎 Case Contacts</h4>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add
        </button>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Case</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Primary</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {records.map((r, i) => (
                <tr key={r._id}>
                  <td>{i + 1}</td>

                  <td>{r.caseId?.caseId || r.caseId?._id}</td>

                  <td>
                    {r.contactId?.firstName} {r.contactId?.lastName}
                  </td>

                  <td>{r.roleOnCase}</td>

                  <td>
                    {r.isPrimary ? (
                      <span className="badge bg-success">Yes</span>
                    ) : (
                      <span className="badge bg-secondary">No</span>
                    )}
                  </td>

                  <td>{r.caseNotes}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => {
                        setViewData(r);
                        setIsViewModalOpen(true);
                      }}
                    >
                      View
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(r._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CREATE MODAL ================= */}

      {isModalOpen && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Add Case Contact</h5>
                  <button
                    className="btn-close"
                    onClick={() => setIsModalOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  {/* Case Dropdown */}
                  <label className="form-label">Case</label>
                  <select
                    className="form-select mb-2"
                    value={form.caseId}
                    onChange={(e) =>
                      setForm({ ...form, caseId: e.target.value })
                    }
                  >
                    <option value="">Select Case</option>
                    {cases.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.caseId || c._id}
                      </option>
                    ))}
                  </select>

                  {/* Contact Dropdown */}
                  <label className="form-label">Contact</label>
                  <select
                    className="form-select mb-2"
                    value={form.contactId}
                    onChange={(e) =>
                      setForm({ ...form, contactId: e.target.value })
                    }
                  >
                    <option value="">Select Contact</option>
                    {contacts.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>

                  {/* Role */}
                  <label className="form-label">Role On Case</label>
                  <input
                    className="form-control mb-2"
                    value={form.roleOnCase}
                    onChange={(e) =>
                      setForm({ ...form, roleOnCase: e.target.value })
                    }
                  />

                  {/* Primary */}
                  <div className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={form.isPrimary}
                      onChange={(e) =>
                        setForm({ ...form, isPrimary: e.target.checked })
                      }
                    />
                    <label className="form-check-label">
                      Is Primary Contact
                    </label>
                  </div>

                  {/* Notes */}
                  <label className="form-label">Case Notes</label>
                  <textarea
                    className="form-control mb-3"
                    rows={3}
                    value={form.caseNotes}
                    onChange={(e) =>
                      setForm({ ...form, caseNotes: e.target.value })
                    }
                  />

                  <button
                    className="btn btn-primary w-100"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setIsModalOpen(false)}
          />
        </>
      )}

      {/* ================= VIEW MODAL ================= */}

      {isViewModalOpen && viewData && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Case Contact Details</h5>
                  <button
                    className="btn-close"
                    onClick={() => setIsViewModalOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <p>
                    <strong>Case:</strong>{" "}
                    {viewData.caseId?.caseId || viewData.caseId?._id}
                  </p>

                  <p>
                    <strong>Contact:</strong>{" "}
                    {viewData.contactId?.firstName}{" "}
                    {viewData.contactId?.lastName}
                  </p>

                  <p>
                    <strong>Role:</strong> {viewData.roleOnCase}
                  </p>

                  <p>
                    <strong>Primary:</strong>{" "}
                    {viewData.isPrimary ? "Yes" : "No"}
                  </p>

                  <p>
                    <strong>Notes:</strong> {viewData.caseNotes}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setIsViewModalOpen(false)}
          />
        </>
      )}
    </>
  );
}
