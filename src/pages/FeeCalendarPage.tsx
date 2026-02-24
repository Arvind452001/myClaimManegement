import React, { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import type { EventClickArg, EventInput } from "@fullcalendar/core";

type AgreementType = "Standard" | "Custom";
type TLStatus = "Yes" | "No";
type PaymentMethod = "Deposit" | "Pick-Up";
type FeeStatus = "Paid" | "Fee Due" | "On Hold";

type FeeEventProps = {
  client: string;
  amount: string;
  status: FeeStatus;
  agreement: AgreementType;
  method: PaymentMethod;
  notes: string;
  TL: TLStatus;
};

type FilterValue = "All" | AgreementType | TLStatus | PaymentMethod;

export default function FeeCalendarPage(): JSX.Element {
  const eventsData: EventInput[] = useMemo(
    () => [
      {
        title: "John Doe – $1,800",
        start: "2026-01-05",
        backgroundColor: "#16a34a",
        borderColor: "#16a34a",
        extendedProps: {
          client: "John Doe",
          amount: "$1,800",
          status: "Paid",
          agreement: "Standard",
          method: "Deposit",
          notes: "Monthly TL processed.",
          TL: "Yes",
        } satisfies FeeEventProps,
      },
      {
        title: "Jane Smith – $950",
        start: "2026-01-08",
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
        extendedProps: {
          client: "Jane Smith",
          amount: "$950",
          status: "Fee Due",
          agreement: "Custom",
          method: "Pick-Up",
          notes: "Client will bring check.",
          TL: "No",
        } satisfies FeeEventProps,
      },
      {
        title: "Alex Brown – $2,250",
        start: "2026-01-12",
        backgroundColor: "#16a34a",
        borderColor: "#16a34a",
        extendedProps: {
          client: "Alex Brown",
          amount: "$2,250",
          status: "Paid",
          agreement: "Standard",
          method: "Deposit",
          notes: "Bi-weekly verification complete.",
          TL: "Yes",
        } satisfies FeeEventProps,
      },
      {
        title: "Maria Lee – HOLD",
        start: "2026-01-15",
        backgroundColor: "#dc2626",
        borderColor: "#dc2626",
        extendedProps: {
          client: "Maria Lee",
          amount: "$1,440",
          status: "On Hold",
          agreement: "Standard",
          method: "Deposit",
          notes: "Missing identification docs.",
          TL: "No",
        } satisfies FeeEventProps,
      },
      {
        title: "Chris Green – $1,980",
        start: "2026-01-18",
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
        extendedProps: {
          client: "Chris Green",
          amount: "$1,980",
          status: "Fee Due",
          agreement: "Custom",
          method: "Pick-Up",
          notes: "Pending final manager approval.",
          TL: "No",
        } satisfies FeeEventProps,
      },
      {
        title: "Sara White – $1,710",
        start: "2026-01-22",
        backgroundColor: "#16a34a",
        borderColor: "#16a34a",
        extendedProps: {
          client: "Sara White",
          amount: "$1,710",
          status: "Paid",
          agreement: "Standard",
          method: "Deposit",
          notes: "Verified via bank portal.",
          TL: "Yes",
        } satisfies FeeEventProps,
      },
      {
        title: "Mike Black – $1,890",
        start: "2026-01-26",
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
        extendedProps: {
          client: "Mike Black",
          amount: "$1,890",
          status: "Fee Due",
          agreement: "Standard",
          method: "Deposit",
          notes: "Invoice sent via email.",
          TL: "No",
        } satisfies FeeEventProps,
      },
    ],
    []
  );

  const [filterAgreement, setFilterAgreement] = useState<"All" | AgreementType>("All");
  const [filterTL, setFilterTL] = useState<"All" | TLStatus>("All");
  const [filterMethod, setFilterMethod] = useState<"All" | PaymentMethod>("All");

  const [appliedAgreement, setAppliedAgreement] = useState<typeof filterAgreement>("All");
  const [appliedTL, setAppliedTL] = useState<typeof filterTL>("All");
  const [appliedMethod, setAppliedMethod] = useState<typeof filterMethod>("All");

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<FeeEventProps | null>(null);

  const filteredEvents: EventInput[] = useMemo(() => {
    return eventsData.filter((ev) => {
      const p = ev.extendedProps as FeeEventProps;

      const okAgreement = appliedAgreement === "All" || p.agreement === appliedAgreement;
      const okTL = appliedTL === "All" || p.TL === appliedTL;
      const okMethod = appliedMethod === "All" || p.method === appliedMethod;

      return okAgreement && okTL && okMethod;
    });
  }, [eventsData, appliedAgreement, appliedTL, appliedMethod]);

  const statusBadgeClass = (status: FeeStatus) => {
    if (status === "Paid") return "bg-success";
    if (status === "On Hold") return "bg-danger";
    return "bg-primary";
  };

  const onApplyFilters = () => {
    setAppliedAgreement(filterAgreement);
    setAppliedTL(filterTL);
    setAppliedMethod(filterMethod);
  };

  const onEventClick = (info: EventClickArg) => {
    const props = info.event.extendedProps as FeeEventProps;
    setSelected(props);
    setShowModal(true);
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-0">
        <div>
          <h4 className="mb-2">
            <i className="fa fa-calendar" /> Fee Calendar
          </h4>
          <p className="text-muted small">Track and filter client fee schedules</p>
        </div>

        <div className="legend bg-white p-3 rounded-pill shadow-sm">
          <span>
            <div className="dot bg-success" /> Time Loss Paid
          </span>
          <span>
            <div className="dot bg-primary" /> Fee Due
          </span>
          <span>
            <div className="dot bg-danger" /> On Hold
          </span>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-3">
          <div className="card p-4 mb-4">
            <h6 className="fw-bold mb-3">
              <i className="fa fa-sliders me-2" />
              Filters
            </h6>

            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase">Agreement Type</label>
              <select
                className="form-select"
                value={filterAgreement}
                onChange={(e) => setFilterAgreement(e.target.value as FilterValue as any)}
              >
                <option value="All">All Agreements</option>
                <option value="Standard">Standard</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase">Time Loss (TL)</label>
              <select className="form-select" value={filterTL} onChange={(e) => setFilterTL(e.target.value as any)}>
                <option value="All">All</option>
                <option value="Yes">Yes (Paid)</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase">Payment Method</label>
              <select
                className="form-select"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value as any)}
              >
                <option value="All">All Methods</option>
                <option value="Deposit">Deposit</option>
                <option value="Pick-Up">Pick-Up</option>
              </select>
            </div>

            <button className="btn btn-primary w-100 mt-2" type="button" onClick={onApplyFilters}>
              <i className="fa fa-filter me-1" /> Update View
            </button>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card p-2">
            <div id="calendar">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek",
                }}
                themeSystem="bootstrap5"
                firstDay={1}
                height="auto"
                events={filteredEvents}
                eventClick={onEventClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content border-0 shadow">
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-bold">Transaction Details</h5>
              <button className="btn-close" type="button" onClick={() => setShowModal(false)} />
            </div>

            <div className="modal-body p-4">
              {selected ? (
                <div className="row g-4">
                  <div className="col-6">
                    <label className="text-muted small d-block">Client Name</label>
                    <span className="fw-bold">{selected.client}</span>
                  </div>

                  <div className="col-6">
                    <label className="text-muted small d-block">Amount</label>
                    <span className="fw-bold text-success">{selected.amount}</span>
                  </div>

                  <div className="col-6">
                    <label className="text-muted small d-block">Status</label>
                    <span className={`badge rounded-pill ${statusBadgeClass(selected.status)}`}>
                      {selected.status}
                    </span>
                  </div>

                  <div className="col-6">
                    <label className="text-muted small d-block">Method</label>
                    <span>{selected.method}</span>
                  </div>

                  <div className="col-12 border-top pt-3">
                    <label className="text-muted small d-block">Internal Notes</label>
                    <p className="mb-0">{selected.notes}</p>
                  </div>
                </div>
              ) : (
                <div className="text-muted">No event selected.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal ? <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} /> : null}

      <style>{`
        .fc .fc-toolbar-title {
          font-weight: 700;
          font-size: 1.25rem;
        }

        .legend span {
          display: inline-flex;
          align-items: center;
          margin-right: 16px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }

        #calendar {
          min-height: 650px;
          background: white;
          padding: 15px;
          border-radius: 12px;
        }

        :global(.fc-event) {
          cursor: pointer;
          padding: 2px 5px;
          border: none !important;
        }

        :global(.fc-day-sat) {
          background-color: #f0f9ff !important;
        }

        :global(.fc-day-sun) {
          background-color: #fff1f2 !important;
        }
      `}</style>
    </>
  );
}
