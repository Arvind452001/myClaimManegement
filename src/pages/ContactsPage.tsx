import React, { useEffect, useMemo, useState } from "react";
import { contactsAPI, staffAPI } from "../utils/api";
import { useNavigate } from "react-router-dom";

type ContactStatus = "Potential" | "Inquiry" | "Client" | "Callback" | "Closed";

type Contact = {
  id: string;

  firstName: string;
  lastName: string;
  company: string;

  primaryPhone: string;
  secondaryPhone: string;

  email: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;

  contactType: string;

  createdAt?: string;
  updatedAt?: string;
};

type KanbanColumn = "Employer" | "Client" | "Vendor" | "Other";

const getKanbanColumn = (type: string): KanbanColumn => {
  if (type === "Employer") return "Employer";
  if (type === "Client") return "Client";
  if (type === "Vendor") return "Vendor";
  return "Other";
};


const getBadgeClass = (status: ContactStatus) => {
  switch (status) {
    case "Potential":
      return "bg-warning text-dark";
    case "Inquiry":
      return "bg-info text-dark";
    case "Client":
      return "bg-success";
    case "Callback":
      return "bg-primary";
    case "Closed":
      return "bg-dark";
    default:
      return "bg-secondary";
  }
};

export default function ContactsPage(): JSX.Element {
  const [contacts, setContacts] = useState<Contact[]>([]);

  // filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "">("");

  // UI tab
  const [activeTab, setActiveTab] = useState<"kanban" | "list">("list");

  // modal / editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  // console.log("users", users);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    primaryPhone: "",
    secondaryPhone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    contactType: "",
  });

  const navigate = useNavigate();


const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();

  return contacts.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();

    const matchQuery =
      !q ||
      fullName.includes(q) ||
      c.primaryPhone.includes(q) ||
      c.secondaryPhone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);

    const matchType =
      !statusFilter || c.contactType === statusFilter;

    return matchQuery && matchType;
  });
}, [contacts, query, statusFilter]);


 const kanbanData = useMemo(() => {
  const map: Record<KanbanColumn, Contact[]> = {
    Employer: [],
    Client: [],
    Vendor: [],
    Other: [],
  };

  filtered.forEach((c) => {
    const key = (c.contactType || "Other") as KanbanColumn;
    map[key].push(c);
  });

  return map;
}, [filtered]);


  const openEdit = (c: Contact) => {
    setEditingId(c.id);
    setEditForm({
      firstName: c.firstName,
      lastName: c.lastName,
      company: c.company,
      primaryPhone: c.primaryPhone,
      secondaryPhone: c.secondaryPhone,
      email: c.email,
      addressLine1: c.addressLine1,
      addressLine2: c.addressLine2,
      city: c.city,
      state: c.state,
      zipCode: c.zipCode,
      contactType: c.contactType,
    });
    setIsModalOpen(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setEditForm({
      firstName: "",
      lastName: "",
      company: "",
      primaryPhone: "",
      secondaryPhone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      contactType: "",
    });
    setIsModalOpen(true);
  };

  const onSave = async () => {
    if (!editForm.firstName.trim() || !editForm.primaryPhone.trim()) {
      alert("First Name and Primary Phone are required.");
      return;
    }

    try {
      const payload = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        company: editForm.company.trim(),
        primaryPhone: editForm.primaryPhone.trim(),
        secondaryPhone: editForm.secondaryPhone.trim(),
        email: editForm.email.trim(),
        addressLine1: editForm.addressLine1.trim(),
        addressLine2: editForm.addressLine2.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        zipCode: editForm.zipCode.trim(),
        contactType: editForm.contactType,
      };

      if (editingId) {
        await contactsAPI.update({ id: editingId, ...payload });
        alert("Contact updated successfully");
      } else {
        await contactsAPI.createCaseContact(payload);
        alert("Contact created successfully");
      }

      setIsModalOpen(false);
      setRefreshFlag((prev) => !prev);
    } catch (error: any) {
      alert(error.message || "Save failed");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await staffAPI.getStaffMember();
        const usersFromApi = response.data || response;
        setUsers(usersFromApi);
      } catch (err) {
        console.error("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await contactsAPI.getAll();

        // Extract data from API response
        const contactsFromApi = response.data || response;
        // console.log("contactsFromApi",contactsFromApi)
        const formatted: Contact[] = contactsFromApi.map((item: any) => ({
          id: item._id || item.id,

          firstName: item.firstName,
          lastName: item.lastName,
          company: item.company,

          primaryPhone: item.primaryPhone,
          secondaryPhone: item.secondaryPhone,

          email: item.email,

          addressLine1: item.addressLine1,
          addressLine2: item.addressLine2,
          city: item.city,
          state: item.state,
          zipCode: item.zipCode,

          contactType: item.contactType,

          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));

        setContacts(formatted);
      } catch (error: any) {
        console.error("Error fetching contacts:", error.message);
      }
    };

    fetchContacts();
  }, [refreshFlag]);

  const handledelete = async (id: string) => {
    try {
      const response = await contactsAPI.delete(id);
      alert(response.message);
      setRefreshFlag((prev) => !prev);
    } catch (error: any) {
      console.error("Error fetching contacts:", error.message);
    }
  };
  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h4 className="mb-0">👥 Contacts</h4>

        {/* local add (works without routing) */}
        <button
          className="btn btn-primary ms-2"
          type="button"
          onClick={openAdd}
        >
          + Add Contact
        </button>
      </div>

      {/* SEARCH & FILTER */}
      <div className="row mb-3 g-2">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search by Name or Phone"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ContactStatus | "")
            }
          >
            <option value="">All Status</option>
            <option value="Potential">Potential</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Client">Client</option>
            <option value="Callback">Callback</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* TABS */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "kanban" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("kanban")}
          >
            Kanban View
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "list" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("list")}
          >
            List View
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {/* ================= KANBAN ================= */}
     {activeTab === "kanban" ? (
  <div className="tab-pane fade show active">
    <div className="row">
      {(["Employer", "Client", "Vendor", "Other"] as KanbanColumn[]).map(
        (col) => (
          <div key={col} className="col-md-3">
            <div className="kanban-column">
              <div className="kanban-header">{col}</div>

              <div className="kanban-cards">
                {kanbanData[col].map((c) => (
                  <div
                    key={c.id}
                    className="kanban-card"
                    role="button"
                    onClick={() => openEdit(c)}
                  >
                    <b>
                      {c.firstName} {c.lastName}
                    </b>
                    <br />
                    <b>Email:</b> {c.email}
                    <br />
                    📞 {c.primaryPhone}
                    <br />
                    <span className="badge bg-secondary badge-status">
                      {c.contactType}
                    </span>
                  </div>
                ))}

                {kanbanData[col].length === 0 && (
                  <div className="text-muted small p-2">
                    No contacts
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  </div>
) : null}


        {/* ================= LIST ================= */}
        {activeTab === "list" ? (
          <div className="tab-pane fade show active">
            <div className="card shadow-sm">
              <div className="card-body">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Primary Phone</th>
                      <th>Email</th>
                      <th>Contact Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((c, idx) => (
                      <tr key={c.id}>
                        <td>{idx + 1}</td>

                        {/* Full Name */}
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/contacts/${c.id}`)}
                        >
                          {c.firstName} {c.lastName}
                        </td>

                        {/* Company */}
                        <td>{c.company}</td>

                        {/* Primary Phone */}
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/contacts/${c.id}`)}
                        >
                          {c.primaryPhone}
                        </td>

                        {/* Email */}
                        <td
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate(`/contacts/${c.id}`)}
                        >
                          {c.email}
                        </td>

                        {/* Contact Type */}
                        <td>
                          <span className="badge bg-secondary">
                            {c.contactType}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            type="button"
                            onClick={() => handledelete(c.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-success mx-1"
                            type="button"
                            onClick={() => openEdit(c)}
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          No contacts found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* MODAL */}
      <div
        className={`modal fade ${isModalOpen ? "show d-block" : ""}`}
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingId ? "Edit Contact" : "Add Contact"}
              </h5>
              <button
                className="btn-close"
                type="button"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <div className="modal-body">
              {/* First Name */}
              <label className="form-label">First Name</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, firstName: e.target.value }))
                }
              />

              {/* Last Name */}
              <label className="form-label">Last Name</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, lastName: e.target.value }))
                }
              />

              {/* Company */}
              <label className="form-label">Company</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.company}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, company: e.target.value }))
                }
              />

              {/* Primary Phone */}
              <label className="form-label">Primary Phone</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.primaryPhone}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, primaryPhone: e.target.value }))
                }
              />

              {/* Secondary Phone */}
              <label className="form-label">Secondary Phone</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.secondaryPhone}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, secondaryPhone: e.target.value }))
                }
              />

              {/* Email */}
              <label className="form-label">Email</label>
              <input
                className="form-control mb-2"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, email: e.target.value }))
                }
              />

              {/* Address Line 1 */}
              <label className="form-label">Address Line 1</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.addressLine1}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, addressLine1: e.target.value }))
                }
              />

              {/* Address Line 2 */}
              <label className="form-label">Address Line 2</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.addressLine2}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, addressLine2: e.target.value }))
                }
              />

              {/* City */}
              <label className="form-label">City</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.city}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, city: e.target.value }))
                }
              />

              {/* State */}
              <label className="form-label">State</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.state}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, state: e.target.value }))
                }
              />

              {/* Zip Code */}
              <label className="form-label">Zip Code</label>
              <input
                className="form-control mb-2"
                type="text"
                value={editForm.zipCode}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, zipCode: e.target.value }))
                }
              />

              {/* Contact Type */}
              <label className="form-label">Contact Type</label>
              <select
                className="form-select mb-3"
                value={editForm.contactType}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    contactType: e.target.value,
                  }))
                }
              >
                <option value="">Select Type</option>
                <option value="Employer">Employer</option>
                <option value="Client">Client</option>
                <option value="Vendor">Vendor</option>
                <option value="Other">Other</option>
              </select>

              {/* Save Button */}
              <button
                className="btn btn-primary w-100"
                type="button"
                onClick={onSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen ? (
        <div
          className="modal-backdrop fade show"
          onClick={() => setIsModalOpen(false)}
        />
      ) : null}

      <style>{`
        .kanban-column {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 10px;
          min-height: 420px;
        }
        .kanban-header {
          font-weight: 700;
          padding: 10px 12px;
          border-bottom: 1px solid #eee;
          margin-bottom: 10px;
        }
        .kanban-card {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 10px;
          margin-bottom: 10px;
          cursor: pointer;
          border: 1px solid #eee;
        }
        .kanban-card:hover {
          background: #eef2f7;
        }
        .badge-status {
          margin-top: 6px;
        }
      `}</style>
    </>
  );
}
