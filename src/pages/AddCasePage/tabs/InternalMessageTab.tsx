import React from "react";
import { MessagesForm, Visibility } from "../types/case.types";

type Props = {
  caseId: string | null;
  messages: MessagesForm;
  setMessages: React.Dispatch<React.SetStateAction<MessagesForm>>;
  saving: boolean;
  loggedInUser: any;
  onSave: () => void;
};

export default function InternalMessageTab({
  caseId,
  messages,
  setMessages,
  saving,
  loggedInUser,
  onSave,
}: Props) {
  return (
    <div className="tab-pane fade show active">
      <div className="section-card">
        <div className="section-title">
          <i className="fa fa-comments" /> Internal Messages
        </div>

        {/* AUTO FIELDS */}
        <div className="row g-3 mb-3">
          {/* <div className="col-md-4">
            <label className="form-label">Case</label>
            <input
              className="form-control bg-light"
              value={caseId || ""}
              readOnly
            />
          </div> */}

          {/* <div className="col-md-4">
            <label className="form-label">Message Date/Time</label>
            <input
              className="form-control bg-light"
              value={new Date().toLocaleString()}
              readOnly
            />
          </div> */}

          <div className="col-md-4">
            <label className="form-label">Created By</label>
            <input
              className="form-control bg-light"
              value={loggedInUser?.name || ""}
              readOnly
            />
          </div>
        </div>

        {/* MAIN FIELDS */}
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Visibility</label>
            <select
              className="form-select"
              value={messages.visibility}
              onChange={(e) =>
                setMessages((prev) => ({
                  ...prev,
                  visibility: e.target.value as Visibility,
                }))
              }
            >
              <option value="Internal">Internal</option>
              <option value="Admin-only">Admin-only</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Tag Users (Optional)</label>
            <input
              className="form-control"
              placeholder="Enter user names separated by comma"
              value={messages.tagUsers}
              onChange={(e) =>
                setMessages((prev) => ({
                  ...prev,
                  tagUsers: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-12">
            <label className="form-label">Message Subject</label>
            <input
              className="form-control"
              value={messages.subject}
              onChange={(e) =>
                setMessages((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))
              }
            />
          </div>

          <div className="col-md-12">
            <label className="form-label">Message Body</label>
            <textarea
              className="form-control"
              rows={4}
              value={messages.body}
              onChange={(e) =>
                setMessages((prev) => ({
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
          {saving ? "Saving..." : "Save Message"}
        </button>
      </div>
    </div>
  );
}
