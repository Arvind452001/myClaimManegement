import React, { useMemo } from "react";

type UserRole = "Student" | "Instructor" | "Admin";
type UserStatus = "Active" | "Blocked";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joined: string; // "02 Jan 2026"
};

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export default function ProviderPage(): JSX.Element {
  const users: UserRow[] = useMemo(
    () => [
      {
        id: "1",
        name: "Alex Smith",
        email: "alex@gmail.com",
        role: "Student",
        status: "Active",
        joined: "02 Jan 2026",
      },
      {
        id: "2",
        name: "Maria Jones",
        email: "maria@gmail.com",
        role: "Instructor",
        status: "Active",
        joined: "04 Jan 2026",
      },
      {
        id: "3",
        name: "John Carter",
        email: "john@gmail.com",
        role: "Student",
        status: "Blocked",
        joined: "05 Jan 2026",
      },
      {
        id: "4",
        name: "Sophia Lee",
        email: "sophia@gmail.com",
        role: "Student",
        status: "Active",
        joined: "06 Jan 2026",
      },
      {
        id: "5",
        name: "David Brown",
        email: "david@gmail.com",
        role: "Admin",
        status: "Active",
        joined: "07 Jan 2026",
      },
      {
        id: "6",
        name: "Emma Wilson",
        email: "emma@gmail.com",
        role: "Student",
        status: "Active",
        joined: "08 Jan 2026",
      },
      {
        id: "7",
        name: "Ryan Cooper",
        email: "ryan@gmail.com",
        role: "Instructor",
        status: "Blocked",
        joined: "09 Jan 2026",
      },
    ],
    []
  );

  const onEdit = (u: UserRow) => {
    // hook: router.push(`/users/${u.id}/edit`)
    // console.log("Edit user:", u);
  };

  const onDelete = (u: UserRow) => {
    // hook: confirm + delete
    // console.log("Delete user:", u);
  };

  const badgeClass = (status: UserStatus) => {
    return status === "Active" ? "status-active" : "status-block";
  };

  return (
    <>
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>User List</strong>

          <div>
            <a className="btn btn-primary" href="/add-user">
              <i className="fa fa-plus" /> Add New User
            </a>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle datatable mb-0">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ width: 120 }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id}>
                  <td>{idx + 1}</td>

                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar">{initials(u.name)}</div>
                      {u.name}
                    </div>
                  </td>

                  <td>{u.email}</td>
                  <td>{u.role}</td>

                  <td>
                    <span className={badgeClass(u.status)}>{u.status}</span>
                  </td>

                  <td>{u.joined}</td>

                  <td>
                    <button className="btn btn-sm btn-info me-2" type="button" onClick={() => onEdit(u)}>
                      <i className="fas fa-pencil" />
                    </button>

                    <button className="btn btn-sm btn-danger" type="button" onClick={() => onDelete(u)}>
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          background: #f1f3f5;
          color: #333;
          border: 1px solid #e5e7eb;
          user-select: none;
        }

        .status-active {
          background: #d1fae5;
          color: #065f46;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .status-block {
          background: #fee2e2;
          color: #991b1b;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
      `}</style>
    </>
  );
}
