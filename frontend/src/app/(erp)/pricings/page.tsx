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
  name: string;
  code?: string;
}

interface ProjectPricing {
  id: string;
  projectId: string;
  scaffoldComponentId: string;
  price: number;
  unitOfMeasure: string;
  validFrom: string;
  validTo?: string;
  notes?: string;
  project?: Project;
  scaffoldComponent?: ScaffoldComponent;
}

export default function PricingsPage() {
  const [pricings, setPricings] = useState<ProjectPricing[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [components, setComponents] = useState<ScaffoldComponent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<ProjectPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const [formData, setFormData] = useState({
    projectId: "",
    scaffoldComponentId: "",
    price: 0,
    unitOfMeasure: "PIECE",
    validFrom: new Date().toISOString().split("T")[0],
    validTo: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPricings();
    fetchProjects();
    fetchComponents();
  }, []);

  useEffect(() => {
    fetchPricings();
  }, [filterProjectId]);

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const params = filterProjectId !== "all" ? `?projectId=${filterProjectId}` : "";
      const data = await apiRequest<ProjectPricing[]>(`/project-pricings${params}`);
      setPricings(data);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut încărca prețurile",
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

  const handleOpenDialog = (pricing?: ProjectPricing) => {
    if (pricing) {
      setEditingPricing(pricing);
      setFormData({
        projectId: pricing.projectId,
        scaffoldComponentId: pricing.scaffoldComponentId,
        price: typeof pricing.price === 'number' ? pricing.price : parseFloat(pricing.price.toString()),
        unitOfMeasure: pricing.unitOfMeasure,
        validFrom: pricing.validFrom ? pricing.validFrom.split("T")[0] : new Date().toISOString().split("T")[0],
        validTo: pricing.validTo ? pricing.validTo.split("T")[0] : "",
        notes: pricing.notes || "",
      });
    } else {
      setEditingPricing(null);
      setFormData({
        projectId: filterProjectId !== "all" ? filterProjectId : "",
        scaffoldComponentId: "",
        price: 0,
        unitOfMeasure: "PIECE",
        validFrom: new Date().toISOString().split("T")[0],
        validTo: "",
        notes: "",
      });
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingPricing(null);
    setFormData({
      projectId: filterProjectId !== "all" ? filterProjectId : "",
      scaffoldComponentId: "",
      price: 0,
      unitOfMeasure: "PIECE",
      validFrom: new Date().toISOString().split("T")[0],
      validTo: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.scaffoldComponentId || formData.price <= 0) {
      toast({
        title: "Eroare",
        description: "Proiectul, componenta și prețul sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        validTo: formData.validTo || undefined,
        notes: formData.notes || undefined,
      };
      
      if (editingPricing) {
        await apiRequest(`/project-pricings/${editingPricing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Prețul a fost actualizat cu succes",
        });
      } else {
        await apiRequest("/project-pricings", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Prețul a fost creat cu succes",
        });
      }
      handleCloseDialog();
      fetchPricings();
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
    if (!confirm("Sigur dorești să ștergi acest preț?")) {
      return;
    }

    try {
      await apiRequest(`/project-pricings/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Succes",
        description: "Prețul a fost șters cu succes",
      });
      fetchPricings();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergere",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nelimitat";
    return new Date(dateString).toLocaleDateString("ro-RO");
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

  const filteredPricings = pricings.filter((p) => {
    if (filterProjectId === "all") return true;
    return p.projectId === filterProjectId;
  });

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tarifare Proiect</h1>
          <p className="text-sm text-gray-600">
            Gestionarea prețurilor pentru componente pe proiect
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Adaugă preț
        </Button>
      </div>

      {/* Filter */}
      <Card className="mb-6 shadow-sm border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label htmlFor="filterProject" className="text-sm font-medium text-gray-700">
              Filtrează după proiect:
            </label>
            <Select
              value={filterProjectId}
              onValueChange={setFilterProjectId}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Toate proiectele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate proiectele</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-600">Se încarcă...</p>
            </div>
          ) : filteredPricings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nu există prețuri definite
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Adaugă prețuri pentru componente pe proiecte
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Proiect
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Componentă
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Preț
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Unitate
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Valabil de la
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Valabil până
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPricings.map((pricing) => {
                    const price = typeof pricing.price === 'number' ? pricing.price : parseFloat(pricing.price.toString());
                    return (
                      <tr
                        key={pricing.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          {pricing.project?.name || "-"}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {pricing.scaffoldComponent?.name || "-"}
                          {pricing.scaffoldComponent?.code && (
                            <span className="text-xs text-gray-500 ml-1">({pricing.scaffoldComponent.code})</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">
                          {price.toFixed(2)} RON
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {getUnitLabel(pricing.unitOfMeasure)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(pricing.validFrom)}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {formatDate(pricing.validTo)}
                        </td>
                        <td className="py-4 px-6 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              onClick={() => handleOpenDialog(pricing)}
                            >
                              Editează
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                              onClick={() => handleDelete(pricing.id)}
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

      {/* Add/Edit Pricing Dialog */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPricing ? "Editează preț" : "Adaugă preț nou"}
            </DialogTitle>
            <DialogDescription>
              Definește prețul pentru o componentă într-un proiect. Toate câmpurile marcate cu * sunt obligatorii.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="projectId" className="text-sm font-medium text-gray-700">
                  Proiect <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează proiect" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="scaffoldComponentId" className="text-sm font-medium text-gray-700">
                  Componentă <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.scaffoldComponentId}
                  onValueChange={(value) => setFormData({ ...formData, scaffoldComponentId: value })}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Preț (RON) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="unitOfMeasure" className="text-sm font-medium text-gray-700">
                  Unitate măsură <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.unitOfMeasure}
                  onValueChange={(value) => setFormData({ ...formData, unitOfMeasure: value })}
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
                <label htmlFor="validFrom" className="text-sm font-medium text-gray-700">
                  Valabil de la <span className="text-red-500">*</span>
                </label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="validTo" className="text-sm font-medium text-gray-700">
                  Valabil până
                </label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  disabled={submitting}
                />
                <p className="text-xs text-gray-500">Lăsați gol pentru preț nelimitat</p>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Observații
              </label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observații despre preț"
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
                {submitting ? "Se salvează..." : editingPricing ? "Actualizează" : "Salvează preț"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
