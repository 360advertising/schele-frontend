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
const scaffolds: Array<{
  id: string;
  code: string;
  type: string;
  location: string;
  status: string;
  project: string;
}> = [
  {
    id: "1",
    code: "SCF-001",
    type: "Standard 2m",
    location: "București, Sector 1",
    status: "În utilizare",
    project: "Bloc rezidential - Sector 1",
  },
  {
    id: "2",
    code: "SCF-002",
    type: "Standard 2m",
    location: "București, Pipera",
    status: "În utilizare",
    project: "Centru comercial - Pipera",
  },
  {
    id: "3",
    code: "SCF-003",
    type: "Standard 1.5m",
    location: "Depozit",
    status: "Disponibilă",
    project: "-",
  },
  {
    id: "4",
    code: "SCF-004",
    type: "Standard 2m",
    location: "Service",
    status: "Mentenanță",
    project: "-",
  },
];

const mockProjects = [
  "Bloc rezidential - Sector 1",
  "Centru comercial - Pipera",
  "Renovare hotel - centru",
];

export default function ScaffoldsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    project: "",
    height: "",
    area: "",
    notes: "",
  });
  const { toast } = useToast();
  const hasScaffolds = scaffolds.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demo Mode",
      description: "Datele nu sunt salvate. Aceasta este o demonstrație.",
    });
    setIsOpen(false);
    setFormData({
      name: "",
      type: "",
      project: "",
      height: "",
      area: "",
      notes: "",
    });
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
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Adaugă schelă
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {!hasScaffolds ? (
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
                      Cod schelă
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tip
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
                        {scaffold.code}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {scaffold.type}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {scaffold.location}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            scaffold.status === "Disponibilă"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : scaffold.status === "În utilizare"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : scaffold.status === "Mentenanță"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {scaffold.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {scaffold.project || "-"}
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

      {/* Add Scaffold Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adaugă schelă nouă</DialogTitle>
            <DialogDescription>
              Completează informațiile despre schelă.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Denumire schelă
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: SCF-001"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-gray-700">
                Tip schelă
              </label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fațadă">Fațadă</SelectItem>
                  <SelectItem value="Mobilă">Mobilă</SelectItem>
                  <SelectItem value="Industrială">Industrială</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="height" className="text-sm font-medium text-gray-700">
                  Înălțime (m)
                </label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="Ex: 2.0"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="area" className="text-sm font-medium text-gray-700">
                  Suprafață (m²)
                </label>
                <Input
                  id="area"
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Ex: 50"
                />
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
                placeholder="Informații suplimentare"
                rows={3}
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
                Salvează schela
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
