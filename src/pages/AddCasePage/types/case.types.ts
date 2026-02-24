// =============================
// COMMON ENUMS
// =============================

export type VocationalStatus =
  | "VR"
  | "AWA"
  | "Plan Development"
  | "Plan Implementation"
  | "Closed";

export type YesNo = "Yes" | "No";

export type Visibility = "Internal" | "Admin-only";

export type EmailDirection = "Incoming" | "Outgoing";


// =============================
// OVERVIEW
// =============================

export type OverviewForm = {
  caseTitle: string;

  clientName: string;
  clientPhone: string;
  clientAddress: string;
  clientWork: string;
  clientDob: string;
  emergencyContact: string;

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


// =============================
// ACTIVITY
// =============================

export type ActivityForm = {
  activity: string;
};


// =============================
// NOTES (Internal Documentation)
// =============================

export type NotesForm = {
  type: string;
  visibility: Visibility;
  title: string;
  details: string;
  createTask: boolean;

  taskTitle: string;
  taskType: string;
  assignedTo: string;
  dueDate: string;
  priority: string;
  linkToCalendar: YesNo;
};


// =============================
// INTERNAL MESSAGES
// =============================

export type MessagesForm = {
  visibility: Visibility;
  tagUsers: string;
  subject: string;
  body: string;
};


// =============================
// COMMUNICATION (Calls / Texts)
// =============================

export type LogType = "Call" | "Text";
export type Direction = "Incoming" | "Outgoing";

export type ContactRole =
  | "Client"
  | "Potential Client"
  | "CM"
  | "VRC"
  | "Provider"
  | "BIIA"
  | "Employer"
  | "Other";

export type CommunicationForm = {
  logType: LogType;
  direction: Direction;

  contactName: string;
  contactRole: ContactRole;
  phoneNumber: string;

  dateTime: string; // required (client asked)

  summary: string;
  outcome: string;

  followUpRequired: YesNo;
  followUpDueDate: string;

  createTask: YesNo;
};


// =============================
// EMAILS
// =============================

export type EmailForm = {
  subject: string;
  to: string;
  cc: string;
  body: string;
  direction: EmailDirection;
};


// =============================
// TIME LOSS (Client Requirement v2)
// =============================

export type TLForm = {
  date: string;
  checkNumber: string;
  payee: string;
  totalCheck: string;
  iwjFee: string;
  paidOut: string;
  method: "Check" | "Wire" | "Deposit" | "Cash";
  accountNumber: string;
  bank: string;
  cleared: boolean;
  notes: string;
};



// =============================
// DOCUMENTS
// =============================

export type DocsForm = {
  category: string;
  description: string;
  file: File | null;
};


// =============================
// PROTESTS & APPEALS (Final Correct)
// =============================

export type ProtestType = "Protest" | "Appeal";

export type ProtestAction =
  | "Protested"
  | "Appealed"
  | "Dismissed"
  | "N/A";

export type ProtestWorkflowStatus =
  | "Draft"
  | "Filed"
  | "Awaiting Response"
  | "Scheduled"
  | "Decision Issued"
  | "Protested";

export type ProtestForm = {
  doDate: string;
  description: string;
  deadline: string;
  status: "Protested" | "Appealed" | "Dismissed" | "Draft";
  notes: string;
};
