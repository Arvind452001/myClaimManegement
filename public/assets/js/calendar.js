let calendar;
let tasks=[];
let editEvent=null;

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "auto",
    selectable: true,
    editable: false,
    eventDisplay: "block",

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay"
    },

    // ✅ CLICK EMPTY DATE → CREATE EVENT
    dateClick: function (info) {
      window.location.href = "create_event.html?date=" + info.dateStr;
    },

    // ✅ CLICK EVENT → OPEN EDIT MODAL
    eventClick: function (info) {
      info.jsEvent.preventDefault(); // ⛔ stop redirect

      const event = info.event;

      document.getElementById("editId").value = event.id;
      document.getElementById("editCase").value =
        event.extendedProps.caseId || "";

      document.getElementById("editType").value =
        event.extendedProps.type || event.title;

      document.getElementById("editDate").value =
        event.startStr.split("T")[0];

      document.getElementById("editStatus").value =
        event.extendedProps.status || "Active";

      // Notes toggle
      if (event.extendedProps.status === "Completed") {
        document.getElementById("noteBox").style.display = "block";
        document.getElementById("editNotes").value =
          event.extendedProps.notes || "";
      } else {
        document.getElementById("noteBox").style.display = "none";
        document.getElementById("editNotes").value = "";
      }

      const modal = new bootstrap.Modal(
        document.getElementById("editModal")
      );
      modal.show();
    },

    // ✅ SAMPLE EVENTS (REPLACE WITH API LATER)
    events: [
      {
        id: "1",
        title: "Client Appointment",
        start: "2026-01-20",
        backgroundColor: "#0d6efd",
        extendedProps: {
          caseId: "Case-101",
          type: "Client Appointment – In Person",
          status: "Active",
          notes: ""
        }
      },
      {
        id: "2",
        title: "Department Deadline",
        start: "2026-01-22",
        backgroundColor: "#dc3545",
        extendedProps: {
          caseId: "Case-202",
          type: "Department Order – Deadline",
          status: "Completed",
          notes: "Submitted on time"
        }
      }
    ]
  });

  calendar.render();
});
