import React, { useEffect, useMemo, useState } from "react";
import { casesAPI, eventsAPI } from "../utils/api";

type EventStatus = "" | "Pending" | "Active" | "Completed" | "Cancelled";

type EventType =
  | ""
  | "Hearing"
  | "Client Appointment"
  | "Reminder"
  | "Department Order"
  | "To-Do";

type FormState = {
  caseId: string;
  title: string;
  eventType: EventType;
  eventDate: string;
  status: EventStatus;

  // optional department order fields
  orderDate: string;
  deadlineDate: string;
  orderType: string;

  outcomeNotes: string;
};
type CaseOption = {
  _id: string;
  caseId: string;
};

const today = new Date().toISOString().split("T")[0];

export default function CreateEventPage(): JSX.Element {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const caseOptions = useMemo(
    () => ["698b00cef02fa2450424b644"],
    []
  );

  const eventTypes = useMemo<EventType[]>(
    () => ["", "Hearing", "Client Appointment", "Reminder", "Department Order", "To-Do"],
    []
  );

const [cases, setCases] = useState<CaseOption[]>([]);
const [loadingCases, setLoadingCases] = useState(true);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormState>({
    caseId: "",
    title: "",
    eventType: "",
    eventDate: "",
    status: "",
    orderDate: "",
    deadlineDate: "",
    orderType: "",
    outcomeNotes: "",
  });

  const isDepartmentOrder = form.eventType === "Department Order";
  const showOutcomeNotes = form.status === "Completed";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.caseId || !form.title || !form.eventType || !form.eventDate || !form.status) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        caseId: form.caseId,
        roleUserId: user?._id, // 🔥 required by backend
        title: form.title.trim(),
        eventType: form.eventType,
        eventDate: form.eventDate, // YYYY-MM-DD works
        status: form.status,
      };

    const res=  await eventsAPI.create(payload);
// console.log("res",res)
      alert("Event created successfully");

      // Reset form
      setForm({
        caseId: "",
        title: "",
        eventType: "",
        eventDate: "",
        status: "",
        orderDate: "",
        deadlineDate: "",
        orderType: "",
        outcomeNotes: "",
      });

    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!form.outcomeNotes.trim()) {
      alert("Outcome Notes is required to complete the event.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        caseId: form.caseId,
        roleUserId: user?._id,
        title: form.title.trim(),
        eventType: form.eventType,
        eventDate: form.eventDate,
        status: "Completed",
      };

      // await axios.post("/events/create", payload);

      alert("Event completed successfully");

    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to complete");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const fetchCases = async () => {
    try {
      const res = await casesAPI.getAllCases(); // 👈 use your actual method name

      // handle different response shapes safely
      const data = res?.data?.data || res?.data || res || [];
// console.log(data)
      setCases(data);
    } catch (error) {
      console.error("Failed to fetch cases", error);
    } finally {
      setLoadingCases(false);
    }
  };

  fetchCases();
}, []);

  return (
    <div className="card">
      <div className="card-header">
        <h5>Create Event</h5>
      </div>

      <div className="card-body">
        <form onSubmit={handleSave}>

          {/* Case */}
      <select
  className="form-select mb-2"
  value={form.caseId}
  onChange={(e) =>
    setForm((p) => ({ ...p, caseId: e.target.value }))
  }
>
  <option value="">Select Case</option>

  {cases.map((c) => (
    <option key={c._id} value={c._id}>
      {c.caseId}
    </option>
  ))}
</select>


          {/* Title */}
          <input
            className="form-control mb-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm((p) => ({ ...p, title: e.target.value }))
            }
          />

          {/* Event Type */}
          <select
            className="form-select mb-2"
            value={form.eventType}
            onChange={(e) =>
              setForm((p) => ({ ...p, eventType: e.target.value as EventType }))
            }
          >
            <option value="">Select Event Type</option>
            {eventTypes
              .filter((x) => x !== "")
              .map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
          </select>

          {/* Date */}
       <input
  type="date"
  className="form-control mb-2"
  min={today}   // 👈 prevents past dates
  value={form.eventDate}
  onChange={(e) =>
    setForm((p) => ({ ...p, eventDate: e.target.value }))
  }
/>

          {/* Status */}
          <select
            className="form-select mb-2"
            value={form.status}
            onChange={(e) =>
              setForm((p) => ({ ...p, status: e.target.value as EventStatus }))
            }
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Department Order Section */}
          {isDepartmentOrder && (
            <div className="border rounded p-3 bg-light mb-3">
              <h6>Department Order Details</h6>

        <input
  type="date"
  className="form-control mb-2"
  min={today}
  value={form.orderDate}
  onChange={(e) =>
    setForm((p) => ({ ...p, orderDate: e.target.value }))
  }
/>

<input
  type="date"
  className="form-control mb-2"
  min={today}
  value={form.deadlineDate}
  onChange={(e) =>
    setForm((p) => ({ ...p, deadlineDate: e.target.value }))
  }
/>

              <input
                className="form-control"
                placeholder="Order Type"
                value={form.orderType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, orderType: e.target.value }))
                }
              />
            </div>
          )}

          {/* Outcome Notes */}
          {showOutcomeNotes && (
            <textarea
              className="form-control mb-2"
              placeholder="Outcome Notes"
              value={form.outcomeNotes}
              onChange={(e) =>
                setForm((p) => ({ ...p, outcomeNotes: e.target.value }))
              }
            />
          )}

          <div className="d-flex gap-2">
            <button className="btn btn-success" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>

            {showOutcomeNotes && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleComplete}
                disabled={loading}
              >
                Complete Event
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
