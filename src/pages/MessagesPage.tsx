import React, { useEffect, useState } from "react";
import { casesAPI, massageAPI, staffAPI } from "../utils/api";

type MessageRow = {
  _id: string;

  from: {
    _id: string;
    name: string;
    email: string;
  };

  regarding: {
    _id: string;
    caseId: string;
  };

  message: string;
  createdAt: string;
  updatedAt: string;
};
type StaffOption = {
  _id: string;
  name: string;
  email: string;
};
type CaseOption = {
  _id: string;
  caseId: string;
};

export default function MessagesPage(): JSX.Element {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [fromId, setFromId] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<MessageRow | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editData, setEditData] = useState<MessageRow | null>(null);

  const [updateForm, setUpdateForm] = useState({
    fromName: "",
    fromEmail: "",
    caseId: "",
    message: "",
  });
  console.log("editData", staff);

  // ================= FETCH CASES =================//
  const fetchCases = async () => {
    try {
      const res = await casesAPI.getAllCases(); // or casesAPI.getAll()
      setCases(res.data || res || []);
    } catch (error) {
      console.error("Failed to fetch cases");
    }
  };

  // ================= FETCH Messages =================//
  const fetchMessages = async () => {
    try {
      const response = await massageAPI.getAll();
      setMessages(response);
    } catch (error) {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };
  // ================= FETCH STAFF =================//
  const fetchStaff = async () => {
    try {
      const res = await staffAPI.getStaffMember();
      const data = res.data || res || [];
      setStaff(data);

      // if (data.length > 0) {
      //   setFromId(data[0]._id);
      // }
    } catch (error) {
      console.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH =================
  useEffect(() => {
    fetchCases();
    fetchMessages();
    fetchStaff();
  }, []);

  // ================= UPDATE =================//
 const handleUpdateClick = (msg: MessageRow) => {
  setEditData(msg);

  setFromId(msg.from?._id || ""); // ✅ IMPORTANT FIX

  setUpdateForm({
    fromName: msg.from?.name || "",
    fromEmail: msg.from?.email || "",
    caseId: msg.regarding?._id || "",
    message: msg.message || "",
  });

  setIsUpdateModalOpen(true);
};

  // ================= DELETE =================//
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      await massageAPI.delete(id);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (error) {
      alert("Delete failed");
    }
  };

  const handleUpdateChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  > = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSave = async () => {
    if (!editData) return;

    const payload = {
      id: editData._id,
      from: fromId, // ✅ FIXED
      caseId: updateForm.caseId,
      message: updateForm.message,
    };

    console.log("payload", payload);

    try {
      await massageAPI.update(payload);

      const selectedStaff = staff.find((s) => s._id === fromId);
      const selectedCase = cases.find((c) => c._id === updateForm.caseId);

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id !== editData._id) return msg;

          return {
            ...msg,
            message: updateForm.message,
            from: {
              _id: fromId,
              name: selectedStaff?.name || msg.from.name,
              email: selectedStaff?.email || msg.from.email,
            },
            regarding: {
              _id: updateForm.caseId,
              caseId: selectedCase?.caseId || msg.regarding.caseId,
            },
          };
        }),
      );

      setIsUpdateModalOpen(false);
      setEditData(null);
    } catch (error) {
      alert("Update failed");
    }
  };

  // ================= VIEW =================
  const handleView = (msg: MessageRow) => {
    setSelectedMessage(msg);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="p-4">Loading messages...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <h4 className="mb-0">
          <i className="fa fa-envelope" /> All Messages
        </h4>

        <a className="btn btn-primary" href="/new-message">
          + New Message
        </a>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>From</th>
                <th>Email</th>
                <th>Case</th>
                <th>Message</th>
                <th style={{ width: 150 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {messages.map((msg, index) => (
                <tr key={msg._id}>
                  <td>{index + 1}</td>
                  <td>{msg.from?.name || "-"}</td>
                  <td>{msg.from?.email || "-"}</td>
                  <td>{msg.regarding?.caseId || "-"}</td>
                  <td>
                    {msg.message.length > 30
                      ? msg.message.substring(0, 30) + "..."
                      : msg.message}
                  </td>

                  <td>
                    {/* View */}
                    <button
                      className="btn btn-sm btn-primary me-2"
                      type="button"
                      onClick={() => handleView(msg)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>

                    {/* update */}
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleUpdateClick(msg)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    {/* Delete */}
                    <button
                      className="btn btn-sm btn-danger"
                      type="button"
                      onClick={() => handleDelete(msg._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}

              {messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && selectedMessage && (
        <>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Message Details</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setIsModalOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <p>
                    <strong>From:</strong> {selectedMessage.from?.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedMessage.from?.email}
                  </p>
                  <p>
                    <strong>Case ID:</strong>{" "}
                    {selectedMessage.regarding?.caseId}
                  </p>
                  <hr />
                  <p>
                    <strong>Message:</strong>
                  </p>
                  <div className="border p-3 rounded bg-light">
                    {selectedMessage.message}
                  </div>
                  <hr />
                  <p className="text-muted small">
                    Created:{" "}
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
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

      {/* ================= UPDATE MODAL ================= */}
      {isUpdateModalOpen && editData && (
        <>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content shadow">
                <div className="modal-header bg-warning">
                  <h5 className="modal-title">Update Message</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsUpdateModalOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">From</label>
                    <select
                      className="form-select"
                      value={fromId}
                      onChange={(e) => setFromId(e.target.value)}
                    >
                      <option value="">Select Staff</option>
                      {staff.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      name="fromEmail"
                      value={updateForm.fromEmail}
                      onChange={handleUpdateChange}
                    />
                  </div> */}

                  <div className="mb-3">
                    <label className="form-label">Case ID</label>
                    {/* <input
                      className="form-control"
                      name="caseId"
                      value={updateForm.caseId}
                      onChange={handleUpdateChange}
                    /> */}
                    <select
                      className="form-select"
                      name="caseId"
                      value={updateForm.caseId}
                      onChange={handleUpdateChange}
                    >
                      <option value="">Select Case</option>

                      {cases.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.caseId}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      name="message"
                      rows={4}
                      value={updateForm.message}
                      onChange={handleUpdateChange}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsUpdateModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={handleUpdateSave}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop fade show"
            onClick={() => setIsUpdateModalOpen(false)}
          />
        </>
      )}
    </>
  );
}
