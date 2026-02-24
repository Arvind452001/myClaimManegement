import React, { useMemo, useState } from "react";
import { contactsAPI } from "../utils/api";

type ContactForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  emergencyContact: string;
  employer: string;
  workTitle: string;
};

export default function AddContactPage(): JSX.Element {
  const initialState = useMemo<ContactForm>(
    () => ({
      name: "",
      phone: "",
      email: "",
      address: "",
      dob: "",
      emergencyContact: "",
      employer: "",
      workTitle: "",
    }),
    []
  );

  const [form, setForm] = useState<ContactForm>(initialState);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const reset = () => setForm(initialState);

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setSaving(true);

    const response = await contactsAPI.create(form); // 👈 direct form send

    console.log("Created contact:", response);

    reset();
    alert("Contact saved successfully!");
  } catch (error: any) {
    console.error(error);
    alert(error?.message || "Failed to save contact.");
  } finally {
    setSaving(false);
  }
};



  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>Add New Contact</strong>
        <div>
          <a className="btn btn-primary" href="/contacts">
            <i className="fa fa-eye" /> View All
          </a>
        </div>
      </div>

      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            {/* NAME */}
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                placeholder="Enter full name"
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            {/* PHONE */}
            <div className="col-md-4">
              <label className="form-label">Phone Number</label>
              <input
                className="form-control"
                placeholder="Enter phone number"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                inputMode="numeric"
              />
            </div>

            {/* EMAIL */}
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                placeholder="Enter email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            {/* ADDRESS */}
            <div className="col-md-6">
              <label className="form-label">Address</label>
              <input
                className="form-control"
                placeholder="Enter address"
                type="text"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>

            {/* DOB */}
            <div className="col-md-3">
              <label className="form-label">DOB</label>
              <input
                className="form-control"
                type="date"
                value={form.dob}
                onChange={(e) => update("dob", e.target.value)}
              />
            </div>

            {/* EMERGENCY */}
            <div className="col-md-3">
              <label className="form-label">Emergency Contact</label>
              <input
                className="form-control"
                placeholder="Emergency contact"
                type="text"
                value={form.emergencyContact}
                onChange={(e) => update("emergencyContact", e.target.value)}
              />
            </div>

            {/* EMPLOYER */}
            <div className="col-md-4">
              <label className="form-label">Employer</label>
              <input
                className="form-control"
                placeholder="Company name"
                type="text"
                value={form.employer}
                onChange={(e) => update("employer", e.target.value)}
              />
            </div>

            {/* WORK TITLE */}
            <div className="col-md-4">
              <label className="form-label">Work Title</label>
              <input
                className="form-control"
                placeholder="Job title"
                type="text"
                value={form.workTitle}
                onChange={(e) => update("workTitle", e.target.value)}
              />
            </div>

            <div className="col-md-12 d-flex gap-2 mt-2">
              <button className="btn btn-secondary" type="button" onClick={reset} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Contact"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
