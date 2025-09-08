// api/warehouse/internal_usage_log/types/internal.tsx

export type InternalUsage = {
    id: number;
    personnelName: string;
    department: string;
    purpose: string;
    authorizedBy: string;
    note?: string;
    status: "Utilized" | "Archived";
    loggedAt: string;
};