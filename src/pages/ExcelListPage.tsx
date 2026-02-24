import React, { useEffect, useState } from "react";
import { formatDateMMDDYY } from "../utils/dateUtils";
import { excelAPI, staffAPI } from "../utils/api";

type ExcelType = "Contacts" | "Tasks" | "PNCs" | "Cases";
type StatusType = "Pending" | "Processing" | "Processed";

type ExcelRow = {
  id: string;
  sheetName: string;
  sheetType: ExcelType;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
  lastUpdated: string;
  records: number;
  status: StatusType;
};

type User = {
  _id: string;
  name: string;
  email: string;
};

export default function ExcelListPage(): JSX.Element {
  const [rows, setRows] = useState<ExcelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedUserName, setUploadedUserName] = useState<User | null>(null);
  const [sheetName, setSheetName] = useState("");
  const [sheetType, setSheetType] = useState<ExcelType>("Contacts");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRow, setSelectedRow] = useState<ExcelRow | null>(null);

  // NEW UPDATE MODAL STATE
  const [updateRow, setUpdateRow] = useState<ExcelRow | null>(null);
  const [status, setStatus] = useState<StatusType>("Pending");
  const [updating, setUpdating] = useState(false);


  // ================= FETCH LIST =================
  const fetchExcelList = async () => {
    try {
      setLoading(true);
      const res = await excelAPI.getAll();
      // console.log(res.data)
      const data = res.data;

      const formatted = data.map((item: any) => ({
        id: item._id,
        sheetName: item.sheetName,
        sheetType: item.sheetType,
        fileName: item.fileName,
        fileUrl: item.fileUrl,
        uploadedBy: item.uploadedBy,
        createdAt: item.createdAt,
        lastUpdated: item.updatedAt,
        records: item.records || 0,
        status: item.status || "Pending",
      }));
     setRows(formatted);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExcelList();
  }, []);

  useEffect(() => {
    if (!selectedRow?.uploadedBy) return;

    const fetchUser = async () => {
      try {
        const res = await staffAPI.getUserById(selectedRow.uploadedBy);
        setUploadedUserName(res.data);
      } catch (error) {
        console.error("User fetch error:", error);
        setUploadedUserName(null);
      }
    };

    fetchUser();
  }, [selectedRow]);

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Excel?")) return;

    try {
      setLoading(true);
      await excelAPI.delete(id);
      alert("Deleted successfully");
      setRows((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE =================
  // const handleUpdateStatus = async () => {
  //   if (!updateRow) return;

  //   try {
  //     setUpdating(true);

  //     await excelAPI.update({
  //       id: updateRow.id,
  //       status: status,
  //     });

  //     alert("Updated successfully");

  //     setRows((prev) =>
  //       prev.map((item) =>
  //         item.id === updateRow.id ? { ...item, status } : item,
  //       ),
  //     );

  //     setUpdateRow(null);
  //   } catch (error) {
  //     alert("Update failed");
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

  const getStatusBadge = (status: StatusType) => {
    switch (status) {
      case "Pending":
        return "badge bg-warning";
      case "Processing":
        return "badge bg-info";
      case "Processed":
        return "badge bg-success";
      default:
        return "badge bg-secondary";
    }
  };

  const isImage = (fileName: string) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h4 className="mb-0">Excel List</h4>
        <a className="btn btn-primary" href="/add-new-excel">
          + Add Excel
        </a>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Sheet Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Uploaded Date</th>
                <th style={{ width: 220 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No excel sheets found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.sheetName}</td>
                    <td>{row.sheetType}</td>
                    <td>
                      <span className={getStatusBadge(row.status)}>
                        {row.status}
                      </span>
                    </td>
                    <td>{formatDateMMDDYY(row.createdAt)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {/* View */}
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setSelectedRow(row)}
                          title="View"
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        {/* Update */}
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => {
                            setUpdateRow(row);
                            setStatus(row.status);
                            setSheetName(row.sheetName);
                            setSheetType(row.sheetType);
                            setSelectedFile(null);
                          }}
                          title="Update"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(row.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
     {selectedRow && (
  <>
    <div className="modal show d-block">
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Excel Details</h5>
            <button
              className="btn-close btn-close-white"
              onClick={() => setSelectedRow(null)}
            />
          </div>

          <div className="modal-body">
            <div className="row g-3">

              <div className="col-md-6">
                <strong>File Name:</strong>
                <div>{selectedRow.fileName}</div>
              </div>

              <div className="col-md-6">
                <strong>Sheet Name:</strong>
                <div>{selectedRow.sheetName}</div>
              </div>

              <div className="col-md-6">
                <strong>Sheet Type:</strong>
                <div>{selectedRow.sheetType}</div>
              </div>

              <div className="col-md-6">
                <strong>Status:</strong>
                <div>
                  <span
                    className={`badge ${
                      selectedRow.status === "Pending"
                        ? "bg-warning text-dark"
                        : "bg-success"
                    }`}
                  >
                    {selectedRow.status}
                  </span>
                </div>
              </div>

              <div className="col-md-6">
                <strong>Records:</strong>
                <div>{selectedRow.records}</div>
              </div>

              <div className="col-md-6">
                <strong>Uploaded By:</strong>
                <div>{uploadedUserName?.name}</div>
              </div>

              <div className="col-md-6">
                <strong>Created At:</strong>
                <div>
                  {new Date(selectedRow.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="col-md-6">
                <strong>Last Updated:</strong>
                <div>
                  {new Date(selectedRow.lastUpdated).toLocaleString()}
                </div>
              </div>

              <div className="col-md-12">
                <strong>View File:</strong>
                <div className="mt-2">
                  <a
                    href={selectedRow.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    View Document
                  </a>
                </div>
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedRow(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      className="modal-backdrop show"
      onClick={() => setSelectedRow(null)}
    />
  </>
)}

      {/* ================= UPDATE MODAL ================= */}
      {updateRow && (
        <>
          <div className="modal show d-block">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-warning">
                  <h5 className="modal-title">Update Excel Details</h5>
                  <button
                    className="btn-close"
                    onClick={() => setUpdateRow(null)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Sheet Name</label>
                    <input
                      className="form-control"
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Sheet Type</label>
                    <select
                      className="form-select"
                      value={sheetType}
                      onChange={(e) =>
                        setSheetType(e.target.value as ExcelType)
                      }
                    >
                      <option value="Contacts">Contacts</option>
                      <option value="Tasks">Tasks</option>
                      <option value="PNCs">PNCs</option>
                      <option value="Cases">Cases</option>
                    </select>
                  </div>

                  {/* <div className="mb-3">
                    <label className="form-label">Upload New File</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div> */}

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as StatusType)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processed">Processed</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setUpdateRow(null)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      try {
                        setUpdating(true);

                        await excelAPI.update({
                          id: updateRow.id,
                          sheetName,
                          sheetType,
                          status,
                          file: selectedFile || undefined,
                        });

                        alert("Updated successfully");

                        setRows((prev) =>
                          prev.map((item) =>
                            item.id === updateRow.id
                              ? {
                                  ...item,
                                  sheetName,
                                  sheetType,
                                  status,
                                }
                              : item,
                          ),
                        );

                        setUpdateRow(null);
                      } catch (error) {
                        alert("Update failed");
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop show"></div>
        </>
      )}
    </>
  );
}
