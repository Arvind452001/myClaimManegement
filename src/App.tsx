import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import {
  HomePage,
  CalendarPage,
  TasksPage,
  CasesPage,
  CaseDetailsPage,
  ContactsPage,
 
  PncPage,
  MessagesPage,
  CallLogTextPage,
  TimeLossPage,
  FeeListPage,
  ExcelListPage,
  AddCasePage,
  AddContactPage,
  AddTaskPage,
  AddTimeLossPage,
  AddFeeListPage,
  AddNewExcelPage,
  ClientInfoPage,
  CreateEventPage,
  FeeCalendarPage,
  IntakeFormPage,
  NewMessagePage,
  ProviderPage,
  
} from "./pages/generated"; 
import ContactDetailsPage from "./pages/ContactDetailsPage";
import CaseContactsPage from "./pages/CaseContactsPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
     
  <Route
    path="/login"
    element={
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    }
  />
      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/case-details/:id" element={<CaseDetailsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/caseContacts" element={<CaseContactsPage />} />
        <Route path="/contacts/:id" element={<ContactDetailsPage />} />

        <Route path="/pnc" element={<PncPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/calllog-text" element={<CallLogTextPage />} />
        <Route path="/time-loss" element={<TimeLossPage />} />
        <Route path="/fee-list" element={<FeeListPage />} />
        <Route path="/excel-list" element={<ExcelListPage />} />

        <Route path="/add-case" element={<AddCasePage />} />
        <Route path="/add-contact" element={<AddContactPage />} />
        <Route path="/add-task" element={<AddTaskPage />} />
        <Route path="/add-timeloss" element={<AddTimeLossPage />} />
        <Route path="/add-feelist" element={<AddFeeListPage />} />
        <Route path="/add-new-excel" element={<AddNewExcelPage />} />

        <Route path="/client-info/:id" element={<ClientInfoPage />} />
        <Route path="/create_event" element={<CreateEventPage />} />
        <Route path="/fee-calendar" element={<FeeCalendarPage />} />
        {/* <Route path="/intake-form" element={<IntakeFormPage />} /> */}
        <Route path="/intake-form/:id?" element={<IntakeFormPage />} />

        <Route path="/new-message" element={<NewMessagePage />} />
        <Route path="/ChatPage" element={<ChatPage />} />
        <Route path="/provider" element={<ProviderPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
