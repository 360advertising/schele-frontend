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
import { useToast } from "@/hooks/use-toast";

// DEMO MODE – Mock data for client demo
const clients: Array<{
  id: string;
  name: string;
  cui: string;
  email: string;
  status: string;
}> = [
  {
    id: "1",
    name: "Constructii ABC SRL",
    cui: "RO12345678",
    email: "contact@abc-constructii.ro",
    status: "Activ",
  },
  {
    id: "2",
    name: "Proiecte XYZ SA",
    cui: "RO87654321",
    email: "office@xyz-proiecte.ro",
    status: "Activ",
  },
  {
    id: "3",
    name: "Dezvoltare Imobiliara SRL",
    cui: "RO11223344",
    email: "info@dezvoltare-imob.ro",
    status: "Activ",
  },
];

export default function ClientsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cui: "",
    address: "",
    notes: "",
  });
  const { toast } = useToast();
  const hasClients = clients.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Eroare",
        description: "Numele clientului este obligatoriu",
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
      email: "",
      phone: "",
      cui: "",
      address: "",
      notes: "",
    });
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clienți</h1>
          <p className="text-sm text-gray-600">
            Gestionarea clienților și a contractelor
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Adaugă client
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {!hasClients ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nu există clienți înregistrați
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Adaugă primul client pentru a începe
              </p>
            </div>
          ) : (
            // Table Structure
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Nume client
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      CUI
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
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
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {client.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {client.cui}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {client.email}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          {client.status}
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

      {/* Add Client Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adaugă client nou</DialogTitle>
            <DialogDescription>
              Completează informațiile despre client. Toate câmpurile marcate cu * sunt obligatorii.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nume client <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Constructii ABC SRL"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@exemplu.ro"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Telefon
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+40 123 456 789"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="cui" className="text-sm font-medium text-gray-700">
                CUI / CIF
              </label>
              <Input
                id="cui"
                value={formData.cui}
                onChange={(e) => setFormData({ ...formData, cui: e.target.value })}
                placeholder="RO12345678"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium text-gray-700">
                Adresă
              </label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Strada, număr, oraș, județ"
                rows={3}
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
                placeholder="Informații suplimentare despre client"
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
                Salvează client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
