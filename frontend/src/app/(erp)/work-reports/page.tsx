"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// DEMO MODE – Mock data for client demo
const workReports: Array<{
  id: string;
  number: string;
  client: string;
  project: string;
  workType: string;
  date: string;
  status: string;
}> = [
  {
    id: "1",
    number: "PV-2024-001",
    client: "Constructii ABC SRL",
    project: "Bloc rezidential - Sector 1",
    workType: "Instalare",
    date: "05.03.2024",
    status: "Draft",
  },
  {
    id: "2",
    number: "PV-2024-002",
    client: "Proiecte XYZ SA",
    project: "Centru comercial - Pipera",
    workType: "Instalare",
    date: "20.04.2024",
    status: "Facturat",
  },
  {
    id: "3",
    number: "PV-2024-003",
    client: "Constructii ABC SRL",
    project: "Bloc rezidential - Sector 1",
    workType: "Modificare",
    date: "15.05.2024",
    status: "Draft",
  },
];

const mockProjects = [
  "Bloc rezidential - Sector 1",
  "Centru comercial - Pipera",
  "Renovare hotel - centru",
];

export default function WorkReportsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    project: "",
    type: "",
    date: "",
    responsible: "",
    notes: "",
  });
  const { toast } = useToast();
  const hasWorkReports = workReports.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demo Mode",
      description: "Datele nu sunt salvate. Aceasta este o demonstrație.",
    });
    setIsOpen(false);
    setFormData({
      project: "",
      type: "",
      date: "",
      responsible: "",
      notes: "",
    });
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Procese verbale</h1>
          <p className="text-sm text-gray-600">
            Instalări, dezinstalări și modificări schele
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Proces verbal nou
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {!hasWorkReports ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nu există procese verbale
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Creează un proces verbal pentru a începe facturarea
              </p>
            </div>
          ) : (
            // Table Structure
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nr. proces verbal
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Proiect
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tip lucrare
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Dată
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {workReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {report.number}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {report.client}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {report.project}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {report.workType}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {report.date}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            report.status === "Facturat"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : report.status === "Draft"
                              ? "bg-gray-100 text-gray-800 border-gray-200"
                              : report.status === "Anulat"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                          >
                            Vizualizează
                          </Button>
                          {report.status === "Draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                            >
                              Editează
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Work Report Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proces verbal nou</DialogTitle>
            <DialogDescription>
              Completează informațiile pentru procesul verbal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="project" className="text-sm font-medium text-gray-700">
                Proiect
              </label>
              <Select value={formData.project} onValueChange={(value) => setFormData({ ...formData, project: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează proiect" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-gray-700">
                Tip PV
              </label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Montaj">Montaj</SelectItem>
                  <SelectItem value="Demontaj">Demontaj</SelectItem>
                  <SelectItem value="Verificare">Verificare</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-gray-700">
                Dată
              </label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="responsible" className="text-sm font-medium text-gray-700">
                Responsabil
              </label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Nume responsabil"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Observații
              </label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detalii despre lucrările efectuate"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
              >
                Anulează
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Generează proces verbal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
