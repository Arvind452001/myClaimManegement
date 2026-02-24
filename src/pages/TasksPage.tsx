import React, { useEffect, useState } from "react";
import { casesAPI, staffAPI, tasksAPI } from "../utils/api";

type TaskStatus = "Pending" | "Cancelled" | "Completed";
type CallOutcome = "Returned" | "No Callback Needed" | "Will Call Back";
// const staffMembers = [
//   { _id: "698da90cb5c5d356a7a93826", name: "Garima" },
//   { _id: "698da924b5c5d356a7a9382e", name: "Neha" },
//   { _id: "698da937b5c5d356a7a93836", name: "Amit" },
//   { _id: "698da955b5c5d356a7a9383e", name: "Ravi" },
// ];

type TaskResponse = {
  _id: string;

  caseId: {
    _id: string;
    caseId: string;
  };

  taskTitle: string;
  internalNotes: string;

  callRecipient: string;
  callReason: string;
  callStatus: string;
  name: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };

  status: TaskStatus;
  deadline: string;

  createdAt: string;
  updatedAt: string;
};

type TaskForm = {
  caseId: string;
  clientName: string;
  title: string;
  notes: string;
  assigned: string;
  status: TaskStatus;
  deadline: string;
  callFor: string;
  callReason: string;
  callOutcome: CallOutcome | "";
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function TasksPage(): JSX.Element {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [staffMembers, setstaffMembers] = useState<TaskResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cases, setCases] = useState<any[]>([]);
  const [casesID, setCasesID] = useState<any[]>([]);
  // console.log("ddddd",editId)
  const emptyForm: TaskForm = {
    caseId: "",
    clientName: "",
    title: "",
    notes: "",
    assigned: "",
    status: "Pending",
    deadline: todayISO(),
    callFor: "",
    callReason: "",
    callOutcome: "",
  };

  const [form, setForm] = useState<TaskForm>(emptyForm);
  // console.log("form", form);
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
    fetchCases();
    fetchstaffMembers();
  }, []);

  const fetchstaffMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await staffAPI.getStaffMember();
      // console.log("task", response.data);
      setstaffMembers(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tasks");
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await tasksAPI.getAll();
      // console.log("task", response.data);
      setTasks(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tasks");
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await casesAPI.getAllCaseID(); // adjust if different name
      // console.log("response", response.data);
      setCases(response.data || []);
    } catch (err) {
      console.error("Failed to fetch cases", err);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm, deadline: todayISO() });
    setShowModal(true);
  };

  const openEdit = (t: TaskResponse) => {
    setEditId(t._id);

    setForm({
      caseId: t.caseId._id,
      clientName: "",
      title: t.taskTitle,
      notes: t.internalNotes,
      assigned: t.assignedTo._id,
      status: t.status,
      deadline: t.deadline.slice(0, 10),
      callFor: "",
      callReason: t.callReason,
      callOutcome: t.callStatus as CallOutcome,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const saveTask = async () => {
    // Required validation
    if (!form.title || !form.assigned) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (editId) {
        // ✅ UPDATE → send only id
        const payload = {
          id: editId,
          taskTitle: form.title,
          internalNotes: form.notes,
          callRecipient: form.callFor,
          callReason: form.callReason,
          callStatus: form.callOutcome,
          assignedTo: form.assigned,
          status: form.status,
          deadline: form.deadline,
        };

        const res = await tasksAPI.update(payload);
        alert(res.message);
      } else {
        // ✅ CREATE → send caseId
        if (!form.caseId) {
          alert("Please select Case ID");
          return;
        }

        const payload = {
          caseId: form.caseId,
          taskTitle: form.title,
          internalNotes: form.notes,
          callRecipient: form.callFor,
          callReason: form.callReason,
          callStatus: form.callOutcome,
          assignedTo: form.assigned,
          status: form.status,
          deadline: form.deadline,
        };

        const res = await tasksAPI.create(payload);
        alert(res.message);
      }

      setShowModal(false);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save task");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      setError("");
      await tasksAPI.delete(taskId);
      fetchTasks(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
      console.error("Delete task error:", err);
    }
  };

  const statusBadgeClass: Record<TaskStatus, string> = {
    Pending: "bg-warning text-dark",
    Cancelled: "bg-info text-dark",
    Completed: "bg-success text-white",
  };

  // const teamMembers: Task["assigned"][] = ["Garima", "Neha", "Amit", "Ravi"];
  const statusOptions: TaskStatus[] = ["Pending", "Completed", "Cancelled"];
  const callOutcomes: CallOutcome[] = [
    "Returned",
    "No Callback Needed",
    "Will Call Back",
  ];

  return (
    <>
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">📋 Tasks List</h5>
          <button className="btn btn-primary" onClick={openAdd} type="button">
            + Add Task
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle datatable mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Case ID</th>
                <th>Task Title</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Deadline</th>
                <th style={{ width: 80 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t, i) => (
                <tr key={t._id}>
                  <td>{i + 1}</td>

                  {/* Nested caseId */}
                  <td>{t.caseId?.caseId}</td>

                  <td>
                    <div className="fw-bold">{t.taskTitle}</div>
                    <div className="small text-muted fst-italic">
                      {t.internalNotes || "No notes"}
                    </div>
                  </td>

                  {/* Nested assignedTo */}
                  <td>{t.assignedTo?.name}</td>

                  <td>
                    <span
                      className={`badge ${
                        t.status === "Pending"
                          ? "bg-warning text-dark"
                          : t.status === "Cancelled"
                            ? "bg-info text-dark"
                            : "bg-success text-white"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td>{new Date(t.deadline).toLocaleDateString()}</td>

                  <td>
                    <div className="d-flex gap-2">
                      {/* Edit Button */}
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        onClick={() => openEdit(t)}
                      >
                        <i className="fa fa-edit me-1" />
                        
                      </button>

                      {/* Modify Button */}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        type="button"
                        onClick={() => deleteTask(t._id)}
                      >
                        <i className="fa fa-trash me-1" />
                        
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (React controlled, bootstrap classes) */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header bg-light">
              <h5 className="modal-title">Task &amp; Communication Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
              />
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Case ID</label>
                  <select
                    className="form-select"
                    value={form.caseId}
                    onChange={async (e) => {
                      const selectedId = e.target.value;

                      if (!selectedId) {
                        setForm((p) => ({
                          ...p,
                          caseId: "",
                          clientName: "",
                        }));
                        return;
                      }

                      try {
                        const res = await casesAPI.getCaseById(selectedId);
                        const caseData = res.data;

                        setForm((p) => ({
                          ...p,
                          caseId: selectedId, // ✅ KEEP MONGO _id
                          clientName: caseData.clientName || "",
                        }));
                      } catch (err) {
                        console.error("Failed to fetch case details", err);
                      }
                    }}
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
                  <label className="form-label fw-bold">Client Name</label>
                  {/* <input
                    className="form-control"
                    value={form.clientName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, clientName: e.target.value }))
                    }
                  /> */}
                  <input
                    className="form-control bg-light"
                    value={form.clientName}
                    readOnly
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-bold">Task Title</label>
                  <input
                    className="form-control"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-bold text-primary">
                    <i className="fa fa-pencil" /> Internal Notes
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Add task specific details here..."
                    rows={2}
                    value={form.notes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, notes: e.target.value }))
                    }
                  />
                </div>

                <div className="col-12">
                  <div className="p-3 border rounded bg-light">
                    <h6 className="fw-bold mb-3 text-secondary">
                      <i className="fa fa-phone" /> Call Log &amp; Messaging
                    </h6>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="small fw-bold">
                          Who is the call for?
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={form.callFor}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              callFor: e.target.value, // store _id
                            }))
                          }
                        >
                          <option value="">Select staff member</option>

                          {staffMembers.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="small fw-bold">
                          Reason for Call / Message
                        </label>
                        <input
                          className="form-control form-control-sm"
                          placeholder="Purpose of contact"
                          value={form.callReason}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              callReason: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="small fw-bold d-block mb-2">
                          Call Status
                        </label>
                        <div className="d-flex flex-wrap gap-3">
                          {callOutcomes.map((o) => (
                            <div className="form-check" key={o}>
                              <input
                                className="form-check-input"
                                name="callOutcome"
                                type="radio"
                                id={`out-${o}`}
                                checked={form.callOutcome === o}
                                onChange={() =>
                                  setForm((p) => ({ ...p, callOutcome: o }))
                                }
                              />
                              <label
                                className="form-check-label small"
                                htmlFor={`out-${o}`}
                              >
                                {o}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold">Assign To</label>
                  <select
                    className="form-select"
                    value={form.assigned}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        assigned: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Staff</option>

                    {staffMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold">Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        status: e.target.value as TaskStatus,
                      }))
                    }
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="small fw-bold">Deadline</label>
                  <input
                    className="form-control"
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, deadline: e.target.value }))
                    }
                  />
                </div>
              </div>

              <button
                className="btn btn-primary w-100 mt-4 shadow-sm"
                type="button"
                onClick={saveTask}
              >
                Save Task &amp; Log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {showModal ? (
        <div className="modal-backdrop fade show" onClick={closeModal} />
      ) : null}

      <footer className="p-3 border-top text-center small text-muted">
        © 2026. All rights reserved.
      </footer>

      <style>{`
        /* optional small improvement for notes look */
        .fst-italic {
          font-style: italic;
        }
      `}</style>
    </>
  );
}
