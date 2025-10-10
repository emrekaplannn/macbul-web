"use client";
import { useQuery } from "@tanstack/react-query";

export default function HealthCheck() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["ping"],
    queryFn: async () => (await fetch("/api/ping")).json(),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="p-6 rounded-2xl border bg-white space-y-2">
      <div className="text-lg font-semibold">System Health</div>
      <div>OK: {String(data?.ok ?? false)}</div>
      <div>Timestamp: {data?.ts ?? "-"}</div>
      <button
        className="px-3 py-2 rounded-lg border"
        disabled={isFetching}
        onClick={() => refetch()}
      >
        {isFetching ? "Checking..." : "Re-check"}
      </button>
    </div>
  );
}
