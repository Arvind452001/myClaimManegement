import React from "react";
import { NotesForm, YesNo } from "../types/case.types";



type Props = {
  caseId: string | null;
  notes: NotesForm;
  setNotes: React.Dispatch<React.SetStateAction<NotesForm>>;
  saving: boolean;
  loggedInUser: any;
  onSave: () => void;
};

export default function NotesTab({
  caseId,
  notes,
  setNotes,
  saving,
  loggedInUser,
  onSave,
}: Props) {
  return (
    <div className="section-card">
      <div className="section-title">
        <i className="fa fa-note-sticky" /> Case Notes
      </div>

      <div className="row g-3">

        {/* CASE LOOKUP */}
        {/* <div className="col-md-4">
          <label className="form-label">Case</label>
          <input
            className="form-control bg-light"
            value={caseId || ""}
            readOnly
          />
        </div> */}

        {/* NOTE DATE/TIME AUTO */}
        {/* <div className="col-md-4">
          <label className="form-label">Note Date/Time</label>
          <input
            className="form-control bg-light"
            value={new Date().toLocaleString()}
            readOnly
          />
        </div> */}

        {/* CREATED BY AUTO */}
        <div className="col-md-4">
          <label className="form-label">Created By</label>
          <input
            className="form-control bg-light"
            value={loggedInUser?.name || ""}
            readOnly
          />
        </div>

        {/* NOTE TYPE */}
        <div className="col-md-6">
          <label className="form-label">Note Type</label>
          <select
            className="form-select"
            value={notes.type}
            onChange={(e) =>
              setNotes((p) => ({ ...p, type: e.target.value }))
            }
          >
            <option>General</option>
            <option>Client Contact</option>
            <option>Medical</option>
            <option>Vocational</option>
            <option>TL</option>
            <option>Legal</option>
            <option>Strategy</option>
            <option>Other</option>
          </select>
        </div>

        {/* VISIBILITY */}
        <div className="col-md-6">
          <label className="form-label">Visibility</label>
          <select
            className="form-select"
            value={notes.visibility}
            onChange={(e) =>
              setNotes((p) => ({
                ...p,
                visibility: e.target.value as "Internal" | "Admin-only",
              }))
            }
          >
            <option value="Internal">Internal</option>
            <option value="Admin-only">Admin-only</option>
          </select>
        </div>

        {/* TITLE */}
        <div className="col-md-12">
          <label className="form-label">Note Title</label>
          <input
            className="form-control"
            value={notes.title}
            onChange={(e) =>
              setNotes((p) => ({ ...p, title: e.target.value }))
            }
          />
        </div>

        {/* DETAILS */}
        <div className="col-md-12">
          <label className="form-label">Note Details</label>
          <textarea
            className="form-control"
            rows={4}
            value={notes.details}
            onChange={(e) =>
              setNotes((p) => ({ ...p, details: e.target.value }))
            }
          />
        </div>

        {/* CREATE TASK OPTION */}
        <div className="col-md-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={notes.createTask}
              onChange={(e) =>
                setNotes((p) => ({
                  ...p,
                  createTask: e.target.checked,
                }))
              }
            />
            <label className="form-check-label">
              Create Task from this Note
            </label>
          </div>
        </div>
      </div>

      {/* TASK SECTION */}
      {notes.createTask && (
        <div className="border rounded p-3 mt-3 bg-light">
          <h6 className="fw-bold mb-3">Task Details</h6>

          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label">Task Title</label>
              <input
                className="form-control"
                value={notes.taskTitle}
                onChange={(e) =>
                  setNotes((p) => ({
                    ...p,
                    taskTitle: e.target.value,
                  }))
                }
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Task Type</label>
              <select
                className="form-select"
                value={notes.taskType}
                onChange={(e) =>
                  setNotes((p) => ({
                    ...p,
                    taskType: e.target.value,
                  }))
                }
              >
                <option>Follow-Up Call</option>
                <option>Document Review</option>
                <option>Order Review</option>
                <option>Medical Records</option>
                <option>APF/WSF</option>
                <option>Payment Follow-Up</option>
                <option>Vocational Review</option>
                <option>Other</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Assigned To</label>
              <input
                className="form-control"
                value={notes.assignedTo}
                onChange={(e) =>
                  setNotes((p) => ({
                    ...p,
                    assignedTo: e.target.value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control"
                value={notes.dueDate}
                onChange={(e) =>
                  setNotes((p) => ({
                    ...p,
                    dueDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={notes.priority}
                onChange={(e) =>
                  setNotes((p) => ({
                    ...p,
                    priority: e.target.value as
                      | "Low"
                      | "Medium"
                      | "High"
                      | "Critical",
                  }))
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Link to Calendar?</label>
              <select
                className="form-select"
                value={notes.linkToCalendar}
                onChange={(e) =>
                  setNotes((p) => ({
                    ...p,
                    linkToCalendar: e.target.value as YesNo,
                  }))
                }
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

          </div>
        </div>
      )}

      <button
        className="btn btn-primary mt-3"
        type="button"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Note"}
      </button>
    </div>
  );
}
