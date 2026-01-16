"use client";

import { useState, useEffect } from "react";
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
import { apiRequest } from "@/lib/api";

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

interface WorkReport {
  id: string;
  number: string;
  clientId: string;
  projectId: string;
  workType: string;
  reportDate?: string;
  location?: string;
  notes?: string;
  status: string;
  client?: Client;
  project?: Project;
}

export default function WorkReportsPage() {
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<WorkReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    clientId: "",
    projectId: "",
    workType: "INSTALLATION",
    reportDate: new Date().toISOString().split("T")[0],
    location: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkReports();
    fetchProjects();
  }, []);

  const fetchWorkReports = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<WorkReport[]>("/work-reports");
      setWorkReports(data);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut încărca procesele verbale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiRequest<Project[]>("/projects");
      setProjects(data);
    } catch (error: any) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const handleOpenDialog = (report?: WorkReport) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        number: report.number || "",
        clientId: report.clientId || "",
        projectId: report.projectId || "",
        workType: report.workType || "INSTALLATION",
        reportDate: report.reportDate ? report.reportDate.split("T")[0] : new Date().toISOString().split("T")[0],
        location: report.location || "",
        notes: report.notes || "",
      });
    } else {
      setEditingReport(null);
      setFormData({
        number: "",
        clientId: "",
        projectId: "",
        workType: "INSTALLATION",
        reportDate: new Date().toISOString().split("T")[0],
        location: "",
        notes: "",
      });
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingReport(null);
    setFormData({
      number: "",
      clientId: "",
      projectId: "",
      workType: "INSTALLATION",
      reportDate: new Date().toISOString().split("T")[0],
      location: "",
      notes: "",
    });
  };

  const handleClientChange = (clientId: string) => {
    setFormData({ ...formData, clientId, projectId: "" });
  };

  const getWorkTypeLabel = (workType: string) => {
    const labels: Record<string, string> = {
      INSTALLATION: "Instalare",
      UNINSTALLATION: "Dezinstalare",
      MODIFICATION: "Modificare",
    };
    return labels[workType] || workType;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: "Draft",
      COMPLETED: "Finalizat",
      BILLED: "Facturat",
      CANCELLED: "Anulat",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === "BILLED") return "bg-green-100 text-green-800 border-green-200";
    if (status === "COMPLETED") return "bg-blue-100 text-blue-800 border-blue-200";
    if (status === "DRAFT") return "bg-gray-100 text-gray-800 border-gray-200";
    if (status === "CANCELLED") return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number.trim() || !formData.clientId || !formData.projectId) {
      toast({
        title: "Eroare",
        description: "Numărul procesului verbal, clientul și proiectul sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        reportDate: formData.reportDate || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      };
      if (editingReport) {
        await apiRequest(`/work-reports/${editingReport.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Procesul verbal a fost actualizat cu succes",
        });
      } else {
        await apiRequest("/work-reports", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Procesul verbal a fost creat cu succes",
        });
      }
      handleCloseDialog();
      fetchWorkReports();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la salvare",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur dorești să ștergi acest proces verbal?")) {
      return;
    }

    try {
      await apiRequest(`/work-reports/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Succes",
        description: "Procesul verbal a fost șters cu succes",
      });
      fetchWorkReports();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergere",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ro-RO");
  };

  const filteredProjects = formData.clientId
    ? projects.filter((p) => p.clientId === formData.clientId)
    : [];

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
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Proces verbal nou
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-600">Se încarcă...</p>
            </div>
          ) : workReports.length === 0 ? (
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
                        {report.client?.name || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {report.project?.name || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {getWorkTypeLabel(report.workType)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatDate(report.reportDate)}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          {report.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              onClick={() => handleOpenDialog(report)}
                            >
                              Editează
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                            onClick={() => handleDelete(report.id)}
                          >
                            Șterge
                          </Button>
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

      {/* Add/Edit Work Report Dialog */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? "Editează proces verbal" : "Proces verbal nou"}
            </DialogTitle>
            <DialogDescription>
              Completează informațiile pentru procesul verbal. Toate câmpurile marcate cu * sunt obligatorii.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="number" className="text-sm font-medium text-gray-700">
                Număr proces verbal <span className="text-red-500">*</span>
              </label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Ex: PV-2024-001"
                required
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="clientId" className="text-sm font-medium text-gray-700">
                  Client <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.clientId}
                  onValueChange={handleClientChange}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează client" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(projects.map((p) => p.clientId)))
                      .map((clientId) => {
                        const project = projects.find((p) => p.clientId === clientId);
                        return project?.client || null;
                      })
                      .filter(Boolean)
                      .map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="projectId" className="text-sm font-medium text-gray-700">
                  Proiect <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  disabled={!formData.clientId || submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.clientId ? "Selectează proiect" : "Selectează mai întâi clientul"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="workType" className="text-sm font-medium text-gray-700">
                  Tip lucrare <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.workType}
                  onValueChange={(value) => setFormData({ ...formData, workType: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează tip" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSTALLATION">Instalare</SelectItem>
                    <SelectItem value="UNINSTALLATION">Dezinstalare</SelectItem>
                    <SelectItem value="MODIFICATION">Modificare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="reportDate" className="text-sm font-medium text-gray-700">
                  Dată proces verbal
                </label>
                <Input
                  id="reportDate"
                  type="date"
                  value={formData.reportDate}
                  onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Locație
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Locația lucrării"
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseDialog}
                disabled={submitting}
              >
                Anulează
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? "Se salvează..." : editingReport ? "Actualizează" : "Generează proces verbal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
