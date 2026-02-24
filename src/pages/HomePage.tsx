import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { contactsAPI, tasksAPI } from "../utils/api";

type TaskPriority = "High" | "Medium" | "Low";
type TaskStatus = "Pending" | "In Progress" | "Completed";

type Task = {
  _id: string;
  title: string;
  client: string;
  assignedTo: string;
  dueDate: string; // "15 Jan 2026"
  priority: TaskPriority;
  status: TaskStatus;
};

type ContactStatus = "Active" | "Pending" | "Inactive";

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ContactStatus;
};

const dayNames = [
  { label: "Sun", key: "sun" },
  { label: "Mon", key: "mon" },
  { label: "Tue", key: "tue" },
  { label: "Wed", key: "wed" },
  { label: "Thu", key: "thu" },
  { label: "Fri", key: "fri" },
  { label: "Sat", key: "sat" },
] as const;

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatMonthTitle(date: Date) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function getCalendarCells(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekDay = firstDayOfMonth.getDay(); // 0..6

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // blanks before 1st day
  const cells: Array<{ date: Date | null }> = [];
  for (let i = 0; i < startWeekDay; i++) cells.push({ date: null });

  // real days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d) });
  }

  // pad to full weeks (optional)
  while (cells.length % 7 !== 0) cells.push({ date: null });

  return cells;
}

export default function HomePage(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const today = useMemo(() => new Date(), []);
  // console.log("contacts",contacts)
  // Example event dots (put any dates you want)
  const eventDates = useMemo(() => {
    return new Set<string>([
      // YYYY-MM-DD
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate(),
      ).padStart(2, "0")}`,
    ]);
  }, [today]);

  const cells = useMemo(() => getCalendarCells(viewDate), [viewDate]);

  const onPrevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const onNextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const getPriorityBadge = (p: TaskPriority) => {
    if (p === "High") return "bg-danger";
    if (p === "Medium") return "bg-warning";
    return "bg-success";
  };

  const getStatusBadge = (s: TaskStatus) => {
    if (s === "Pending") return "bg-warning";
    if (s === "In Progress") return "bg-info";
    return "bg-success";
  };

  const getContactBadge = (s: ContactStatus) => {
    if (s === "Active") return "bg-success";
    if (s === "Pending") return "bg-warning";
    return "bg-danger";
  };

  useEffect(() => {
    fetchTasks();
    fetchContacts();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await tasksAPI.getRecent();

      const formattedTasks = res?.data?.map((t: any) => ({
        _id: t._id,
        title: t.taskTitle,
        client: t.caseId?.caseId || "N/A",
        assignedTo: t.assignedTo?.name || "Unassigned",
        dueDate: t.deadline ? new Date(t.deadline).toLocaleDateString() : "N/A",
        priority: t.priority,
        status: t.status,
      }));

      setTasks(formattedTasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks");
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contactsAPI.getAll();

      // Extract data from API response
      const contactsFromApi = response.data || response;
      // console.log("contactsFromApi",contactsFromApi)
      const formatted: Contact[] = contactsFromApi.map((item: any) => ({
        id: item._id || item.id,
        name: item.name,
        phone: item.phone,
        email: item.email,
        status: item.status as ContactStatus,
        assignedTo: item.assignedTo || {
          _id: "",
          name: "Unassigned",
          email: "",
        },
        createdBy: item.createdBy,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      setContacts(formatted);
    } catch (error: any) {
      console.error("Error fetching contacts:", error.message);
    }
  };

  return (
    <>
      <section className="mb-4" id="analytics">
        <div className="row g-3">
          {/* LEFT BLOCK */}
          <div className="col-md-8">
            <div className="card p-3 shadow-sm">
              <div className="row g-4">
                <div className="col-md-6">
                  <a href="/calendar" style={{ textDecoration: "none" }}>
                    <div className="stat-box card-bluee">
                      <div>
                        <h5 className="text-dark fw-bold">Calendar</h5>
                      </div>
                      <div className="icon-box">
                        <i className="fa fa-calendar" />
                      </div>
                    </div>
                  </a>
                </div>

                <div className="col-md-6">
                  <a href="/tasks" style={{ textDecoration: "none" }}>
                    <div className="stat-box card-bluee">
                      <div>
                        <h5 className="text-dark fw-bold">Tasks</h5>
                      </div>
                      <div className="icon-box">
                        <i className="fas fa-tasks" />
                      </div>
                    </div>
                  </a>
                </div>

                <div className="col-md-6">
                  <a href="/cases" style={{ textDecoration: "none" }}>
                    <div className="stat-box card-bluee">
                      <div>
                        <h5 className="text-dark fw-bold">Cases</h5>
                      </div>
                      <div className="icon-box">
                        <i className="fas fa-briefcase" />
                      </div>
                    </div>
                  </a>
                </div>

                <div className="col-md-6">
                  <a href="/messages" style={{ textDecoration: "none" }}>
                    <div className="stat-box card-bluee">
                      <div>
                        <h5 className="text-dark fw-bold">Messages</h5>
                      </div>
                      <div className="icon-box">
                        <i className="fas fa-comment" />
                      </div>
                    </div>
                  </a>
                </div>

                <div className="col-md-6">
                  <a href="/calllog-text" style={{ textDecoration: "none" }}>
                    <div className="stat-box card-bluee">
                      <div>
                        <h5 className="text-dark fw-bold">Call log</h5>
                      </div>
                      <div className="icon-box">
                        <i className="fas fa-phone" />
                      </div>
                    </div>
                  </a>
                </div>

                <div className="col-md-6">
                  <a href="/time-loss" style={{ textDecoration: "none" }}>
                    <div className="stat-box card-bluee">
                      <div>
                        <h5 className="text-dark fw-bold">Time Loss</h5>
                      </div>
                      <div className="icon-box">
                        <i className="fa fa-clock" />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT BLOCK */}
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5 className="mb-2">Recent Tasks</h5>

              <ul
                className="list-group list-group-flush pt-2"
                style={{
                  maxHeight: "335px", // height increased
                  overflowY: "auto",
                }}
              >
                {loadingTasks ? (
                  <li className="list-group-item text-center">Loading...</li>
                ) : tasks.length === 0 ? (
                  <li className="list-group-item text-center text-muted">
                    No tasks found
                  </li>
                ) : (
                  tasks.map((t) => (
                    <li key={t._id} className="list-group-item p-0 pb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{t.title}</h6>
                          <small className="text-muted">
                            Client: {t.client}
                          </small>
                          <br />
                          <small className="text-muted">
                            Assigned To: {t.assignedTo}
                          </small>
                          <br />
                          <small className="text-muted">
                            Due Date: {t.dueDate}
                          </small>
                        </div>

                        <div className="text-end">
                          <span
                            className={`badge ${getPriorityBadge(t.priority)}`}
                          >
                            {t.priority} Priority
                          </span>
                          <br />
                          <span
                            className={`badge ${getStatusBadge(t.status)} mt-2`}
                          >
                            {t.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>

              <a className="btn btn-sm btn-primary" href="/tasks">
                View All
              </a>
            </div>
          </div>
        </div>

        {/* SECOND ROW */}
        <div className="row mt-2">
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0 pb-2 border-bottom">Calendar Overview</h5>
              </div>

              <div className="card-body">
                <div className="mini-calendar" id="miniCalendar">
                  <div className="calendar-header d-flex justify-content-between align-items-center mb-2">
                    <button
                      className="btn btn-sm btn-light"
                      onClick={onPrevMonth}
                      type="button"
                    >
                      <i className="fa fa-chevron-left" />
                    </button>

                    <h6 className="mb-0 fw-bold">
                      {formatMonthTitle(viewDate)}
                    </h6>

                    <button
                      className="btn btn-sm btn-light"
                      onClick={onNextMonth}
                      type="button"
                    >
                      <i className="fa fa-chevron-right" />
                    </button>
                  </div>

                  <div className="calendar-grid">
                    {dayNames.map((d) => (
                      <div
                        key={d.key}
                        className={`day-name ${d.key === "sun" ? "sunday" : ""} ${
                          d.key === "sat" ? "saturday" : ""
                        }`}
                      >
                        {d.label}
                      </div>
                    ))}
                  </div>

                  <div className="calendar-grid" id="calendarDays">
                    {cells.map((cell, idx) => {
                      if (!cell.date) {
                        return (
                          <div
                            key={idx}
                            className="calendar-day"
                            style={{ opacity: 0 }}
                          />
                        );
                      }

                      const d = cell.date;
                      const weekday = d.getDay();
                      const isSun = weekday === 0;
                      const isSat = weekday === 6;
                      const isToday = sameDay(d, today);

                      const dateKey = `${d.getFullYear()}-${String(
                        d.getMonth() + 1,
                      ).padStart(
                        2,
                        "0",
                      )}-${String(d.getDate()).padStart(2, "0")}`;

                      const hasEvent = eventDates.has(dateKey);

                      return (
                        <div
                          key={idx}
                          className={[
                            "calendar-day",
                            isToday ? "today" : "",
                            isSun ? "sunday" : "",
                            isSat ? "saturday" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          title={dateKey}
                          onClick={() => {
                            // hook for click action
                            // console.log("Clicked:", dateKey);
                          }}
                        >
                          {d.getDate()}
                          {hasEvent ? <span className="event-dot" /> : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACTS */}
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0 pb-2 border-bottom">Recent Contacts</h5>
              </div>

              <div
                className="contacts-scroll"
                style={{
                  maxHeight: "238px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <ul className="list-group list-group-flush px-1">
                  {contacts.map((c) => (
                    <li key={c.id} className="list-group-item p-0 pb-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{c.name}</h6>
                          <small className="text-muted">Email: {c.email}</small>
                          <br />
                          <small className="text-muted">Phone: {c.phone}</small>
                          <br />
                          <small className="text-muted">
                            Company: {c.company}
                          </small>
                        </div>

                        <div className="text-end">
                          <span
                            className={`badge ${getContactBadge(c.status)}`}
                          >
                            {c.status}
                          </span>
                          <br />
                         
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* View All Button */}
              <div className="p-2">
                <a className="btn btn-sm btn-primary w-100" href="/contacts">
                  View All
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* styles (same as your original css) */}
      <style>{`
        .mini-calendar {
          font-size: 14px;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .day-name {
          text-align: center;
          font-weight: 600;
          color: #666;
        }

        .sunday {
          color: #dc3545;
        }

        .saturday {
          color: #f08a8a;
        }

        .calendar-day {
          height: 45px;
          border-radius: 6px;
          text-align: center;
          padding-top: 6px;
          cursor: pointer;
          position: relative;
          background: #f8f9fa;
          user-select: none;
        }

        .calendar-day:hover {
          background: #e9ecef;
        }

        .calendar-day.today {
          background: #235bda;
          color: #fff;
          font-weight: bold;
        }

        .calendar-day.sunday {
          background: #ffecec;
        }

        .calendar-day.saturday {
          background: #fff3f3;
        }

        .event-dot {
          width: 6px;
          height: 6px;
          background: #28a745;
          border-radius: 50%;
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
        }
      `}</style>
    </>
  );
}
