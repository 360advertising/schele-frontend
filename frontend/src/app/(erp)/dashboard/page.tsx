"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderKanban, Building2, Receipt } from "lucide-react";

const kpiCards = [
  {
    title: "Clienți activi",
    value: "12",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Proiecte active",
    value: "5",
    icon: FolderKanban,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Schele în utilizare",
    value: "18",
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Proforme emise",
    value: "125.000",
    unit: "RON",
    icon: Receipt,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-600">
          Prezentare generală a activității companiei
        </p>
      </div>

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
    </div>
  );
}
