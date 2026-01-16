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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// DEMO MODE – Mock data for client demo
const projects: Array<{
  id: string;
  name: string;
  client: string;
  location: string;
  period: string;
  status: string;
}> = [
  {
    id: "1",
    name: "Bloc rezidential - Sector 1",
    client: "Constructii ABC SRL",
    location: "București, Sector 1",
    period: "01.03.2024 - 30.06.2024",
    status: "Activ",
  },
  {
    id: "2",
    name: "Centru comercial - Pipera",
    client: "Proiecte XYZ SA",
    location: "București, Pipera",
    period: "15.04.2024 - 15.08.2024",
    status: "Activ",
  },
  {
    id: "3",
    name: "Renovare hotel - centru",
    client: "Dezvoltare Imobiliara SRL",
    location: "București, Centru",
    period: "01.05.2024 - 31.07.2024",
    status: "Planificat",
  },
];

const mockClients = [
  "Constructii ABC SRL",
  "Proiecte XYZ SA",
  "Dezvoltare Imobiliara SRL",
];

export default function ProjectsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    location: "",
    startDate: "",
    endDate: "",
    status: "",
  });
  const { toast } = useToast();
  const hasProjects = projects.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.client) {
      toast({
        title: "Eroare",
        description: "Numele proiectului și clientul sunt obligatorii",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Demo Mode",
      description: "Datele nu sunt salvate. Aceasta este o demonstrație.",
    });
    setIsOpen(false);
    setFormData({
      name: "",
      client: "",
      location: "",
      startDate: "",
      endDate: "",
      status: "",
    });
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
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Adaugă proiect
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {!hasProjects ? (
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
                      Perioadă
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
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {project.client}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {project.location}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {project.period}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          project.status === "Activ"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                          >
                            Editează
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
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

      {/* Add Project Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adaugă proiect nou</DialogTitle>
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
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="client" className="text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <Select value={formData.client} onValueChange={(value) => setFormData({ ...formData, client: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
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
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                  Data început
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                  Data sfârșit
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planificat">Planificat</SelectItem>
                  <SelectItem value="În lucru">În lucru</SelectItem>
                  <SelectItem value="Finalizat">Finalizat</SelectItem>
                </SelectContent>
              </Select>
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
                Salvează proiect
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
