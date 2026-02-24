import React, { useEffect, useState } from "react";
import { massageAPI, staffAPI, casesAPI } from "../utils/api";
import { Navigate, useNavigate } from "react-router-dom";

type StaffOption = {
  _id: string;
  name: string;
  email: string;
};

type CaseOption = {
  _id: string;
  caseId: string;
};

export default function NewMessagePage(): JSX.Element {
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromId, setFromId] = useState<string>("");
  const [caseId, setCaseId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();
  // ================= FETCH DATA =================
  useEffect(() => {
    fetchStaff();
    fetchCases();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await staffAPI.getStaffMember();
      const data = res.data || res || [];
      setStaff(data);

      if (data.length > 0) {
        setFromId(data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await casesAPI.getAllCases();
      const data = res.data || res || [];
      setCases(data);

      if (data.length > 0) {
        setCaseId(data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch cases");
    }
  };

  // ================= SUBMIT =================
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromId || !caseId || !message.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        from: fromId,
        caseId: caseId,
        message: message.trim(),
      };

      const response = await massageAPI.create(payload);

      alert(response.message || "Message sent successfully");
      navigate("/messages");
      setMessage("");
    } catch (err: any) {
      console.error("Failed to send message:", err);
      alert(err.response?.data?.message || "Failed to send message");
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between mb-2">
        <h4 className="mb-0">
          <i className="fa fa-envelope" /> New Message
        </h4>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row g-3">
              {/* From Dropdown */}
              <div className="col-md-6">
                <label className="form-label">From</label>
                <select
                  className="form-select"
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                >
                  <option value="">Select Staff</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Dropdown */}
              <div className="col-md-6">
                <label className="form-label">Regarding</label>
                <select
                  className="form-select"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                >
                  <option value="">Select Case</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.caseId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="col-md-12">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                />
              </div>

              {/* Submit */}
              <div className="col-md-12">
                <button className="btn btn-primary" type="submit">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
