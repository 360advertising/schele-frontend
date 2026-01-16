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

interface Scaffold {
  id: string;
  number: string;
  status: string;
  currentProjectId?: string;
  location?: string;
  notes?: string;
  currentProject?: Project;
}

export default function ScaffoldsPage() {
  const [scaffolds, setScaffolds] = useState<Scaffold[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingScaffold, setEditingScaffold] = useState<Scaffold | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    status: "AVAILABLE",
    currentProjectId: "",
    location: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchScaffolds();
    fetchProjects();
  }, []);

  const fetchScaffolds = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Scaffold[]>("/scaffolds");
      setScaffolds(data);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut încărca schelele",
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

  const handleOpenDialog = (scaffold?: Scaffold) => {
    if (scaffold) {
      setEditingScaffold(scaffold);
      setFormData({
        number: scaffold.number || "",
        status: scaffold.status || "AVAILABLE",
        currentProjectId: scaffold.currentProjectId || "",
        location: scaffold.location || "",
        notes: scaffold.notes || "",
      });
    } else {
      setEditingScaffold(null);
      setFormData({
        number: "",
        status: "AVAILABLE",
        currentProjectId: "",
        location: "",
        notes: "",
      });
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingScaffold(null);
    setFormData({
      number: "",
      status: "AVAILABLE",
      currentProjectId: "",
      location: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number.trim()) {
      toast({
        title: "Eroare",
        description: "Numărul schelei este obligatoriu",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        currentProjectId: formData.currentProjectId || undefined,
      };
      if (editingScaffold) {
        await apiRequest(`/scaffolds/${editingScaffold.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Schela a fost actualizată cu succes",
        });
      } else {
        await apiRequest("/scaffolds", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Schela a fost adăugată cu succes",
        });
      }
      handleCloseDialog();
      fetchScaffolds();
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
    if (!confirm("Sigur dorești să ștergi această schelă?")) {
      return;
    }

    try {
      await apiRequest(`/scaffolds/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Succes",
        description: "Schela a fost ștearsă cu succes",
      });
      fetchScaffolds();
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
      MAINTENANCE: "Mentenanță",
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

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schele</h1>
          <p className="text-sm text-gray-600">
            Evidența și statusul schelelor
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Adaugă schelă
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-600">Se încarcă...</p>
            </div>
          ) : scaffolds.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-3xl">🏗️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nu există schele înregistrate
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Adaugă o schelă pentru a începe evidența
              </p>
            </div>
          ) : (
            // Table Structure
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Număr schelă
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Locație
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Proiect
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {scaffolds.map((scaffold) => (
                    <tr
                      key={scaffold.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {scaffold.number}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {scaffold.location || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(scaffold.status)}`}>
                          {getStatusLabel(scaffold.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {scaffold.currentProject?.name || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                            onClick={() => handleOpenDialog(scaffold)}
                          >
                            Editează
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                            onClick={() => handleDelete(scaffold.id)}
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

      {/* Add/Edit Scaffold Dialog */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingScaffold ? "Editează schelă" : "Adaugă schelă nouă"}
            </DialogTitle>
            <DialogDescription>
              Completează informațiile despre schelă. Numărul schelei este obligatoriu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="number" className="text-sm font-medium text-gray-700">
                Număr schelă <span className="text-red-500">*</span>
              </label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Ex: SCF-001"
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
                  <SelectItem value="MAINTENANCE">Mentenanță</SelectItem>
                  <SelectItem value="DAMAGED">Deteriorată</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="currentProjectId" className="text-sm font-medium text-gray-700">
                Proiect
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
                  <SelectItem value="">Niciunul</SelectItem>
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
                placeholder="Ex: București, Sector 1"
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
                {submitting ? "Se salvează..." : editingScaffold ? "Actualizează" : "Salvează schela"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
