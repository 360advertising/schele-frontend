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
const proformas: Array<{
  id: string;
  number: string;
  client: string;
  date: string;
  value: string;
  status: string;
}> = [
  {
    id: "1",
    number: "PROF-2024-001",
    client: "Proiecte XYZ SA",
    date: "25.04.2024",
    value: "45.000 RON",
    status: "Trimisa",
  },
  {
    id: "2",
    number: "PROF-2024-002",
    client: "Constructii ABC SRL",
    date: "10.05.2024",
    value: "28.500 RON",
    status: "Draft",
  },
];

const mockClients = [
  "Constructii ABC SRL",
  "Proiecte XYZ SA",
  "Dezvoltare Imobiliara SRL",
];

const mockProjects = [
  "Bloc rezidential - Sector 1",
  "Centru comercial - Pipera",
  "Renovare hotel - centru",
];

export default function ProformasPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    client: "",
    project: "",
    number: "",
    date: "",
    totalValue: "",
    vat: "",
    notes: "",
  });
  const { toast } = useToast();
  const hasProformas = proformas.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demo Mode",
      description: "Datele nu sunt salvate. Aceasta este o demonstrație.",
    });
    setIsOpen(false);
    setFormData({
      client: "",
      project: "",
      number: "",
      date: "",
      totalValue: "",
      vat: "",
      notes: "",
    });
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proforme</h1>
          <p className="text-sm text-gray-600">
            Facturi proforme generate din procese verbale
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Generează proformă
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {!hasProformas ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-3xl">🧾</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nu există proforme generate
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Selectează procese verbale pentru a genera o proformă
              </p>
            </div>
          ) : (
            // Table Structure
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nr. proformă
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Dată
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Valoare
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
                  {proformas.map((proforma) => (
                    <tr
                      key={proforma.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {proforma.number}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {proforma.client}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {proforma.date}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">
                        {proforma.value}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            proforma.status === "Plătită"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : proforma.status === "Trimisa"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : proforma.status === "Draft"
                              ? "bg-gray-100 text-gray-800 border-gray-200"
                              : proforma.status === "Anulată"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {proforma.status}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                          >
                            Descarcă PDF
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

      {/* Add Proforma Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generează proformă</DialogTitle>
            <DialogDescription>
              Completează informațiile pentru proformă.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="client" className="text-sm font-medium text-gray-700">
                Client
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
                <label htmlFor="number" className="text-sm font-medium text-gray-700">
                  Număr proformă
                </label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ex: PROF-2024-001"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Dată emitere
                </label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="totalValue" className="text-sm font-medium text-gray-700">
                  Valoare totală (RON)
                </label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="vat" className="text-sm font-medium text-gray-700">
                  TVA (%)
                </label>
                <Input
                  id="vat"
                  type="number"
                  step="0.01"
                  value={formData.vat}
                  onChange={(e) => setFormData({ ...formData, vat: e.target.value })}
                  placeholder="19"
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
                Generează proformă
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
