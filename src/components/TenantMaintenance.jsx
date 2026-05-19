import React, { useState } from "react";
import MaintenanceReport from "./MaintenanceReport";
import MaintenanceList from "./MaintenanceList";

export default function TenantMaintenance() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleReportCreated = () => {
        setRefreshKey((k) => k + 1);
    };

    return (
        <div>
            <MaintenanceReport onSuccess={handleReportCreated} />
            <MaintenanceList refreshKey={refreshKey} />
        </div>
    );
}
