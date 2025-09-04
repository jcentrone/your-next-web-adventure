import React from "react";
import { Link } from "react-router-dom";

const Advanced: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Advanced Settings</h2>
      <ul className="list-disc pl-4 space-y-2">
        <li>
          <Link to="/defects-admin" className="text-primary underline">
            Defects Admin
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Advanced;
