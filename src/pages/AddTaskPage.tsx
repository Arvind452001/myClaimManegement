import React, { useMemo, useState } from "react";

type Category = "Follow-up" | "Verification" | "Documentation" | "Appointment" | "Internal";
type Status = "To Do" | "In Progress" | "Completed" | "On Hold";
type Priority = "High" | "Medium" | "Low";
type Reminder = "No Reminder" | "15 Minutes Before" | "1 Hour Before" | "1 Day Before";
type Visibility = "Private (Only Me)" | "Team" | "Public";

type TaskForm = {
  title: string;
  category: Category;
  status: Status;
  assignedTo: string;
  relatedCaseOrClient: string;
  priority: Priority;
  startDate: string;
  dueDate: string;
  estimatedHours: string;
  reminder: Reminder;
  tags: string;
  visibility: Visibility;
  description: string;
  attachment: File | null;
  internalNotes: string;
};

export default function AddTaskPage(): JSX.Element {
  const initialState = useMemo<TaskForm>(
    () => ({
      title: "",
      category: "Follow-up",
      status: "To Do",
      assignedTo: "John Doe",
      relatedCaseOrClient: "",
      priority: "High",
      startDate: "",
      dueDate: "",
      estimatedHours: "",
      reminder: "No Reminder",
      tags: "",
      visibility: "Private (Only Me)",
      description: "",
      attachment: null,
      internalNotes: "",
    }),
    []
  );

  const [form, setForm] = useState<TaskForm>(initialState);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof TaskForm>(key: K, value: TaskForm[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const reset = () => setForm(initialState);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Task Title is required.");
      return;
    }

    setSubmitting(true);

    // Demo submit (replace with API call)
    // eslint-disable-next-line no-console
    console.log("Create Task:", {
      ...form,
      attachment: form.attachment ? form.attachment.name : null,
    });

    setTimeout(() => {
      setSubmitting(false);
      reset();
      alert("Task created (demo).");
    }, 700);
  };

  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>Add New Task</strong>
        <div>
          <a className="btn btn-primary" href="/tasks">
            <i className="fa fa-eye" /> View All
          </a>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            {/* Task Title */}
            <div className="col-md-12">
              <label className="form-label">Task Title *</label>
              <input
                className="form-control"
                placeholder="Enter task title"
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            {/* Task Category */}
            <div className="col-md-6">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => update("category", e.target.value as Category)}
              >
                <option value="Follow-up">Follow-up</option>
                <option value="Verification">Verification</option>
                <option value="Documentation">Documentation</option>
                <option value="Appointment">Appointment</option>
                <option value="Internal">Internal</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-md-6">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => update("status", e.target.value as Status)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            {/* Assign To */}
            <div className="col-md-4">
              <label className="form-label">Assign To</label>
              <select
                className="form-select"
                value={form.assignedTo}
                onChange={(e) => update("assignedTo", e.target.value)}
              >
                <option value="John Doe">John Doe</option>
                <option value="Sarah Smith">Sarah Smith</option>
                <option value="Alex Brown">Alex Brown</option>
              </select>
            </div>

            {/* Related Case */}
            <div className="col-md-4">
              <label className="form-label">Related Case / Client</label>
              <input
                className="form-control"
                placeholder="Case ID / Client Name"
                type="text"
                value={form.relatedCaseOrClient}
                onChange={(e) => update("relatedCaseOrClient", e.target.value)}
              />
            </div>

            {/* Priority */}
            <div className="col-md-4">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) => update("priority", e.target.value as Priority)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                className="form-control"
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>

            {/* Due Date */}
            <div className="col-md-3">
              <label className="form-label">Due Date</label>
              <input
                className="form-control"
                type="date"
                value={form.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
              />
            </div>

            {/* Estimated Time */}
            <div className="col-md-3">
              <label className="form-label">Estimated Time (hrs)</label>
              <input
                className="form-control"
                placeholder="e.g. 2"
                type="number"
                min={0}
                step="0.5"
                value={form.estimatedHours}
                onChange={(e) => update("estimatedHours", e.target.value)}
              />
            </div>

            {/* Reminder */}
            <div className="col-md-3">
              <label className="form-label">Reminder</label>
              <select
                className="form-select"
                value={form.reminder}
                onChange={(e) => update("reminder", e.target.value as Reminder)}
              >
                <option value="No Reminder">No Reminder</option>
                <option value="15 Minutes Before">15 Minutes Before</option>
                <option value="1 Hour Before">1 Hour Before</option>
                <option value="1 Day Before">1 Day Before</option>
              </select>
            </div>

            {/* Tags */}
            <div className="col-md-6">
              <label className="form-label">Tags</label>
              <input
                className="form-control"
                placeholder="urgent, follow-up, legal"
                type="text"
                value={form.tags}
                onChange={(e) => update("tags", e.target.value)}
              />
              <small className="text-muted">Separate tags with commas</small>
            </div>

            {/* Visibility */}
            <div className="col-md-6">
              <label className="form-label">Visibility</label>
              <select
                className="form-select"
                value={form.visibility}
                onChange={(e) => update("visibility", e.target.value as Visibility)}
              >
                <option value="Private (Only Me)">Private (Only Me)</option>
                <option value="Team">Team</option>
                <option value="Public">Public</option>
              </select>
            </div>

            {/* Description */}
            <div className="col-md-12">
              <label className="form-label">Task Description</label>
              <textarea
                className="form-control"
                placeholder="Enter task details..."
                rows={3}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            {/* Attachments */}
            <div className="col-md-12">
              <label className="form-label">Attachment</label>
              <input
                className="form-control"
                type="file"
                onChange={(e) => update("attachment", e.target.files?.[0] ?? null)}
              />
              {form.attachment ? (
                <div className="small text-muted mt-1">Selected: {form.attachment.name}</div>
              ) : null}
            </div>

            {/* Internal Notes */}
            <div className="col-md-12">
              <label className="form-label">Internal Notes</label>
              <textarea
                className="form-control"
                placeholder="Only visible to staff"
                rows={2}
                value={form.internalNotes}
                onChange={(e) => update("internalNotes", e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="col-md-12 d-flex gap-2">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={reset}
                disabled={submitting}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
