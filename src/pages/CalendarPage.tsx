import React, { useEffect, useMemo, useState } from "react";
import { casesAPI, eventsAPI } from "../utils/api";

type Status = "Pending" | "Completed" | "Cancelled";

type EventType =
  | "Client Appointment – In Person"
  | "Potential Client Appointment – In Person"
  | "VRC Appointment – In Person"
  | "VRC Call – Phone" // ✅ ADD THIS
  | "BIIA Call – Phone"
  | "Client Call – Phone"
  | "Potential Client Call – Phone"
  | "Department Order – Deadline"
  | "Reminder"
  | "To-Do";

type CalendarEvent = {
  id: string;
  caseId: string;
  title: string;

  eventType: EventType; // backend field
  eventDate: string; // backend field

  type: EventType; // 👈 add this
  date: string; // 👈 also add this (since you use e.date)

  status: Status;
  notes?: string;
};

function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
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
                    Close
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

function statusBadge(status: Status) {
  if (status === "Pending") return "bg-primary";
  if (status === "Completed") return "bg-success";
  return "bg-secondary";
}

function typeGroup(
  type: EventType,
): "Appointment" | "Call" | "Department" | "Reminder" | "To-Do" {
  if (type.includes("Appointment")) return "Appointment";
  if (type.includes("Call")) return "Call";
  if (type.includes("Department")) return "Department";
  if (type === "Reminder") return "Reminder";
  return "To-Do";
}

function isSameDay(a: string, b: string) {
  return a === b;
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthGrid(base: Date) {
  const year = base.getFullYear();
  const month = base.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  // Monday-start grid
  const startDayIndex = (firstOfMonth.getDay() + 6) % 7; // Sun=0 -> 6, Mon=1 -> 0
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - startDayIndex);

  const end = new Date(lastOfMonth);
  const endDayIndex = (lastOfMonth.getDay() + 6) % 7;
  end.setDate(lastOfMonth.getDate() + (6 - endDayIndex));

  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return { days, year, month };
}

export default function CalendarPage(): JSX.Element {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const [caseFilter, setCaseFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [monthCursor, setMonthCursor] = useState<Date>(new Date());
  const monthData = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [edit, setEdit] = useState<CalendarEvent | null>(null);

  const [notify, setNotify] = useState<{
    show: boolean;
    text: string;
    type: "success" | "error";
  }>({
    show: false,
    text: "",
    type: "success",
  });

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // console.log("events", events);
  //===========FETCH DATA==========//
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await eventsAPI.getAll();

      // handle both response formats
      const raw = Array.isArray(res) ? res : res?.data || [];

      const formatted: CalendarEvent[] = raw.map((e: any) => {
        const safeDate = e?.eventDate
          ? new Date(e.eventDate).toISOString().split("T")[0]
          : "";

        return {
          id: e?._id || "",

          caseId:
            typeof e?.caseId === "object"
              ? e?.caseId?.caseId || ""
              : e?.caseId || "",

          title: e?.title || "",

          type: (e?.eventType || "Reminder") as EventType,
          eventType: (e?.eventType || "Reminder") as EventType,

          date: safeDate,
          eventDate: e?.eventDate || "",

          status: (e?.status || "Pending") as Status,
          notes: e?.notes || "",
        };
      });

      setEvents(formatted);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const okCase = !caseFilter || e.caseId === caseFilter;
      const okType = !typeFilter || typeGroup(e.type) === typeFilter;
      const okStatus = !statusFilter || e.status === statusFilter;
      return okCase && okType && okStatus;
    });
  }, [events, caseFilter, typeFilter, statusFilter]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const e of filteredEvents) {
      if (!e.date) continue;

      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }

    for (const [k, list] of map.entries()) {
      map.set(
        k,
        list.slice().sort((a, b) => (a.type || "").localeCompare(b.type || "")),
      );
    }

    return map;
  }, [filteredEvents]);

  const openEditModal = (ev: CalendarEvent) => {
    setEdit(ev);
    setOpenModal(true);
  };

  const closeModal = () => {
    setEdit(null);
    setOpenModal(false);
  };

  const updateEvent = async () => {
    if (!edit) return;

    try {
      setLoading(true);

      const payload = {
        id: edit.id,
        title: edit.title,
        eventType: edit.eventType,
        eventDate: edit.eventDate,
        status: edit.status,
      };

      await eventsAPI.update(payload);

      setEvents((prev) =>
        prev.map((x) => (x.id === edit.id ? { ...x, ...edit } : x)),
      );

      setNotify({
        show: true,
        text: "Event updated successfully.",
        type: "success",
      });

      setTimeout(
        () => setNotify({ show: false, text: "", type: "success" }),
        1800,
      );

      closeModal();
    } catch (error: any) {
      setNotify({
        show: true,
        text: error?.response?.data?.message || "Update failed.",
        type: "error",
      });

      setTimeout(
        () => setNotify({ show: false, text: "", type: "error" }),
        2500,
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async () => {
    if (!edit) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?",
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);

      await eventsAPI.delete(edit.id);

      // ✅ UI se turant remove
      setEvents((prev) => prev.filter((e) => e.id !== edit.id));

      setNotify({
        show: true,
        text: "Event deleted successfully.",
        type: "success",
      });

      closeModal();
    } catch (error) {
      console.error("Delete failed:", error);

      setNotify({
        show: true,
        text: "Failed to delete event.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <section className="mb-4">
        <div className="d-flex justify-content-between mb-3">
          <h4 className="mb-0">📅 Case Management Calendar</h4>
          <a className="btn btn-primary" href="/create_event">
            + Create Event
          </a>
        </div>

        {/* FILTERS */}
        <div className="row mb-3">
          <div className="col-md-4">
            <select
              className="form-select"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
            >
              <option value="">Filter by Case</option>
              <option value="Case-101">Case-101</option>
              <option value="Case-202">Case-202</option>
            </select>
          </div>

          <div className="col-md-4">
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Filter by Type</option>
              <option value="Appointment">Appointment</option>
              <option value="Call">Call</option>
              <option value="Department">Department</option>
              <option value="Reminder">Reminder</option>
              <option value="To-Do">To-Do</option>
            </select>
          </div>

          <div className="col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="box">
          <div className="card p-3">
            {/* Calendar Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() =>
                    setMonthCursor(
                      (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
                    )
                  }
                >
                  Prev
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() => setMonthCursor(new Date())}
                >
                  Today
                </button>

                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() =>
                    setMonthCursor(
                      (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
                    )
                  }
                >
                  Next
                </button>
              </div>

              <div className="fw-semibold">
                {new Date(monthData.year, monthData.month, 1).toLocaleString(
                  undefined,
                  {
                    month: "long",
                    year: "numeric",
                  },
                )}
              </div>

              <div className="text-muted small">
                {filteredEvents.length} event
                {filteredEvents.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Week Header */}
            <div className="calendar-grid calendar-head">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="calendar-cell head">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="calendar-grid">
              {monthData.days.map((d) => {
                const iso = toISODate(d);
                const inMonth = d.getMonth() === monthData.month;
                const list = eventsByDay.get(iso) ?? [];

                const selected = selectedDay && isSameDay(selectedDay, iso);

                return (
                  <div
                    key={iso}
                    className={`calendar-cell day ${inMonth ? "" : "muted"} ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => setSelectedDay(iso)}
                    role="button"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="daynum">{d.getDate()}</div>
                      {list.length > 0 ? (
                        <span className="badge bg-light text-dark">
                          {list.length}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 d-grid gap-1">
                      {list.slice(0, 3).map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          className={`event-pill ${ev.status.toLowerCase()}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(ev);
                          }}
                          title={`${ev.caseId} • ${ev.type}`}
                        >
                          <span className="event-case">caseId-{ev.caseId}</span>
                          <span className="event-type">status-{ev.status}</span>
                          <span className="event-type">type-{ev.type}</span>
                        </button>
                      ))}

                      {list.length > 3 ? (
                        <div className="more text-muted small">
                          +{list.length - 3} more
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day Detail Panel */}
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="fw-semibold">
                  {selectedDay ? `Selected: ${selectedDay}` : "Select a day"}
                </div>
                {/* <button
  className="btn btn-outline-primary btn-sm"
  type="button"
  onClick={() => {
    if (!selectedDay) return;

    const newEv: CalendarEvent = {
      id: String(Date.now()),
      caseId: caseFilter || "Case-101",
      title: "Quick Reminder",
      eventType: "Reminder",
      eventDate: new Date(selectedDay).toISOString(),
      status: "Active",
    };
console.log(newEv)
    setEvents((prev) => [newEv, ...prev]); // 👈 required
  }}
  disabled={!selectedDay}
>
  + Quick Reminder
</button> */}
              </div>

              {selectedDay ? (
                <div className="mt-2 card p-3">
                  {(eventsByDay.get(selectedDay) ?? []).length === 0 ? (
                    <div className="text-muted">No events on this day.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Case</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(eventsByDay.get(selectedDay) ?? []).map((ev) => (
                            <tr key={ev.id}>
                              <td className="fw-semibold">{ev.caseId}</td>
                              {/* <td>{ev.type}</td> */}
                              <td>
                                <span
                                  className={`badge ${statusBadge(ev.status)}`}
                                >
                                  {ev.status}
                                </span>
                              </td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openEditModal(ev)}
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Notify */}
        {notify.show ? (
          <div className="notify">
            <div className={`notify-inner ${notify.type}`}>{notify.text}</div>
          </div>
        ) : null}
      </section>

      {/* EDIT EVENT MODAL */}
      <Modal
        open={openModal}
        title="Edit Event"
        onClose={closeModal}
        size="md"
        footer={
          <>
            <button
              className="btn btn-danger me-auto"
              type="button"
              onClick={deleteEvent}
            >
              Delete
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={closeModal}
            >
              Close
            </button>

            <button
              className="btn btn-primary"
              type="button"
              onClick={updateEvent}
            >
              Update
            </button>
          </>
        }
      >
        {!edit ? null : (
          <div>
            <div className="mb-2">
              <label className="form-label">Case ID</label>
              <input
                className="form-control"
                value={edit.caseId}
                onChange={(e) => setEdit({ ...edit, caseId: e.target.value })}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Event Type</label>
              <select
                className="form-select"
                value={edit.type}
                onChange={(e) =>
                  setEdit({ ...edit, type: e.target.value as EventType })
                }
              >
                <option>Client Appointment – In Person</option>
                <option>Potential Client Appointment – In Person</option>
                <option>VRC Appointment – In Person</option>
                <option>VRC Call – Phone</option> {/* ✅ ADD */}
                <option>BIIA Call – Phone</option>
                <option>Client Call – Phone</option>
                <option>Potential Client Call – Phone</option>
                <option>Department Order – Deadline</option>
                <option>Reminder</option>
                <option>To-Do</option>
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Date</label>
              <input
                className="form-control"
                type="date"
                value={edit.date}
                onChange={(e) => setEdit({ ...edit, date: e.target.value })}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={edit.status}
                onChange={(e) =>
                  setEdit({ ...edit, status: e.target.value as Status })
                }
              >
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            {/* Outcome Notes required when completed */}
            <div
              className={`mb-2 ${edit.status === "Completed" ? "" : "d-none"}`}
            >
              <label className="form-label">
                Outcome Notes <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                value={edit.notes ?? ""}
                onChange={(e) => setEdit({ ...edit, notes: e.target.value })}
              />
            </div>
          </div>
        )}
      </Modal>

      <style>{`
  section {
    font-size: 13px;
  }

  h4 {
    font-size: 18px;
  }

  .btn {
    font-size: 12px;
    padding: 4px 8px;
  }

  .form-select {
    font-size: 12px;
    padding: 4px 6px;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px; /* smaller gap */
  }

  .calendar-cell {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 6px;
    min-height: 85px; /* smaller height */
  }

  .calendar-cell.head {
    min-height: auto;
    text-align: center;
    font-weight: 600;
    background: #f8f9fc;
    border: 1px solid #f0f0f0;
    font-size: 12px;
    padding: 6px;
  }

  .calendar-cell.day:hover {
    border-color: #0d6efd;
    box-shadow: 0 4px 10px rgba(13, 110, 253, 0.08);
  }

  .calendar-cell.muted {
    opacity: 0.45;
  }

  .calendar-cell.selected {
    border-color: #0d6efd;
    box-shadow: 0 6px 14px rgba(13, 110, 253, 0.12);
  }

  .daynum {
    font-weight: 600;
    font-size: 12px;
  }

  .badge {
    font-size: 10px;
    padding: 2px 6px;
  }

  .event-pill {
    width: 100%;
    border: 0;
    text-align: left;
    border-radius: 6px;
    padding: 4px 6px;
    font-size: 10px; /* smaller text */
    display: flex;
    flex-direction: column;
    gap: 1px;
    cursor: pointer;
  }

  .event-pill .event-case {
    font-weight: 600;
    font-size: 10px;
  }

  .event-pill .event-type {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 9px;
  }

  .event-pill.active {
    background: rgba(13, 110, 253, 0.12);
    color: #0d6efd;
  }

  .event-pill.completed {
    background: rgba(22, 163, 74, 0.12);
    color: #16a34a;
  }

  .event-pill.cancelled {
    background: rgba(107, 114, 128, 0.12);
    color: #6b7280;
  }

  .more {
    font-size: 10px;
    padding-left: 2px;
  }

  .table th,
  .table td {
    font-size: 12px;
    padding: 6px;
  }

  .notify {
    position: fixed;
    top: 15px;
    right: 15px;
    z-index: 9999;
  }

  .notify-inner {
    background: #008000;
    color: #fff;
    padding: 20px 40px;
    font-size: 12px;
    border-radius: 8px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
    max-width: 280px;
  }

  .modal-body label {
    font-size: 12px;
  }

  .modal-body input,
  .modal-body select,
  .modal-body textarea {
    font-size: 12px;
    padding: 4px 6px;
  }
`}</style>
    </>
  );
}
