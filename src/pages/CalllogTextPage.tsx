import React, { useEffect, useMemo, useState } from "react";
import { callLogsAPI, casesAPI } from "../utils/api";

type ModalKey = null | "log" | "view";

type CommType = "Call" | "Text";
type Direction = "Incoming" | "Outgoing";
type ContactRole = "Client" | "Employer" | "Provider" | "Other";
type FollowUp = "No" | "Yes" | "Urgent";
type CaseRow = {
  _id: string;
  caseId: string;
};
type LogRow = {
  _id: string;
  case: {
    _id: string;
    caseId: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  communicationType: CommType;
  direction: Direction;
  contactRole: ContactRole;
  callDuration?: number;
  contactName: string;
  phoneNumber: string;
  notes: string;
  followUpRequired: boolean;
  followUpDueDate?: string;
  createdAt: string;
};

function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "lg",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;

  const dialogClass =
    size === "lg"
      ? "modal-dialog modal-lg"
      : size === "sm"
        ? "modal-dialog modal-sm"
        : "modal-dialog";

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        role="dialog"
      >
        <div className={dialogClass}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title mb-0">{title}</h5>
              <button
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            <div className="modal-body">{children}</div>

            <div className="modal-footer">
              {footer ?? (
                <>
                  <button className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={onClose}>
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}

function badgeForType(type: CommType) {
  return type === "Call" ? "badge-call" : "badge-text";
}

function badgeForFollowUp(f: FollowUp) {
  if (f === "Yes") return "bg-warning text-dark";
  if (f === "Urgent") return "bg-danger";
  return "bg-secondary";
}

export default function CalllogTextPage(): JSX.Element {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [selected, setSelected] = useState<LogRow | null>(null);

  // Form state
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");

  const [clientName, setClientName] = useState<string>("John Smith");
  const [commType, setCommType] = useState<CommType>("Call");
  const [direction, setDirection] = useState<Direction>("Incoming");
  const [contactRole, setContactRole] = useState<ContactRole>("Client");
  const [callDuration, setCallDuration] = useState<number>(5);
  const [textPreview, setTextPreview] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [followUp, setFollowUp] = useState<"No" | "Yes">("No");
  const [followUpDue, setFollowUpDue] = useState<string>("");
  const [viewLoading, setViewLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [cases, setCases] = useState<CaseRow[]>([]);

  // console.log("rows",logs);

  const openLog = () => {
    setActiveModal("log");
  };

  const openView = (r: LogRow) => {
    setSelected(r);
    setActiveModal("view");
  };

  const close = () => {
    setActiveModal(null);
    setSelected(null);
  };

  const resetForm = () => {
    setSelectedCaseId("");
    setClientName("John Smith");
    setCommType("Call");
    setDirection("Incoming");
    setContactRole("Client");
    setCallDuration(5);
    setTextPreview("");
    setContactName("");
    setPhone("");
    setNotes("");
    setFollowUp("No");
    setFollowUpDue("");
    setEditingId(null);
  };

  const saveLog = async () => {
    try {
      if (!selectedCaseId) {
        alert("Case is required");
        return;
      }

      if (!contactName.trim()) {
        alert("Contact name is required");
        return;
      }

      if (!phone.trim()) {
        alert("Phone number is required");
        return;
      }

      if (!notes.trim()) {
        alert("Notes are required");
        return;
      }

      setSaving(true);

      const payload = {
        case: selectedCaseId,
        communicationType: commType,
        direction,
        contactRole,
        callDuration: commType === "Call" ? callDuration : undefined,
        contactName,
        phoneNumber: phone,
        notes,
        followUpRequired: followUp === "Yes",
        followUpDueDate:
          followUp === "Yes" && followUpDue
            ? new Date(followUpDue).toISOString()
            : undefined,
      };

      if (editingId) {
        // ✅ UPDATE
        await callLogsAPI.update({
          id: editingId,
          ...payload,
        });
      } else {
        // ✅ CREATE
        await callLogsAPI.create(payload);
      }

      await fetchLogs(); // refresh table
      resetForm();
      close();
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save log");
    } finally {
      setSaving(false);
    }
  };

  //Auto-clear follow-up date if set to "No"//
  useEffect(() => {
    if (followUp === "No") {
      setFollowUpDue("");
    }
  }, [followUp]);

  // Reset duration when switching to Text
  useEffect(() => {
    if (commType === "Text") {
      setCallDuration(0);
    }
  }, [commType]);

  // ======fetch data======//
  useEffect(() => {
    fetchLogs();
    fetchCases();
  }, []);

  const fetchLogs = async () => {
    const res = await callLogsAPI.getAll();
    console.log(res);
    setLogs(res.data || []);
    setLoading(false);
  };

  const fetchCases = async () => {
    const res = await casesAPI.getAllCaseID();
    setCases(res.data || []);
  };

  // =======EDIT======= //
  const handleEdit = (r: LogRow) => {
    setEditingId(r._id);

    setSelectedCaseId(r.case?._id || "");
    setCommType(r.communicationType);
    setDirection(r.direction);
    setContactRole(r.contactRole);
    setCallDuration(r.callDuration || 0);
    setContactName(r.contactName);
    setPhone(r.phoneNumber);
    setNotes(r.notes);
    setFollowUp(r.followUpRequired ? "Yes" : "No");

    setFollowUpDue(
      r.followUpDueDate
        ? new Date(r.followUpDueDate).toISOString().split("T")[0]
        : "",
    );

    setActiveModal("log");
  };

  // =======DELETE======= //
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this log?",
    );

    if (!confirmDelete) return;

    try {
      await callLogsAPI.delete(id);

      // Remove instantly from UI
      setLogs((prev) => prev.filter((row) => row._id !== id));
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete log");
    }
  };
  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <h4 className="mb-0">
          <i className="fa fa-phone" /> Call Logs &amp; Text
        </h4>

        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            resetForm();
            openLog();
          }}
        >
          + Call Log / Text
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle datatable mb-0">
            <thead className="table-light">
              <tr>
                <th>Date &amp; Time</th>
                <th>Type</th>
                <th>Direction</th>
                <th>Contact</th>
                <th>Client</th>
                <th>Case ID</th>
                <th>Notes / Summary</th>
                <th>Follow-up</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    No data found
                  </td>
                </tr>
              )}

              {!loading &&
                logs.length > 0 &&
                logs.map((r) => (
                  <tr key={r._id}>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${badgeForType(r.communicationType)}`}
                      >
                        {r.communicationType}
                      </span>
                    </td>
                    <td>{r.direction}</td>
                    <td>{r.contactRole}</td>
                    <td>{r.contactName}</td>
                    <td>{r.case?.caseId || "-"}</td>
                    <td>{r.notes}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.followUpRequired
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {r.followUpRequired ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* View */}
                        <button
                          className="btn btn-sm btn-outline-primary"
                          type="button"
                          onClick={() => openView(r)}
                          title="View"
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        {/* Edit */}
                        <button
                          className="btn btn-sm btn-outline-warning"
                          type="button"
                          onClick={() => handleEdit(r)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          type="button"
                          onClick={() => handleDelete(r._id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG MODAL */}
      <Modal
        open={activeModal === "log"}
        title={editingId ? "Update Call Log" : "Log Call / Text"}
        onClose={close}
        footer={
          <>
            <button className="btn btn-secondary" type="button" onClick={close}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={saveLog}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Log"}
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label required">Case</label>
            <select
              className="form-select"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
            >
              <option value="">Select Case</option>

              {cases.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.caseId}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Client</label>
            <input
              className="form-control"
              readOnly
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label required">Communication Type</label>
            <select
              className="form-select"
              value={commType}
              onChange={(e) => setCommType(e.target.value as CommType)}
            >
              <option value="Call">Call</option>
              <option value="Text">Text</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label required">Direction</label>
            <select
              className="form-select"
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
            >
              <option value="Incoming">Incoming</option>
              <option value="Outgoing">Outgoing</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Contact Role</label>
            <select
              className="form-select"
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value as ContactRole)}
            >
              <option value="Client">Client</option>
              <option value="Employer">Employer</option>
              <option value="Provider">Provider</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {commType === "Call" ? (
            <div className="col-md-6">
              <label className="form-label">Call Duration (minutes)</label>
              <input
                className="form-control"
                type="number"
                value={callDuration}
                onChange={(e) => setCallDuration(Number(e.target.value))}
              />
            </div>
          ) : (
            <div className="col-md-6">
              <label className="form-label">Text Preview</label>
              <input
                className="form-control"
                type="text"
                value={textPreview}
                onChange={(e) => setTextPreview(e.target.value)}
              />
            </div>
          )}

          <div className="col-md-6">
            <label className="form-label">Contact Name</label>
            <input
              className="form-control"
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Phone Number</label>
            <input
              className="form-control"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="col-md-12">
            <label className="form-label required">Notes</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder=""
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Follow-up Required?</label>
            <select
              className="form-select"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value as "No" | "Yes")}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Follow-up Due Date</label>
            <input
              className="form-control"
              type="date"
              value={followUpDue}
              onChange={(e) => setFollowUpDue(e.target.value)}
              disabled={followUp !== "Yes"}
            />
          </div>
        </div>

        <div className="text-muted small mt-3"></div>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        open={activeModal === "view"}
        title="Log Details"
        onClose={close}
        size="md"
        footer={
          <button className="btn btn-secondary" onClick={close}>
            Close
          </button>
        }
      >
        {viewLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : !selected ? null : (
          <div className="row g-3">
            <div className="col-6">
              <div className="text-muted small">Date</div>
              <div className="fw-semibold">
                {new Date(selected.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="col-6">
              <div className="text-muted small">Case</div>
              <div className="fw-semibold">{selected.case?.caseId}</div>
            </div>

            <div className="col-6">
              <div className="text-muted small">Created By</div>
              <div className="fw-semibold">{selected.createdBy?.name}</div>
            </div>

            <div className="col-6">
              <div className="text-muted small">Type</div>
              <span
                className={`badge ${badgeForType(selected.communicationType)}`}
              >
                {selected.communicationType}
              </span>
            </div>

            <div className="col-6">
              <div className="text-muted small">Direction</div>
              <div className="fw-semibold">{selected.direction}</div>
            </div>

            <div className="col-6">
              <div className="text-muted small">Contact Role</div>
              <div className="fw-semibold">{selected.contactRole}</div>
            </div>

            <div className="col-6">
              <div className="text-muted small">Contact Name</div>
              <div className="fw-semibold">{selected.contactName}</div>
            </div>

            <div className="col-6">
              <div className="text-muted small">Phone</div>
              <div className="fw-semibold">{selected.phoneNumber}</div>
            </div>

            {selected.callDuration && (
              <div className="col-6">
                <div className="text-muted small">Call Duration</div>
                <div className="fw-semibold">
                  {selected.callDuration} minutes
                </div>
              </div>
            )}

            <div className="col-12">
              <div className="text-muted small">Notes</div>
              <div className="fw-semibold">{selected.notes}</div>
            </div>

            <div className="col-12">
              <div className="text-muted small">Follow-up</div>
              <span
                className={`badge ${
                  selected.followUpRequired
                    ? "bg-warning text-dark"
                    : "bg-secondary"
                }`}
              >
                {selected.followUpRequired ? "Required" : "No"}
              </span>
            </div>

            {selected.followUpRequired && selected.followUpDueDate && (
              <div className="col-12">
                <div className="text-muted small">Follow-up Due</div>
                <div className="fw-semibold">
                  {new Date(selected.followUpDueDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <style>{`
        .badge-call {
          background: #0d6efd;
        }
        .badge-text {
          background: #16a34a;
        }
        .required:after {
          content: " *";
          color: #dc2626;
          font-weight: 700;
        }
      `}</style>
    </>
  );
}
