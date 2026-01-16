"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, Building2, Receipt } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface DashboardSummary {
  totalClients: number;
  totalProjects: number;
  activeProjects: number;
  totalScaffolds: number;
  scaffoldsInUse: number;
  totalProformas: number;
  totalProformasValue: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<DashboardSummary>("/dashboard/summary");
        setSummary(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Eroare la încărcarea datelor");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const kpiCards = summary
    ? [
        {
          title: "Clienți activi",
          value: summary.totalClients.toString(),
          icon: Users,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          title: "Proiecte active",
          value: summary.activeProjects.toString(),
          icon: FolderKanban,
          color: "text-green-600",
          bgColor: "bg-green-50",
        },
        {
          title: "Schele în utilizare",
          value: summary.scaffoldsInUse.toString(),
          icon: Building2,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        },
        {
          title: "Proforme emise",
          value: summary.totalProformasValue.toLocaleString("ro-RO"),
          unit: "RON",
          icon: Receipt,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        },
      ]
    : [];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-600">
          Prezentare generală a activității companiei
        </p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Se încarcă datele...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={kpi.title}
                className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-gray-200"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {kpi.title}
                  </CardTitle>
                  <div className={`${kpi.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {kpi.value}
                    </div>
                    {kpi.unit && (
                      <span className="text-sm font-medium text-gray-500">
                        {kpi.unit}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
