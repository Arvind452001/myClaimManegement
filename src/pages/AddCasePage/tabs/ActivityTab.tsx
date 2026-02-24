// tabs/ActivityTab.tsx

import React from "react";
import { ActivityForm } from "../types/case.types";

type Props = {
  activity: ActivityForm;
  setActivity: React.Dispatch<React.SetStateAction<ActivityForm>>;
  saving: boolean;
  onSave: () => void;
};

export default function ActivityTab({
  activity,
  setActivity,
  saving,
  onSave,
}: Props) {
  return (
    <div className="tab-pane fade show active">
      <div className="section-card">
        <div className="section-title">
          <i className="fa fa-clock" /> Activity Timeline
        </div>

        <textarea
          className="form-control"
          placeholder="Enter activity..."
          value={activity.activity}
          onChange={(e) =>
            setActivity({ activity: e.target.value })
          }
        />

        <button
          className="btn btn-primary mt-2"
          type="button"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
