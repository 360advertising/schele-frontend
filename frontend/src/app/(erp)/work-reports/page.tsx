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
import { apiRequest, API_BASE_URL } from "@/lib/api";
import { Eye, Plus, Trash2, CheckCircle, Download } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

interface ScaffoldComponent {
  id: string;
  name: string;
  code?: string;
}

interface WorkReportItem {
  id: string;
  scaffoldComponentId: string;
  quantity: number;
  length?: number;
  weight?: number;
  unitOfMeasure: string;
  notes?: string;
  scaffoldComponent?: ScaffoldComponent;
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
  items?: WorkReportItem[];
}

export default function WorkReportsPage() {
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [components, setComponents] = useState<ScaffoldComponent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<WorkReport | null>(null);
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);
  const [editingItem, setEditingItem] = useState<WorkReportItem | null>(null);
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
  const [formItems, setFormItems] = useState<Array<{
    id: string;
    scaffoldComponentId: string;
    quantity: number;
    length?: number;
    weight?: number;
    unitOfMeasure: string;
    notes?: string;
  }>>([]);
  const [newItemForm, setNewItemForm] = useState({
    scaffoldComponentId: "",
    quantity: 0,
    length: undefined as number | undefined,
    weight: undefined as number | undefined,
    unitOfMeasure: "PIECE",
    notes: "",
  });
  const [itemFormData, setItemFormData] = useState({
    scaffoldComponentId: "",
    quantity: 0,
    length: undefined as number | undefined,
    weight: undefined as number | undefined,
    unitOfMeasure: "PIECE",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkReports();
    fetchProjects();
    fetchComponents();
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

  const fetchComponents = async () => {
    try {
      const data = await apiRequest<ScaffoldComponent[]>("/components");
      setComponents(data);
    } catch (error: any) {
      console.error("Failed to fetch components:", error);
    }
  };

  const fetchWorkReportDetails = async (id: string) => {
    try {
      const data = await apiRequest<WorkReport>(`/work-reports/${id}`);
      setSelectedReport(data);
      setIsDetailsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut încărca detaliile procesului verbal",
        variant: "destructive",
      });
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
      // Load existing items if editing
      if (report.items) {
        setFormItems(report.items.map(item => ({
          id: item.id,
          scaffoldComponentId: item.scaffoldComponentId,
          quantity: Number(item.quantity) || 0,
          length: item.length ? Number(item.length) : undefined,
          weight: item.weight ? Number(item.weight) : undefined,
          unitOfMeasure: item.unitOfMeasure,
          notes: item.notes || "",
        })));
      } else {
        setFormItems([]);
      }
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
      setFormItems([]);
    }
    setNewItemForm({
      scaffoldComponentId: "",
      quantity: 0,
      length: undefined,
      weight: undefined,
      unitOfMeasure: "PIECE",
      notes: "",
    });
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
    setFormItems([]);
    setNewItemForm({
      scaffoldComponentId: "",
      quantity: 0,
      length: undefined,
      weight: undefined,
      unitOfMeasure: "PIECE",
      notes: "",
    });
  };

  const handleAddFormItem = () => {
    if (!newItemForm.scaffoldComponentId || newItemForm.quantity <= 0) {
      toast({
        title: "Eroare",
        description: "Componenta și cantitatea sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    setFormItems([
      ...formItems,
      {
        id: `temp-${Date.now()}`,
        ...newItemForm,
      },
    ]);

    setNewItemForm({
      scaffoldComponentId: "",
      quantity: 0,
      length: undefined,
      weight: undefined,
      unitOfMeasure: "PIECE",
      notes: "",
    });
  };

  const handleRemoveFormItem = (id: string) => {
    setFormItems(formItems.filter(item => item.id !== id));
  };

  const handleOpenItemDialog = (reportId: string, item?: WorkReportItem) => {
    if (item) {
      setEditingItem(item);
      setItemFormData({
        scaffoldComponentId: item.scaffoldComponentId,
        quantity: Number(item.quantity) || 0,
        length: item.length ? Number(item.length) : undefined,
        weight: item.weight ? Number(item.weight) : undefined,
        unitOfMeasure: item.unitOfMeasure,
        notes: item.notes || "",
      });
    } else {
      setEditingItem(null);
      setItemFormData({
        scaffoldComponentId: "",
        quantity: 0,
        length: undefined,
        weight: undefined,
        unitOfMeasure: "PIECE",
        notes: "",
      });
    }
    setSelectedReport(workReports.find(r => r.id === reportId) || null);
    setIsItemDialogOpen(true);
  };

  const handleCloseItemDialog = () => {
    setIsItemDialogOpen(false);
    setEditingItem(null);
    setItemFormData({
      scaffoldComponentId: "",
      quantity: 0,
      length: undefined,
      weight: undefined,
      unitOfMeasure: "PIECE",
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
      BILLED: "Facturat",
      CANCELLED: "Anulat",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === "BILLED") return "bg-green-100 text-green-800 border-green-200";
    if (status === "DRAFT") return "bg-gray-100 text-gray-800 border-gray-200";
    if (status === "CANCELLED") return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      METER: "m",
      KILOGRAM: "kg",
      PIECE: "buc",
      SQUARE_METER: "m²",
    };
    return labels[unit] || unit;
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
        // Update existing report
        await apiRequest(`/work-reports/${editingReport.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        
        // Update items - delete all existing and add new ones
        const existingItems = editingReport.items || [];
        for (const item of existingItems) {
          await apiRequest(`/work-reports/${editingReport.id}/items/${item.id}`, {
            method: "DELETE",
          });
        }
        
        for (const item of formItems) {
          await apiRequest(`/work-reports/${editingReport.id}/items`, {
            method: "POST",
            body: JSON.stringify({
              scaffoldComponentId: item.scaffoldComponentId,
              quantity: item.quantity,
              length: item.length,
              weight: item.weight,
              unitOfMeasure: item.unitOfMeasure,
              notes: item.notes,
            }),
          });
        }
        
        toast({
          title: "Succes",
          description: "Procesul verbal a fost actualizat cu succes",
        });
      } else {
        // Create new report
        const newReport = await apiRequest<WorkReport>("/work-reports", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        
        // Add items to the new report
        for (const item of formItems) {
          await apiRequest(`/work-reports/${newReport.id}/items`, {
            method: "POST",
            body: JSON.stringify({
              scaffoldComponentId: item.scaffoldComponentId,
              quantity: item.quantity,
              length: item.length,
              weight: item.weight,
              unitOfMeasure: item.unitOfMeasure,
              notes: item.notes,
            }),
          });
        }
        
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

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    
    if (!itemFormData.scaffoldComponentId || itemFormData.quantity <= 0) {
      toast({
        title: "Eroare",
        description: "Componenta și cantitatea sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...itemFormData,
        length: itemFormData.length || undefined,
        weight: itemFormData.weight || undefined,
        notes: itemFormData.notes || undefined,
      };

      await apiRequest(`/work-reports/${selectedReport.id}/items`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      toast({
        title: "Succes",
        description: "Linia a fost adăugată cu succes",
      });
      
      handleCloseItemDialog();
      fetchWorkReports();
      if (selectedReport) {
        fetchWorkReportDetails(selectedReport.id);
      }
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la adăugarea liniei",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (reportId: string, itemId: string) => {
    if (!confirm("Sigur dorești să ștergi această linie?")) {
      return;
    }

    try {
      await apiRequest(`/work-reports/${reportId}/items/${itemId}`, {
        method: "DELETE",
      });
      toast({
        title: "Succes",
        description: "Linia a fost ștearsă cu succes",
      });
      fetchWorkReports();
      if (selectedReport) {
        fetchWorkReportDetails(selectedReport.id);
      }
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergere",
        variant: "destructive",
      });
    }
  };

  const handleBill = async (reportId: string) => {
    if (!confirm("Sigur dorești să marchezi acest proces verbal ca facturat? Nu va mai putea fi modificat.")) {
      return;
    }

    try {
      await apiRequest(`/work-reports/${reportId}/bill`, {
        method: "POST",
      });
      toast({
        title: "Succes",
        description: "Procesul verbal a fost marcat ca facturat",
      });
      fetchWorkReports();
      setIsDetailsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la marcarea ca facturat",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPdf = async (reportId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/work-reports/${reportId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Eroare la generarea PDF-ului");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const report = workReports.find((r) => r.id === reportId);
      a.download = `Proces_Verbal_${report?.number || reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Succes",
        description: "PDF-ul a fost descărcat cu succes",
      });
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la descărcarea PDF-ului",
        variant: "destructive",
      });
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

  // Get unique clients from projects
  const clients = Array.from(
    new Map(
      projects
        .map((p) => [p.clientId, (p as any).client] as [string, Client])
        .filter(([, client]) => client != null)
    ).values()
  ) as Client[];

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
                      Linii
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
                        {report.items?.length || 0} linii
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                            onClick={() => handleDownloadPdf(report.id)}
                            title="Descarcă PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                            onClick={() => fetchWorkReportDetails(report.id)}
                            title="Vezi detalii"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {report.status === "DRAFT" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                                onClick={() => handleOpenDialog(report)}
                              >
                                Editează
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200"
                                onClick={() => handleOpenItemDialog(report.id)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </>
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
                    {clients.map((client) => (
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

            {/* Tabel Componente */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Componente</h3>
              </div>
              
              {/* Formular adăugare linie nouă */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Select
                      value={newItemForm.scaffoldComponentId}
                      onValueChange={(value) => setNewItemForm({ ...newItemForm, scaffoldComponentId: value })}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează componentă" />
                      </SelectTrigger>
                      <SelectContent>
                        {components.map((component) => (
                          <SelectItem key={component.id} value={component.id}>
                            {component.name} {component.code ? `(${component.code})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Bucăți"
                      value={newItemForm.quantity || ""}
                      onChange={(e) => setNewItemForm({ ...newItemForm, quantity: parseFloat(e.target.value) || 0 })}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Lungime (m)"
                      value={newItemForm.length || ""}
                      onChange={(e) => setNewItemForm({ ...newItemForm, length: e.target.value ? parseFloat(e.target.value) : undefined })}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Greutate (kg)"
                      value={newItemForm.weight || ""}
                      onChange={(e) => setNewItemForm({ ...newItemForm, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      onClick={handleAddFormItem}
                      disabled={submitting}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Select
                      value={newItemForm.unitOfMeasure}
                      onValueChange={(value) => setNewItemForm({ ...newItemForm, unitOfMeasure: value })}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unitate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PIECE">Bucată (buc)</SelectItem>
                        <SelectItem value="METER">Metru (m)</SelectItem>
                        <SelectItem value="KILOGRAM">Kilogram (kg)</SelectItem>
                        <SelectItem value="SQUARE_METER">Metru pătrat (m²)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-7">
                    <Input
                      type="text"
                      placeholder="Observații (opțional)"
                      value={newItemForm.notes || ""}
                      onChange={(e) => setNewItemForm({ ...newItemForm, notes: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Tabel componente adăugate */}
              {formItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Componentă</th>
                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Bucăți</th>
                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Lungime (m)</th>
                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Greutate (kg)</th>
                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Unitate</th>
                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Total</th>
                        <th className="text-right py-2 px-4 font-semibold text-gray-700">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formItems.map((item) => {
                        const component = components.find(c => c.id === item.scaffoldComponentId);
                        const total = item.quantity * (item.length || item.weight || 1);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4">
                              {component?.name || "N/A"}
                              {component?.code && (
                                <span className="text-xs text-gray-500 ml-1">({component.code})</span>
                              )}
                            </td>
                            <td className="py-2 px-4 text-right">{item.quantity}</td>
                            <td className="py-2 px-4 text-right">{item.length || "-"}</td>
                            <td className="py-2 px-4 text-right">{item.weight || "-"}</td>
                            <td className="py-2 px-4">{getUnitLabel(item.unitOfMeasure)}</td>
                            <td className="py-2 px-4 text-right font-medium">{total.toFixed(2)}</td>
                            <td className="py-2 px-4 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleRemoveFormItem(item.id)}
                                disabled={submitting}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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

      {/* Add Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={handleCloseItemDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editează linie" : "Adaugă linie în proces verbal"}
            </DialogTitle>
            <DialogDescription>
              Adaugă o componentă în procesul verbal. Componenta și cantitatea sunt obligatorii.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="scaffoldComponentId" className="text-sm font-medium text-gray-700">
                Componentă <span className="text-red-500">*</span>
              </label>
              <Select
                value={itemFormData.scaffoldComponentId}
                onValueChange={(value) => setItemFormData({ ...itemFormData, scaffoldComponentId: value })}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează componentă" />
                </SelectTrigger>
                <SelectContent>
                  {components.map((component) => (
                    <SelectItem key={component.id} value={component.id}>
                      {component.name} {component.code ? `(${component.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Cantitate <span className="text-red-500">*</span>
                </label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={itemFormData.quantity}
                  onChange={(e) => setItemFormData({ ...itemFormData, quantity: parseFloat(e.target.value) || 0 })}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="unitOfMeasure" className="text-sm font-medium text-gray-700">
                  Unitate măsură <span className="text-red-500">*</span>
                </label>
                <Select
                  value={itemFormData.unitOfMeasure}
                  onValueChange={(value) => setItemFormData({ ...itemFormData, unitOfMeasure: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează unitate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIECE">Bucată (buc)</SelectItem>
                    <SelectItem value="METER">Metru (m)</SelectItem>
                    <SelectItem value="KILOGRAM">Kilogram (kg)</SelectItem>
                    <SelectItem value="SQUARE_METER">Metru pătrat (m²)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="length" className="text-sm font-medium text-gray-700">
                  Lungime (m)
                </label>
                <Input
                  id="length"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemFormData.length || ""}
                  onChange={(e) => setItemFormData({ ...itemFormData, length: e.target.value ? parseFloat(e.target.value) : undefined })}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="weight" className="text-sm font-medium text-gray-700">
                  Greutate (kg)
                </label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemFormData.weight || ""}
                  onChange={(e) => setItemFormData({ ...itemFormData, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="itemNotes" className="text-sm font-medium text-gray-700">
                Observații
              </label>
              <Textarea
                id="itemNotes"
                value={itemFormData.notes}
                onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                placeholder="Observații despre componentă"
                rows={3}
                disabled={submitting}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseItemDialog}
                disabled={submitting}
              >
                Anulează
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? "Se salvează..." : editingItem ? "Actualizează" : "Adaugă linie"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalii Proces Verbal: {selectedReport?.number}
            </DialogTitle>
            <DialogDescription>
              Informații complete despre procesul verbal și liniile sale
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              {/* Informații generale */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Informații generale</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Client:</strong> {selectedReport.client?.name || "-"}</p>
                    <p><strong>Proiect:</strong> {selectedReport.project?.name || "-"}</p>
                    <p><strong>Tip lucrare:</strong> {getWorkTypeLabel(selectedReport.workType)}</p>
                    <p><strong>Dată:</strong> {formatDate(selectedReport.reportDate)}</p>
                    <p><strong>Locație:</strong> {selectedReport.location || "-"}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedReport.status)}`}>
                        {getStatusLabel(selectedReport.status)}
                      </span>
                    </p>
                  </div>
                </div>
                {selectedReport.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Observații</h3>
                    <p className="text-sm text-gray-600">{selectedReport.notes}</p>
                  </div>
                )}
              </div>

              {/* Linii proces verbal */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Linii proces verbal ({selectedReport.items?.length || 0})
                  </h3>
                  {selectedReport.status === "DRAFT" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsDetailsDialogOpen(false);
                        handleOpenItemDialog(selectedReport.id);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adaugă linie
                    </Button>
                  )}
                </div>
                
                {selectedReport.items && selectedReport.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Componentă</th>
                          <th className="text-right py-2 px-4 font-semibold text-gray-700">Cantitate</th>
                          <th className="text-right py-2 px-4 font-semibold text-gray-700">Lungime</th>
                          <th className="text-right py-2 px-4 font-semibold text-gray-700">Greutate</th>
                          <th className="text-left py-2 px-4 font-semibold text-gray-700">Unitate</th>
                          {selectedReport.status === "DRAFT" && (
                            <th className="text-right py-2 px-4 font-semibold text-gray-700">Acțiuni</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedReport.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4">
                              {item.scaffoldComponent?.name || "N/A"}
                              {item.scaffoldComponent?.code && (
                                <span className="text-xs text-gray-500 ml-1">({item.scaffoldComponent.code})</span>
                              )}
                            </td>
                            <td className="py-2 px-4 text-right">
                              {Number(item.quantity) || 0}
                            </td>
                            <td className="py-2 px-4 text-right">
                              {item.length ? Number(item.length) : "-"}
                            </td>
                            <td className="py-2 px-4 text-right">
                              {item.weight ? Number(item.weight) : "-"}
                            </td>
                            <td className="py-2 px-4">{getUnitLabel(item.unitOfMeasure)}</td>
                            {selectedReport.status === "DRAFT" && (
                              <td className="py-2 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteItem(selectedReport.id, item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nu există linii în acest proces verbal.</p>
                    {selectedReport.status === "DRAFT" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsDetailsDialogOpen(false);
                          handleOpenItemDialog(selectedReport.id);
                        }}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adaugă prima linie
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Acțiuni */}
              {selectedReport.status === "DRAFT" && selectedReport.items && selectedReport.items.length > 0 && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleBill(selectedReport.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marchează ca facturat
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
