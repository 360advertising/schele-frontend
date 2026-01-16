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
  code?: string;
  location?: string;
  description?: string;
  client: Client;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    code: "",
    location: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Project[]>("/projects");
      setProjects(data);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut încărca proiectele",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await apiRequest<Client[]>("/clients");
      setClients(data);
    } catch (error: any) {
      console.error("Failed to fetch clients:", error);
    }
  };

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name || "",
        clientId: project.clientId || "",
        code: project.code || "",
        location: project.location || "",
        description: project.description || "",
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        clientId: "",
        code: "",
        location: "",
        description: "",
      });
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingProject(null);
    setFormData({
      name: "",
      clientId: "",
      code: "",
      location: "",
      description: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.clientId) {
      toast({
        title: "Eroare",
        description: "Numele proiectului și clientul sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingProject) {
        await apiRequest(`/projects/${editingProject.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
        toast({
          title: "Succes",
          description: "Proiectul a fost actualizat cu succes",
        });
      } else {
        await apiRequest("/projects", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast({
          title: "Succes",
          description: "Proiectul a fost adăugat cu succes",
        });
      }
      handleCloseDialog();
      fetchProjects();
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
    if (!confirm("Sigur dorești să ștergi acest proiect?")) {
      return;
    }

    try {
      await apiRequest(`/projects/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Succes",
        description: "Proiectul a fost șters cu succes",
      });
      fetchProjects();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergere",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proiecte</h1>
          <p className="text-sm text-gray-600">
            Proiecte active și finalizate
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Adaugă proiect
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-600">Se încarcă...</p>
            </div>
          ) : projects.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-3xl">📁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nu există proiecte
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Adaugă un proiect asociat unui client
              </p>
            </div>
          ) : (
            // Table Structure
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Proiect
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Locație
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cod
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {project.client?.name || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {project.location || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {project.code || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                            onClick={() => handleOpenDialog(project)}
                          >
                            Editează
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                            onClick={() => handleDelete(project.id)}
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

      {/* Add/Edit Project Dialog */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Editează proiect" : "Adaugă proiect nou"}
            </DialogTitle>
            <DialogDescription>
              Completează informațiile despre proiect. Toate câmpurile marcate cu * sunt obligatorii.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nume proiect <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Bloc rezidential - Sector 1"
                required
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="clientId" className="text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
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
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                Cod proiect
              </label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Cod unic al proiectului"
                disabled={submitting}
              />
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
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descriere
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descriere proiect"
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
                {submitting ? "Se salvează..." : editingProject ? "Actualizează" : "Salvează proiect"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
