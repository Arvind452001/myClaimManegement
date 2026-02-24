import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { contactsAPI } from "../utils/api";

type ContactDetails = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
};

export default function ContactDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchContact = async () => {
      try {
        const response = await contactsAPI.getById(id);

        // ✅ FIXED HERE
        // response already contains { statusCode, data, message }
        setContact(response.data);

      } catch (error: any) {
        console.error(error);
        alert(error.message || "Failed to fetch contact");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!contact) return <div className="p-4">Contact not found.</div>;

  return (
    <div className="container mt-4">
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="card shadow">
        <div className="card-header text-white "style={{ backgroundColor: "#08225f" }}>
          <h5 className="mb-0">{contact.name}</h5>
        </div>

        <div className="card-body">

          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Phone:</strong> {contact.phone}
            </div>
            <div className="col-md-6">
              <strong>Email:</strong> {contact.email}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Status:</strong> {contact.status}
            </div>
            <div className="col-md-6">
              <strong>Assigned To:</strong>{" "}
              {contact.assignedTo?.name || "Unassigned"}
            </div>
          </div>

          <hr />

          <h6>System Information</h6>

          <div className="row mb-2">
            <div className="col-md-6">
              <strong>Created By:</strong>{" "}
              {contact.createdBy?.name || "-"}
            </div>
            <div className="col-md-6">
              <strong>Created At:</strong>{" "}
              {new Date(contact.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <strong>Updated At:</strong>{" "}
              {new Date(contact.updatedAt).toLocaleString()}
            </div>
            <div className="col-md-6">
              <strong>Updated By:</strong>{" "}
              {contact.updatedBy || "-"}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
