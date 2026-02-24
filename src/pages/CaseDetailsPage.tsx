import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { casesAPI } from "../utils/api";

type ModalKey =
  | null
  | "editClient"
  | "editClaim"
  | "activity"
  | "notes"
  | "doc"
  | "timeLoss"
  | "appeal";

type BadgeTone = "success" | "warning" | "danger" | "primary" | "secondary";

type ClientInfo = {
  name: string;
  phone: string;
  dob: string; // yyyy-mm-dd
  address: string;
  work: string;
  emergency: string;
  claimNo: string;
  doi: string; // yyyy-mm-dd
};

type ClaimInfo = {
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
  vocational: string;
  roa: string;
  allowed: string;
  tl: "Yes" | "No";
  lastApf: string; // yyyy-mm-dd
  lastWsf: string; // yyyy-mm-dd
};

type TimeLossEntry = {
  id: string;
  date: string; // yyyy-mm-dd
  amount: string; // ₹15000
  status: "Paid" | "Pending";
};

type AppealInfo = {
  doDate: string; // yyyy-mm-dd
  deadline: string; // yyyy-mm-dd
  status: "Appealed" | "Closed";
  outcome: string;
  notes: string;
};

type DocumentFolder = "IWJ" | "Medical" | "Vocational" | "Drafts";

function toneToBadgeClass(tone: BadgeTone): string {
  switch (tone) {
    case "success":
      return "bg-success";
    case "warning":
      return "bg-warning text-dark";
    case "danger":
      return "bg-danger";
    case "primary":
      return "bg-primary";
    case "secondary":
    default:
      return "bg-secondary";
  }
}

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
      <div className="modal fade show" style={{ display: "block" }} role="dialog">
        <div className={dialogClass}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="mb-0">{title}</h5>
              <button className="btn-close" onClick={onClose} aria-label="Close" />
            </div>

            <div className="modal-body">{children}</div>

            <div className="modal-footer">
              {footer ?? (
                <>
                  <button className="btn btn-secondary" onClick={onClose}>
                    Close
                  </button>
                  <button className="btn btn-primary" onClick={onClose}>
                    Save
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

export default function CaseDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [client, setClient] = useState<ClientInfo>({
    name: "",
    phone: "",
    dob: "",
    address: "",
    work: "",
    emergency: "",
    claimNo: "",
    doi: "",
  });

  const [claim, setClaim] = useState<ClaimInfo>({
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
    vocational: "",
    roa: "",
    allowed: "",
    tl: "No",
    lastApf: "",
    lastWsf: "",
  });

  const [activities, setActivities] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState<string>("");
  const [caseNotes, setCaseNotes] = useState<string>("");
  const folders = ["IWJ", "Medical", "Vocational", "Drafts"] as const;
  const [docFolder, setDocFolder] = useState<DocumentFolder>("IWJ");
  const [docFileName, setDocFileName] = useState<string>("");
  const [timeLoss, setTimeLoss] = useState<TimeLossEntry[]>([]);
  const [tlDraft, setTlDraft] = useState<{ date: string; amount: string; status: "Paid" | "Pending" }>({
    date: "",
    amount: "",
    status: "Paid",
  });
  const [appeal, setAppeal] = useState<AppealInfo>({
    doDate: "",
    deadline: "",
    status: "Appealed",
    outcome: "",
    notes: "",
  });

  // Fetch case details on mount
  useEffect(() => {
    if (!id) return;

  const fetchCaseDetails = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await casesAPI.getCaseById(id);
    const caseData = response?.data ?? response;

    console.log("caseData", caseData);

    // 🔹 CLIENT INFO (map manually)
    setClient({
      name: caseData.clientName || "",
      phone: caseData.clientPhone || "",
      dob: "", // not in API
      address: "", // not in API
      work: "", // not in API
      emergency: "", // not in API
      claimNo: caseData.caseId || "",
      doi: "", // not in API
    });

    // 🔹 CLAIM INFO (map manually)
    setClaim({
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
      vocational: "",
      roa: "",
      allowed: "",
      tl: caseData.tl || "No",
      lastApf: "",
      lastWsf: "",
    });

    // 🔹 ACTIVITIES
    if (caseData.activityLogs?.length) {
      const mappedActivities = caseData.activityLogs.map(
        (a: any) => `${a.action} - ${new Date(a.performedAt).toLocaleDateString()}`
      );
      setActivities(mappedActivities);
    }

    // 🔹 NOTES
    if (Array.isArray(caseData.notes)) {
      setCaseNotes(caseData.notes.join("\n"));
    }

    // 🔹 TIME LOSS
    if (Array.isArray(caseData.timeLosses)) {
      const mappedTL = caseData.timeLosses.map((t: any) => ({
        id: t._id,
        date: t.date,
        amount: t.amount,
        status: t.status,
      }));
      setTimeLoss(mappedTL);
    }

    // 🔹 APPEAL
    if (caseData.protestsAndAppeals) {
      setAppeal({
        doDate: caseData.protestsAndAppeals.doDate || "",
        deadline: caseData.protestsAndAppeals.deadline || "",
        status: caseData.protestsAndAppeals.status || "Appealed",
        outcome: caseData.protestsAndAppeals.outcome || "",
        notes: caseData.protestsAndAppeals.notes || "",
      });
    }

  } catch (err: any) {
    setError(err.message || "Failed to fetch case details");
  } finally {
    setLoading(false);
  }
};


    fetchCaseDetails();
  }, [id]);

  const open = (key: ModalKey) => setActiveModal(key);
  const close = () => setActiveModal(null);

  const addActivity = async () => {
    const v = newActivity.trim();
    if (!v || !id) return;
    try {
      setActivities((prev) => [v, ...prev]);
      setNewActivity("");
      close();
      // Optional: Update backend
      // await casesAPI.update(id, { activities: [v, ...activities] });
    } catch (err) {
      console.error("Error adding activity:", err);
    }
  };

  const addDocument = () => {
    const name = docFileName.trim();
    if (!name) return;
    // Hook: upload to backend by folder
    setDocFileName("");
    close();
  };

  const addOrUpdateTimeLoss = () => {
    if (!tlDraft.date || !tlDraft.amount) return;
    const entry: TimeLossEntry = {
      id: `tl_${Date.now()}`,
      date: tlDraft.date,
      amount: tlDraft.amount,
      status: tlDraft.status,
    };
    setTimeLoss((prev) => [entry, ...prev]);
    setTlDraft({ date: "", amount: "", status: "Paid" });
    close();
  };

  const saveClientInfo = async () => {
    if (!id) return;
    try {
      await casesAPI.updateCase(id, { client });
      close();
    } catch (err: any) {
      console.error("Error saving client info:", err);
      alert(err.message || "Failed to save");
    }
  };

  const saveClaimInfo = async () => {
    if (!id) return;
    try {
      await casesAPI.updateCase(id, { claim });
      close();
    } catch (err: any) {
      console.error("Error saving claim info:", err);
      alert(err.message || "Failed to save");
    }
  };

  const saveCaseNotes = async () => {
    if (!id) return;
    try {
      await casesAPI.updateCase(id, { notes: caseNotes });
      close();
    } catch (err: any) {
      console.error("Error saving notes:", err);
      alert(err.message || "Failed to save");
    }
  };

  const saveAppeal = async () => {
    if (!id) return;
    try {
      await casesAPI.updateCase(id, { appeal });
      close();
    } catch (err: any) {
      console.error("Error saving appeal:", err);
      alert(err.message || "Failed to save");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  const caseHeader = { title: `Case File – ${client.claimNo}`, claimNo: client.claimNo };

  return (
    <>
      <div className="case-wrapper">
        <div className="d-flex justify-content-between mb-2">
          <h4 className="mb-0">📁 {caseHeader.title}</h4>
          <a className="btn btn-primary" href="/cases">
            View All Cases
          </a>
        </div>

        {/* CLIENT INFO */}
        <div className="section">
          <div className="section-title d-flex justify-content-between">
            <div>
              <i className="fa-solid fa-user" /> Client Information
            </div>
            <div>
              <button className="btn btn-outline-primary mb-2" type="button" onClick={() => open("editClient")}>
                Edit Client
              </button>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              Name <span>{client.name}</span>
            </div>
            <div className="info-item">
              Phone <span>{client.phone}</span>
            </div>
            <div className="info-item">
              DOB <span>{client.dob}</span>
            </div>
            <div className="info-item">
              Address <span>{client.address}</span>
            </div>
            <div className="info-item">
              Work <span>{client.work}</span>
            </div>
            <div className="info-item">
              Emergency <span>{client.emergency}</span>
            </div>
            <div className="info-item">
              Claim No <span>{client.claimNo}</span>
            </div>
            <div className="info-item">
              DOI <span>{client.doi}</span>
            </div>
          </div>
        </div>

        {/* CLAIM INFO */}
        <div className="section">
          <div className="section-title d-flex justify-content-between">
            <div>
              <i className="fa-solid fa-file-contract" /> Claim Information
            </div>
            <div>
              <button className="btn btn-outline-primary mb-2" type="button" onClick={() => open("editClaim")}>
                Edit Claim Info
              </button>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              CM <span>{claim.cm}</span>
            </div>
            <div className="info-item">
              CM Phone <span>{claim.cmPhone}</span>
            </div>
            <div className="info-item">
              Supervisor <span>{claim.supervisor}</span>
            </div>
            <div className="info-item">
              Supervisor Phone <span>{claim.supervisorPhone}</span>
            </div>
            <div className="info-item">
              Employer <span>{claim.employer}</span>
            </div>
            <div className="info-item">
              TPA <span>{claim.tpa}</span>
            </div>
            <div className="info-item">
              TPA Phone <span>{claim.tpaPhone}</span>
            </div>
            <div className="info-item">
              SI <span>{claim.si}</span>
            </div>
            <div className="info-item">
              SI Phone <span>{claim.siPhone}</span>
            </div>
            <div className="info-item">
              Provider <span>{claim.provider}</span>
            </div>
            <div className="info-item">
              Provider Phone <span>{claim.providerPhone}</span>
            </div>
            <div className="info-item">
              VRC <span>{claim.vrc}</span>
            </div>
            <div className="info-item">
              Vocational <span>{claim.vocational}</span>
            </div>
            <div className="info-item">
              ROA <span>{claim.roa}</span>
            </div>
            <div className="info-item">
              Allowed <span>{claim.allowed}</span>
            </div>
            <div className="info-item">
              TL{" "}
              <span className={`badge ${toneToBadgeClass("warning")}`}>
                {claim.tl}
              </span>
            </div>
            <div className="info-item">
              Last APF <span>{claim.lastApf}</span>
            </div>
            <div className="info-item">
              Last WSF <span>{claim.lastWsf}</span>
            </div>
          </div>
        </div>

        {/* ACTIVITY */}
        <div className="section">
          <div className="section-title d-flex justify-content-between">
            <div>
              <i className="fa-solid fa-clock" /> Activity Timeline
            </div>
            <div>
              <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => open("activity")}>
                Add Activity
              </button>
            </div>
          </div>

          <div className="timeline">
            {activities.map((a, i) => (
              <div key={`${a}-${i}`}>{a}</div>
            ))}
          </div>
        </div>

        {/* NOTES */}
        <div className="section">
          <div className="section-title d-flex justify-content-between">
            <div>
              <i className="fa-solid fa-note-sticky" /> Case Notes
            </div>
            <div>
              <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => open("notes")}>
                Edit Note
              </button>
            </div>
          </div>

          <div className="card p-2" style={{ borderLeft: "3px solid blue" }}>
            {caseNotes}
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="section">
          <div className="section-title d-flex justify-content-between">
            <div>
              <i className="fa-solid fa-folder-open" /> Documents
            </div>
            <div>
              <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => open("doc")}>
                Add Document
              </button>
            </div>
          </div>

          <div className="row g-3">
            {folders.map((f) => (
              <div key={f} className="col-md-3">
                <div className="folder">{f}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TIME LOSS */}
        <div className="section">
          <div className="section-title d-flex justify-content-between">
            <div>
              <i className="fa-solid fa-money-bill" /> Time Loss
            </div>
            <div>
              <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => open("timeLoss")}>
                Edit timeloss
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {timeLoss.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.amount}</td>
                    <td>
                      <span className={`badge ${toneToBadgeClass(t.status === "Paid" ? "success" : "secondary")}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {timeLoss.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted py-4">
                      No time loss entries.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* APPEALS */}
        <div className="section">
          <div className="section-title d-flex justify-content-between">
            <div>
              <i className="fa-solid fa-scale-balanced" /> Protests &amp; Appeals
            </div>
            <div>
              <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => open("appeal")}>
                Edit Appeal
              </button>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              DO Date <span>{appeal.doDate}</span>
            </div>
            <div className="info-item">
              Deadline <span>{appeal.deadline}</span>
            </div>
            <div className="info-item">
              Status{" "}
              <span className={`badge ${toneToBadgeClass(appeal.status === "Appealed" ? "danger" : "secondary")}`}>
                {appeal.status}
              </span>
            </div>
            <div className="info-item">
              Outcome <span>{appeal.outcome}</span>
            </div>
          </div>

          <textarea
            className="form-control mt-2"
            placeholder="Notes..."
            value={appeal.notes}
            onChange={(e) => setAppeal((p) => ({ ...p, notes: e.target.value }))}
          />
        </div>
      </div>

      {/* MODALS */}

      <Modal
        open={activeModal === "editClient"}
        title="Edit Client Information"
        size="lg"
        onClose={close}
        footer={
          <>
            <button className="btn btn-secondary" onClick={close}>
              Close
            </button>
            <button className="btn btn-primary" onClick={saveClientInfo}>
              Save
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label>Name</label>
            <input className="form-control" value={client.name} onChange={(e) => setClient((p) => ({ ...p, name: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Phone</label>
            <input className="form-control" value={client.phone} onChange={(e) => setClient((p) => ({ ...p, phone: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>DOB</label>
            <input className="form-control" type="date" value={client.dob} onChange={(e) => setClient((p) => ({ ...p, dob: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Address</label>
            <input className="form-control" value={client.address} onChange={(e) => setClient((p) => ({ ...p, address: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Work</label>
            <input className="form-control" value={client.work} onChange={(e) => setClient((p) => ({ ...p, work: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Emergency Contact</label>
            <input className="form-control" value={client.emergency} onChange={(e) => setClient((p) => ({ ...p, emergency: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal
        open={activeModal === "editClaim"}
        title="Edit Claim Information"
        size="lg"
        onClose={close}
        footer={
          <>
            <button className="btn btn-secondary" onClick={close}>
              Close
            </button>
            <button className="btn btn-primary" onClick={saveClaimInfo}>
              Save
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-12">
            <label>Claim No</label>
            <input className="form-control" value={client.claimNo} onChange={(e) => setClient((p) => ({ ...p, claimNo: e.target.value }))} />
          </div>

          <div className="col-md-12">
            <label>DOI</label>
            <input className="form-control" type="date" value={client.doi} onChange={(e) => setClient((p) => ({ ...p, doi: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>CM</label>
            <input className="form-control" value={claim.cm} onChange={(e) => setClaim((p) => ({ ...p, cm: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>CM Phone</label>
            <input className="form-control" value={claim.cmPhone} onChange={(e) => setClaim((p) => ({ ...p, cmPhone: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Supervisor</label>
            <input className="form-control" value={claim.supervisor} onChange={(e) => setClaim((p) => ({ ...p, supervisor: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Supervisor Phone</label>
            <input className="form-control" value={claim.supervisorPhone} onChange={(e) => setClaim((p) => ({ ...p, supervisorPhone: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Employer</label>
            <input className="form-control" value={claim.employer} onChange={(e) => setClaim((p) => ({ ...p, employer: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>TPA</label>
            <input className="form-control" value={claim.tpa} onChange={(e) => setClaim((p) => ({ ...p, tpa: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>TPA Phone</label>
            <input className="form-control" value={claim.tpaPhone} onChange={(e) => setClaim((p) => ({ ...p, tpaPhone: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Provider</label>
            <input className="form-control" value={claim.provider} onChange={(e) => setClaim((p) => ({ ...p, provider: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Provider Phone</label>
            <input className="form-control" value={claim.providerPhone} onChange={(e) => setClaim((p) => ({ ...p, providerPhone: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>TL</label>
            <select
              className="form-select"
              value={claim.tl}
              onChange={(e) => setClaim((p) => ({ ...p, tl: e.target.value as "Yes" | "No" }))}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="col-md-6">
            <label>Last APF</label>
            <input className="form-control" type="date" value={claim.lastApf} onChange={(e) => setClaim((p) => ({ ...p, lastApf: e.target.value }))} />
          </div>

          <div className="col-md-6">
            <label>Last WSF</label>
            <input className="form-control" type="date" value={claim.lastWsf} onChange={(e) => setClaim((p) => ({ ...p, lastWsf: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <Modal
        open={activeModal === "activity"}
        title="Add Activity"
        onClose={close}
        footer={
          <>
            <button className="btn btn-secondary" onClick={close}>
              Close
            </button>
            <button className="btn btn-primary" onClick={addActivity}>
              Save
            </button>
          </>
        }
      >
        <textarea
          className="form-control"
          placeholder="Enter activity..."
          value={newActivity}
          onChange={(e) => setNewActivity(e.target.value)}
        />
      </Modal>

      <Modal
        open={activeModal === "notes"}
        title="Edit Case Notes"
        onClose={close}
        footer={
          <>
            <button className="btn btn-secondary" onClick={close}>
              Close
            </button>
            <button className="btn btn-primary" onClick={saveCaseNotes}>
              Save
            </button>
          </>
        }
      >
        <textarea
          className="form-control"
          rows={6}
          value={caseNotes}
          onChange={(e) => setCaseNotes(e.target.value)}
        />
      </Modal>

      <Modal
        open={activeModal === "doc"}
        title="Upload Document"
        onClose={close}
        footer={
          <>
            <button className="btn btn-secondary" onClick={close}>
              Close
            </button>
            <button className="btn btn-primary" onClick={addDocument}>
              Upload
            </button>
          </>
        }
      >
        <label className="form-label">File (demo)</label>
        <input
          className="form-control"
          placeholder="example.pdf"
          value={docFileName}
          onChange={(e) => setDocFileName(e.target.value)}
        />

        <label className="form-label mt-3">Folder</label>
        <select
          className="form-select"
          value={docFolder}
          onChange={(e) => setDocFolder(e.target.value as DocumentFolder)}
        >
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <div className="text-muted small mt-2">
          Hook: replace with real file upload + backend storage per folder.
        </div>
      </Modal>

      <Modal
        open={activeModal === "timeLoss"}
        title="Edit Time Loss"
        onClose={close}
        footer={
          <>
            <button className="btn btn-secondary" onClick={close}>
              Close
            </button>
            <button className="btn btn-primary" onClick={addOrUpdateTimeLoss}>
              Save
            </button>
          </>
        }
      >
        <label>Date</label>
        <input
          className="form-control"
          type="date"
          value={tlDraft.date}
          onChange={(e) => setTlDraft((p) => ({ ...p, date: e.target.value }))}
        />

        <label className="mt-2">Amount</label>
        <input
          className="form-control"
          placeholder="₹15000"
          value={tlDraft.amount}
          onChange={(e) => setTlDraft((p) => ({ ...p, amount: e.target.value }))}
        />

        <label className="mt-2">Status</label>
        <select
          className="form-select"
          value={tlDraft.status}
          onChange={(e) => setTlDraft((p) => ({ ...p, status: e.target.value as "Paid" | "Pending" }))}
        >
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </Modal>

      <Modal
        open={activeModal === "appeal"}
        title="Edit Appeal"
        onClose={close}
        footer={
          <>
            <button className="btn btn-secondary" onClick={close}>
              Close
            </button>
            <button className="btn btn-primary" onClick={saveAppeal}>
              Save
            </button>
          </>
        }
      >
        <label>DO Date</label>
        <input
          className="form-control"
          type="date"
          value={appeal.doDate}
          onChange={(e) => setAppeal((p) => ({ ...p, doDate: e.target.value }))}
        />

        <label className="mt-2">Deadline</label>
        <input
          className="form-control"
          type="date"
          value={appeal.deadline}
          onChange={(e) => setAppeal((p) => ({ ...p, deadline: e.target.value }))}
        />

        <label className="mt-2">Status</label>
        <select
          className="form-select"
          value={appeal.status}
          onChange={(e) => setAppeal((p) => ({ ...p, status: e.target.value as "Appealed" | "Closed" }))}
        >
          <option value="Appealed">Appealed</option>
          <option value="Closed">Closed</option>
        </select>

        <label className="mt-2">Outcome</label>
        <input
          className="form-control"
          value={appeal.outcome}
          onChange={(e) => setAppeal((p) => ({ ...p, outcome: e.target.value }))}
        />
      </Modal>

      <style>{`
        .case-wrapper .section {
          background: white;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
          margin-bottom: 25px;
        }

        .case-wrapper .section-title {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #0d6efd;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }

        .case-wrapper .section-title i {
          background: #0d6efd;
          color: white;
          padding: 8px;
          border-radius: 50%;
          margin-right: 10px;
        }

        .case-wrapper .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          font-size: 14px;
        }

        .case-wrapper .info-item {
          background: #f8f9fc;
          padding: 10px 12px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .case-wrapper .info-item span {
          font-weight: 600;
          color: #333;
          white-space: nowrap;
        }

        .case-wrapper .timeline {
          border-left: 3px solid #0d6efd;
          padding-left: 20px;
        }

        .case-wrapper .timeline div {
          margin-bottom: 15px;
        }

        .case-wrapper .folder {
          background: #f8f9fc;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
