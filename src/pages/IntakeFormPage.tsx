import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clientsAPI } from "../utils/api";

type ClaimStatus = "Open" | "Closed";

const legalDecisionOptions = [
  "Accepted",
  "Rejected",
  "Under Review",
];

type IntakeFormState = {
  clientName: string;
  phone: string;
  birthdate: string; // YYYY-MM-DD
  address: string;
  email: string;
  emergencyContact: string;

  employer: string;
  position: string;
  accidentDate: string; // YYYY-MM-DD
  lAndIClaimNo: string;
  claimStatus: ClaimStatus;
  reasonForSeekingLegalHelp: string;

  decision: string;
};

export default function IntakeFormPage(): JSX.Element {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<IntakeFormState>({
    clientName: "",
    phone: "",
    birthdate: "",
    address: "",
    email: "",
    emergencyContact: "",
    employer: "",
    position: "",
    accidentDate: "",
    lAndIClaimNo: "",
    claimStatus: "Open",
    reasonForSeekingLegalHelp: "",
    decision: "",
  });

  // ================= FETCH FOR EDIT =================
  useEffect(() => {
    if (!id) return;
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      setLoading(true);

      const res = await clientsAPI.getById(id!);
      const data = res?.data?.data || res?.data;

      setForm({
        clientName: data.clientName || "",
        phone: data.phone || "",
        birthdate: data.birthdate?.split("T")[0] || "",
        address: data.address || "",
        email: data.email || "",
        emergencyContact: data.emergencyContact || "",
        employer: data.employer || "",
        position: data.position || "",
        accidentDate: data.dateOfAccident?.split("T")[0] || "",
        lAndIClaimNo: data.lAndIClaimNo || "",
        claimStatus: data.claimStatus || "Open",
        reasonForSeekingLegalHelp: data.reasonForSeekingLegalHelp || "",
        decision: data.decision || "",
      });
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT =================
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        clientName: form.clientName,
        phone: form.phone,
        birthdate: form.birthdate
          ? new Date(form.birthdate).toISOString()
          : null,
        address: form.address,
        email: form.email,
        emergencyContact: form.emergencyContact,
        employer: form.employer,
        position: form.position,
        dateOfAccident: form.accidentDate
          ? new Date(form.accidentDate).toISOString()
          : null,
        lAndIClaimNo: form.lAndIClaimNo,
        claimStatus: form.claimStatus,
        reasonForSeekingLegalHelp: form.reasonForSeekingLegalHelp,
        decision: form.decision,
      };

      if (isEditMode) {
        await clientsAPI.update({
          id,
          ...payload,
        });
      } else {
        await clientsAPI.create(payload);
        alert("created successfully")
      }

      navigate("/pnc");
    } catch (err) {
      console.error("Submit failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h4>{isEditMode ? "Edit Intake" : "Add PNC Intake"}</h4>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label">Client Name</label>
                  <input
                    className="form-control"
                    value={form.clientName}
                    onChange={(e) =>
                      setForm({ ...form, clientName: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Birthdate</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.birthdate}
                    onChange={(e) =>
                      setForm({ ...form, birthdate: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label">Address</label>
                  <input
                    className="form-control"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Emergency Contact</label>
                  <input
                    className="form-control"
                    value={form.emergencyContact}
                    onChange={(e) =>
                      setForm({ ...form, emergencyContact: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Employer</label>
                  <input
                    className="form-control"
                    value={form.employer}
                    onChange={(e) =>
                      setForm({ ...form, employer: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Position</label>
                  <input
                    className="form-control"
                    value={form.position}
                    onChange={(e) =>
                      setForm({ ...form, position: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Accident Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.accidentDate}
                    onChange={(e) =>
                      setForm({ ...form, accidentDate: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Claim No</label>
                  <input
                    className="form-control"
                    value={form.lAndIClaimNo}
                    onChange={(e) =>
                      setForm({ ...form, lAndIClaimNo: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Claim Status</label>
                  <select
                    className="form-select"
                    value={form.claimStatus}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        claimStatus: e.target.value as ClaimStatus,
                      })
                    }
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Reason for Seeking Legal Help
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.reasonForSeekingLegalHelp}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        reasonForSeekingLegalHelp: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Decision</label>
                 <select
  className="form-select"
  value={form.decision}
  onChange={(e) =>
    setForm({ ...form, decision: e.target.value })
  }
>
  <option value="">Select Decision</option>

  {legalDecisionOptions.map((option) => (
    <option key={option} value={option}>
      {option}
    </option>
  ))}
</select>

                </div>

              </div>

              <div className="mt-4 d-flex justify-content-between">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => navigate("/intake-list")}
                >
                  Back
                </button>

                <button className="btn btn-primary" type="submit">
                  {isEditMode ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
