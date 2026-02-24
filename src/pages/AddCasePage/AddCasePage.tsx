/**
 * =========================================================
 * AddCasePage
 * ---------------------------------------------------------
 * Parent container for full Case Management multi-step form.
 * Handles:
 * - Tab navigation
 * - State management
 * - API integration
 * - Step-by-step saving
 * =========================================================
 */

import React, { useMemo, useState } from "react";
import { casesAPI } from "../../utils/api";

/* ============================
   Tab Components
============================ */
import OverviewTab from "./tabs/OverviewTab";
import ClaimTab from "./tabs/ClaimTab";
import ActivityTab from "./tabs/ActivityTab";
import NotesTab from "./tabs/NotesTab";
import InternalMessageTab from "./tabs/InternalMessageTab";
import CommunicationTab from "./tabs/CommunicationTab";
import EmailsTab from "./tabs/EmailTab";
import TimeLossTab from "./tabs/TimeLossTab";
import ProtestTab from "./tabs/ProtestTab";
import DocumentsTab from "./tabs/DocumentsTab";

/* ============================
   Form Types (from central types file)
============================ */
import {
  ActivityForm,
  CommunicationForm,
  DocsForm,
  EmailForm,
  NotesForm,
  ProtestForm,
  TLForm,
} from "./types/case.types";

/* ============================
   Local Utility Types (Used only here)
============================ */
type VocationalStatus =
  | "VR"
  | "AWA"
  | "Plan Development"
  | "Plan Implementation"
  | "Closed";

type YesNo = "Yes" | "No";
type PaidPending = "Paid" | "Pending";
type MsgFrom = "Admin" | "Client";
type Visibility = "Internal" | "Admin-only";
type MsgStatus = "Resolved" | "Unresolved";
type MsgAction = "Call Back" | "No Call";
type ProtestStatus = "Protested" | "Appealed" | "No Action";
type ProtestOutcome = "Reversed" | "Affirmed" | "Dismissed" | "Closed";

/* ============================
   Overview Form Type
============================ */
type OverviewForm = {
  caseTitle: string;

  // Client Info
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  clientWork: string;
  clientDob: string;
  emergencyContact: string;

  // Claim Info
  claimNo: string;
  doi: string;
  cm: string;
  cmPhone: string;
  supervisor: string;
  supervisorPhone: string;
  employer: string;
  tpa: string;
  tpaPhone: string;
  si: string;
  siPhone: string;
  provider: string;
  providerPhone: string;
  vrc: string;
  vrcPhone: string;
  vocationalStatus: VocationalStatus;
  roa: string;
  allowedConditions: string;
  tl: YesNo;
  lastApf: string;
  lastWsf: string;
};

type LogType = "Call" | "Text";
type Direction = "Incoming" | "Outgoing";
type ContactRole =
  | "Client"
  | "Potential Client"
  | "CM"
  | "VRC"
  | "Provider"
  | "BIIA"
  | "Employer"
  | "Other";

/* ============================
   Tab Key Enum
============================ */
type TabKey =
  | "overview"
  | "claim"
  | "activity"
  | "notes"
  | "communication"
  | "emails"
  | "tl"
  | "docs"
  | "protest";

/* ============================
   Tab Flow Order
============================ */
const tabFlow: TabKey[] = [
  "overview",
  "claim",
  "activity",
  "notes",
  "communication",
  "emails",
  "tl",
  "docs",
  "protest",
];
/* ============================
   Logged-in User (from localStorage)
============================ */
const storedUser = localStorage.getItem("user");
const loggedInUser = storedUser ? JSON.parse(storedUser) : null;

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function AddCasePage(): JSX.Element {
  /* -------------------------------------------------------
     Core State
  ------------------------------------------------------- */
  const [caseId, setCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [saving, setSaving] = useState(false);

  // console.log("caseIddddd", caseId);
  /* -------------------------------------------------------
     Initial Form States (Memoized for stability)
  ------------------------------------------------------- */

  const initialOverview = useMemo<OverviewForm>(
    () => ({
      caseTitle: "",
      clientName: "",
      clientPhone: "",
      clientAddress: "",
      clientWork: "",
      clientDob: "",
      emergencyContact: "",
      claimNo: "",
      doi: "",
      cm: "",
      cmPhone: "",
      supervisor: "",
      supervisorPhone: "",
      employer: "",
      tpa: "",
      tpaPhone: "",
      si: "",
      siPhone: "",
      provider: "",
      providerPhone: "",
      vrc: "",
      vrcPhone: "",
      vocationalStatus: "VR",
      roa: "",
      allowedConditions: "",
      tl: "Yes",
      lastApf: "",
      lastWsf: "",
    }),
    [],
  );

  const initialActivity = useMemo<ActivityForm>(() => ({ activity: "" }), []);

  const initialNotes = useMemo<NotesForm>(
    () => ({
      type: "General",
      visibility: "Internal",
      title: "",
      details: "",
      createTask: false,
      taskTitle: "",
      taskType: "Follow-Up Call",
      assignedTo: "",
      dueDate: "",
      priority: "Medium",
      linkToCalendar: "No",
    }),
    [],
  );

  const initialCommunication = useMemo(
    () => ({
      caseId: caseId || "",
      regarding: "",
      status: "",
      message: "",
      action: "",
      note: "",
    }),
    [caseId],
  );

  const initialEmail: EmailForm = {
    subject: "",
    to: "",
    cc: "",
    body: "",
    direction: "Outgoing",
  };

  const initialTL: TLForm = {
    date: "",
    checkNumber: "",
    payee: "",
    totalCheck: "",
    iwjFee: "",
    paidOut: "",
    method: "Deposit",
    accountNumber: "",
    bank: "",
    cleared: false,
    notes: "",
  };

  const initialDocs = useMemo<DocsForm>(
    () => ({
      category: "",
      description: "",
      file: null,
    }),
    [],
  );

  const initialProtest = useMemo<ProtestForm>(
    () => ({
      doDate: "",
      description: "",
      deadline: "",
      status: "Draft",
      notes: "",
    }),
    [],
  );

  /* -------------------------------------------------------
     Form State Hooks
  ------------------------------------------------------- */
  const [overview, setOverview] = useState<OverviewForm>(initialOverview);
  const [activity, setActivity] = useState<ActivityForm>(initialActivity);
  const [notes, setNotes] = useState<NotesForm>(initialNotes);
  const [communication, setCommunication] = useState(initialCommunication);
  const [email, setEmail] = useState<EmailForm>(initialEmail);
  const [tl, setTl] = useState<TLForm>(initialTL);
  const [docs, setDocs] = useState<DocsForm>(initialDocs);
  const [protest, setProtest] = useState<ProtestForm>(initialProtest);

  /* =========================================================
   STEP PROGRESS STATE
========================================================= */
  const [completedSteps, setCompletedSteps] = useState<TabKey[]>(["overview"]);

  const isTabAccessible = (tab: TabKey) => {
    return completedSteps.includes(tab);
  };

  const unlockNextStep = (current: TabKey) => {
    const currentIndex = tabFlow.indexOf(current);
    const nextStep = tabFlow[currentIndex + 1];

    if (nextStep && !completedSteps.includes(nextStep)) {
      setCompletedSteps((prev) => [...prev, nextStep]);
    }

    if (nextStep) {
      setActiveTab(nextStep);
    }
  };
  /* =========================================================
     SECTION SAVE HANDLER (Central API Router)
  ========================================================= */
  const saveSection = async (
    type:
      | "activity"
      | "note"
      | "message"
      | "communication"
      | "email"
      | "time-loss"
      | "document"
      | "protest",
    payload: any,
  ) => {
    try {
      // payload.forEach((value: any, key: any) => {
      //   console.log(key, value);
      // });

      if (!caseId) {
        alert("Please complete Overview first.");
        return;
      }

      setSaving(true);

      switch (type) {
        case "activity":
          await casesAPI.addActivity(caseId, payload);
          unlockNextStep("activity");
          break;

        case "note":
          await casesAPI.addNote(caseId, payload);
          unlockNextStep("notes");
          break;

        case "communication":
          await casesAPI.addCommunication(payload);
          unlockNextStep("communication");
          break;

        case "email":
          await casesAPI.addEmail(caseId, payload);
          unlockNextStep("emails");
          break;

        case "time-loss":
          await casesAPI.addTimeLoss(payload);
          unlockNextStep("tl");
          break;

        case "document":
          await casesAPI.addDocument(payload);
          unlockNextStep("docs");
          break;

        case "protest":
          const res = await casesAPI.addProtest(payload);
          console.log("protestggg", res);
          break;
      }

      alert("Saved successfully");
    } catch (error: any) {
      alert(error?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () => {
    setOverview(initialOverview);
    setActivity(initialActivity);
    setNotes(initialNotes);
    setTl(initialTL);
    setDocs(initialDocs);
    setProtest(initialProtest);
    setActiveTab("overview");
  };
  /* =========================================================
     Overview Save (Step 1 → Creates Case)
  ========================================================= */
  const saveOverview = async () => {
    try {
      setSaving(true);

      const payload = {
        caseTitle: overview.caseTitle,
        clientName: overview.clientName,
        clientPhone: overview.clientPhone,
        clientDob: overview.clientDob
          ? new Date(overview.clientDob).toISOString()
          : undefined,
        doi: overview.doi ? new Date(overview.doi).toISOString() : undefined,
        tl: overview.tl,
        status: "Intake",
      };

      const response = await casesAPI.createCase(payload);
      setCaseId(response.data._id);

      alert("Case created successfully!");
      unlockNextStep("overview");
    } catch (error: any) {
      alert(error?.message || "Failed to create case");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     Claim Save (Step 2 → Updates Existing Case)
  ========================================================= */
  const saveClaim = async () => {
    try {
      if (!caseId) {
        alert("Please save Overview first.");
        return;
      }

      setSaving(true);

      const rawPayload = {
        claimNo: overview.claimNo,
        doi: overview.doi ? new Date(overview.doi).toISOString() : undefined,
        cm: overview.cm,
        cmPhone: overview.cmPhone,
        supervisor: overview.supervisor,
        supervisorPhone: overview.supervisorPhone,
        employer: overview.employer,
        tpa: overview.tpa,
        tpaPhone: overview.tpaPhone,
        si: overview.si,
        siPhone: overview.siPhone,
        provider: overview.provider,
        providerPhone: overview.providerPhone,
        vrc: overview.vrc,
        vrcPhone: overview.vrcPhone,
        vocationalStatus: overview.vocationalStatus,
        roa: overview.roa,
        allowedConditions: overview.allowedConditions,
        tl: overview.tl,
        lastApf: overview.lastApf,
        lastWsf: overview.lastWsf,
      };

      const cleanedPayload = Object.fromEntries(
        Object.entries(rawPayload).filter(
          ([_, value]) => value !== undefined && value !== "",
        ),
      );

      await casesAPI.updateCase(caseId, cleanedPayload);
      alert("Updated sucessfully claim");
      unlockNextStep("claim");
    } catch (error: any) {
      alert(error?.message || "Failed to save claim");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div>
      <style>{`

      .nav-link.tab-disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  pointer-events: none;
  background-color: #f8f9fa !important;
  color: #999 !important;
}
        .nav-tabs{
          background:white;
          border-radius:12px;
          padding:10px;
          box-shadow:0 5px 15px rgba(0,0,0,0.08);
        }

        .nav-tabs .nav-link{
          border:none;
          color:#555;
          font-weight:500;
          border-radius:8px;
          padding:8px 15px;
        }

        .nav-tabs .nav-link.active{
          background:#0d6efd;
          color:white;
        }

        .section-card{
          background:white;
          padding:20px;
          border-radius:14px;
          box-shadow:0 8px 20px rgba(0,0,0,0.08);
          margin-bottom:20px;
        }

        .section-title{
          display:flex;
          align-items:center;
          font-weight:600;
          margin-bottom:15px;
          color:#0d6efd;
          border-bottom:1px solid #eee;
          padding-bottom:6px;
        }

        .section-title i{
          background:#0d6efd;
          color:white;
          padding:8px;
          border-radius:50%;
          margin-right:10px;
          font-size:13px;
        }

        .folder-list li{
          cursor:pointer;
          transition:0.2s;
        }

        .folder-list li:hover{
          background:#0d6efd;
          color:white;
        }
      `}</style>

      <div className="d-flex justify-content-between mb-2">
        <h4>📁 Add Case</h4>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={resetAll}
            disabled={saving}
          >
            Reset
          </button>
        </div>
      </div>

      {/* TABS */}
      <ul className="nav nav-tabs mt-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link 
    ${activeTab === "claim" ? "active" : ""} 
    ${!isTabAccessible("claim") ? "tab-disabled" : ""}
  `}
            type="button"
            disabled={!isTabAccessible("claim")}
            onClick={() => {
              if (!isTabAccessible("claim")) return;
              setActiveTab("claim");
            }}
          >
            Claim Information
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link 
    ${activeTab === "activity" ? "active" : ""} 
    ${!isTabAccessible("activity") ? "tab-disabled" : ""}
  `}
            type="button"
            disabled={!isTabAccessible("activity")}
            onClick={() => {
              if (!isTabAccessible("activity")) return;
              setActiveTab("activity");
            }}
          >
            Activity
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link 
    ${activeTab === "notes" ? "active" : ""} 
    ${!isTabAccessible("notes") ? "tab-disabled" : ""}
  `}
            type="button"
            disabled={!isTabAccessible("notes")}
            onClick={() => {
              if (!isTabAccessible("notes")) return;
              setActiveTab("notes");
            }}
          >
            Notes
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link 
    ${activeTab === "communication" ? "active" : ""} 
    ${!isTabAccessible("communication") ? "tab-disabled" : ""}
  `}
            type="button"
            disabled={!isTabAccessible("communication")}
            onClick={() => {
              if (!isTabAccessible("communication")) return;
              setActiveTab("communication");
            }}
          >
            Text Messages / Call Logs
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link 
    ${activeTab === "emails" ? "active" : ""} 
    ${!isTabAccessible("emails") ? "tab-disabled" : ""}
  `}
            type="button"
            disabled={!isTabAccessible("emails")}
            onClick={() => {
              if (!isTabAccessible("emails")) return;
              setActiveTab("emails");
            }}
          >
            Emails
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link 
    ${activeTab === "tl" ? "active" : ""} 
    ${!isTabAccessible("tl") ? "tab-disabled" : ""}
  `}
            type="button"
            disabled={!isTabAccessible("tl")}
            onClick={() => {
              if (!isTabAccessible("tl")) return;
              setActiveTab("tl");
            }}
          >
            Time Loss
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link 
    ${activeTab === "docs" ? "active" : ""} 
    ${!isTabAccessible("docs") ? "tab-disabled" : ""}
  `}
            type="button"
            disabled={!isTabAccessible("docs")}
            onClick={() => {
              if (!isTabAccessible("docs")) return;
              setActiveTab("docs");
            }}
          >
            Documents
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link 
    ${activeTab === "protest" ? "active" : ""} 
    ${!isTabAccessible("protest") ? "tab-disabled" : ""}
  `}
            type="button"
            disabled={!isTabAccessible("protest")}
            onClick={() => {
              if (!isTabAccessible("protest")) return;
              setActiveTab("protest");
            }}
          >
            Protests & Appeals
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <OverviewTab
            overview={overview}
            setOverview={setOverview}
            saving={saving}
            onSave={saveOverview}
          />
        )}

        {/* claim */}
        {activeTab === "claim" && (
          <ClaimTab
            overview={overview}
            setOverview={setOverview}
            saving={saving}
            onSave={saveClaim}
            onBack={() => setActiveTab("overview")}
          />
        )}

        {/* ACTIVITY */}
        {activeTab === "activity" && (
          <ActivityTab
            activity={activity}
            setActivity={setActivity}
            saving={saving}
            onSave={() =>
              saveSection("activity", {
                caseId,
                activity: activity.activity,
              })
            }
          />
        )}

        {/* NOTES */}
        {activeTab === "notes" && (
          <NotesTab
            caseId={caseId} // ✅ THIS WAS MISSING
            notes={notes}
            setNotes={setNotes}
            saving={saving}
            loggedInUser={loggedInUser}
            onSave={() =>
              saveSection("note", {
                caseId,
                noteType: notes.type, // ✅ rename here
                visibility: notes.visibility,
                title: notes.title,
                details: notes.details,
                createTask: notes.createTask,
              })
            }
          />
        )}

        {/* Communication */}
        {activeTab === "communication" && (
          <CommunicationTab
            caseId={caseId}
            communication={communication}
            setCommunication={setCommunication}
            saving={saving}
            onSave={() =>
              saveSection("communication", {
                caseId,
                regarding: communication.regarding,
                status: communication.status,
                message: communication.message,
                action: communication.action,
                note: communication.note,
              })
            }
          />
        )}

        {/* EMAILS */}
        {activeTab === "emails" && (
          <EmailsTab
            caseId={caseId}
            email={email}
            setEmail={setEmail}
            saving={saving}
            loggedInUser={loggedInUser}
            onSave={() =>
              saveSection("email", {
                caseId,
                direction: email.direction,
                from: loggedInUser?.email, // ya jo required ho
                to: email.to,
                cc: email.cc,
                subject: email.subject,
                summary: email.body, // 👈 body ko summary me map karo
                emailDate: new Date().toISOString(), // ✅ full ISO format
                followUpRequired: false,
              })
            }
          />
        )}

        {/* TIME LOSS */}
        {activeTab === "tl" && (
          <TimeLossTab
            // caseId={caseId}
            tl={tl}
            setTl={setTl}
            saving={saving}
            onSave={() =>
              saveSection("time-loss", {
                ...tl,
                caseId,
              })
            }
          />
        )}

        {/* DOCS */}
        {activeTab === "docs" && (
          <DocumentsTab
            caseId={caseId}
            docs={docs}
            setDocs={setDocs}
            saving={saving}
            onSave={() => {
              if (!docs.file || !caseId) return;

              const formData = new FormData();
              formData.append("caseId", caseId);
              formData.append("category", docs.category);
              formData.append("description", docs.description);
              formData.append("file", docs.file);

              saveSection("document", formData);
            }}
          />
        )}

        {/* PROTESTS */}
        {activeTab === "protest" && (
          <ProtestTab
            caseId={caseId}
            protest={protest}
            setProtest={setProtest}
            saving={saving}
            // loggedInUser={loggedInUser}
            onSave={() => {
              if (!caseId || caseId.trim() === "") {
                alert("Please create/save case first.");
                return;
              }
              saveSection("protest", {
                caseId,
                doDate: protest.doDate,
                description: protest.description,
                deadline: protest.deadline,
                status: protest.status,
                notes: protest.notes,
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
