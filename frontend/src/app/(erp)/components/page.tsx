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

interface Project {
  id: string;
  name: string;
}

interface ScaffoldComponent {
  id: string;
  code?: string;
  name: string;
  type?: string;
  status: string;
  totalStock: number;
  availableStock: number;
  currentProjectId?: string;
  location?: string;
  notes?: string;
  currentProject?: Project;
}

export default function ComponentsPage() {
  const [components, setComponents] = useState<ScaffoldComponent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ScaffoldComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "",
    totalStock: 0,
    availableStock: 0,
    status: "AVAILABLE",
    currentProjectId: "none",
    location: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchComponents();
    fetchProjects();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<ScaffoldComponent[]>("/components");
      setComponents(data);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut încărca componentele",
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

  const handleOpenDialog = (component?: ScaffoldComponent) => {
    if (component) {
      setEditingComponent(component);
      setFormData({
        name: component.name || "",
        code: component.code || "",
        type: component.type || "",
        totalStock: typeof component.totalStock === 'number' ? component.totalStock : parseFloat(String(component.totalStock)),
        availableStock: typeof component.availableStock === 'number' ? component.availableStock : parseFloat(String(component.availableStock)),
        status: component.status || "AVAILABLE",
        currentProjectId: component.currentProjectId || "none",
        location: component.location || "",
        notes: component.notes || "",
      });
    } else {
      setEditingComponent(null);
      setFormData({
        name: "",
        code: "",
        type: "",
        totalStock: 0,
        availableStock: 0,
        status: "AVAILABLE",
        currentProjectId: "none",
        location: "",
        notes: "",
      });
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingComponent(null);
    setFormData({
      name: "",
      code: "",
      type: "",
      totalStock: 0,
      availableStock: 0,
      status: "AVAILABLE",
      currentProjectId: "none",
      location: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Eroare",
        description: "Numele componentei este obligatoriu",
        variant: "destructive",
      });
      return;
    }
    if (formData.availableStock > formData.totalStock) {
      toast({
        title: "Eroare",
        description: "Stocul disponibil nu poate depăși stocul total",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        currentProjectId: formData.currentProjectId === "none" ? undefined : formData.currentProjectId,
      };
      
      if (editingComponent) {
        await apiRequest(`/components/${editingComponent.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Componenta a fost actualizată cu succes",
        });
      } else {
        await apiRequest("/components", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Componenta a fost adăugată cu succes",
        });
      }
      handleCloseDialog();
      fetchComponents();
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
    if (!confirm("Sigur dorești să ștergi această componentă?")) {
      return;
    }

    try {
      await apiRequest(`/components/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Succes",
        description: "Componenta a fost ștearsă cu succes",
      });
      fetchComponents();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergere",
        variant: "destructive",
      });
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      AVAILABLE: "Disponibilă",
      IN_USE: "În utilizare",
      MAINTENANCE: "Întreținere",
      DAMAGED: "Deteriorată",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === "AVAILABLE") return "bg-green-100 text-green-800 border-green-200";
    if (status === "IN_USE") return "bg-blue-100 text-blue-800 border-blue-200";
    if (status === "MAINTENANCE") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (status === "DAMAGED") return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStockPercentage = (available: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((available / total) * 100);
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Componente Schele</h1>
          <p className="text-sm text-gray-600">
            Inventar și gestionarea componentelor reutilizabile
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Adaugă componentă
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-600">Se încarcă...</p>
            </div>
          ) : components.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-3xl">🔧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nu există componente înregistrate
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Adaugă prima componentă pentru a începe inventarul
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cod / Nume
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Stoc
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Proiect
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Locație
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {components.map((component) => {
                    const totalStock = typeof component.totalStock === 'number' ? component.totalStock : parseFloat(String(component.totalStock));
                    const availableStock = typeof component.availableStock === 'number' ? component.availableStock : parseFloat(String(component.availableStock));
                    const stockPercentage = getStockPercentage(availableStock, totalStock);
                    
                    return (
                      <tr
                        key={component.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {component.name}
                          </div>
                          {component.code && (
                            <div className="text-xs text-gray-500">Cod: {component.code}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {component.type || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">
                            {availableStock} / {totalStock}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${
                                stockPercentage >= 50
                                  ? "bg-green-500"
                                  : stockPercentage >= 25
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${stockPercentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {stockPercentage}% disponibil
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(component.status)}`}>
                            {getStatusLabel(component.status)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {component.currentProject?.name || "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {component.location || "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              onClick={() => handleOpenDialog(component)}
                            >
                              Editează
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                              onClick={() => handleDelete(component.id)}
                            >
                              Șterge
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Component Dialog */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingComponent ? "Editează componentă" : "Adaugă componentă nouă"}
            </DialogTitle>
            <DialogDescription>
              Completează informațiile despre componentă. Numele este obligatoriu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nume componentă <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Țeavă 2m"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Cod componentă
                </label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: TUB-2M"
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-gray-700">
                Tip componentă
              </label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Ex: Țeavă, Placă, Suport"
                disabled={submitting}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="totalStock" className="text-sm font-medium text-gray-700">
                  Stoc total <span className="text-red-500">*</span>
                </label>
                <Input
                  id="totalStock"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalStock}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      totalStock: value,
                      availableStock: Math.min(formData.availableStock, value),
                    });
                  }}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="availableStock" className="text-sm font-medium text-gray-700">
                  Stoc disponibil <span className="text-red-500">*</span>
                </label>
                <Input
                  id="availableStock"
                  type="number"
                  min="0"
                  max={formData.totalStock}
                  step="0.01"
                  value={formData.availableStock}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      availableStock: Math.min(value, formData.totalStock),
                    });
                  }}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Disponibilă</SelectItem>
                    <SelectItem value="IN_USE">În utilizare</SelectItem>
                    <SelectItem value="MAINTENANCE">Întreținere</SelectItem>
                    <SelectItem value="DAMAGED">Deteriorată</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="currentProjectId" className="text-sm font-medium text-gray-700">
                Proiect curent
              </label>
              <Select
                value={formData.currentProjectId}
                onValueChange={(value) => setFormData({ ...formData, currentProjectId: value })}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează proiect (opțional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Niciunul</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Locație
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Depozit central, București"
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
                placeholder="Informații suplimentare"
                rows={3}
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
                {submitting ? "Se salvează..." : editingComponent ? "Actualizează" : "Salvează componentă"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
