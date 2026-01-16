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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

interface Client {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    taxId: "",
    address: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Client[]>("/clients");
      setClients(data);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut încărca clienții",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        taxId: client.taxId || "",
        address: client.address || "",
        notes: client.notes || "",
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        taxId: "",
        address: "",
        notes: "",
      });
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      taxId: "",
      address: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Eroare",
        description: "Numele clientului este obligatoriu",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingClient) {
        await apiRequest(`/clients/${editingClient.id}`, {
          method: "PATCH",
          body: JSON.stringify(formData),
        });
        toast({
          title: "Succes",
          description: "Clientul a fost actualizat cu succes",
        });
      } else {
        await apiRequest("/clients", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast({
          title: "Succes",
          description: "Clientul a fost adăugat cu succes",
        });
      }
      handleCloseDialog();
      fetchClients();
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
    if (!confirm("Sigur dorești să ștergi acest client?")) {
      return;
    }

    try {
      await apiRequest(`/clients/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Succes",
        description: "Clientul a fost șters cu succes",
      });
      fetchClients();
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clienți</h1>
          <p className="text-sm text-gray-600">
            Gestionarea clienților și a contractelor
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Adaugă client
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-600">Se încarcă...</p>
            </div>
          ) : clients.length === 0 ? (
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
                        {client.taxId || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {client.email || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                            onClick={() => handleOpenDialog(client)}
                          >
                            Editează
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                            onClick={() => handleDelete(client.id)}
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

      {/* Add/Edit Client Dialog */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Editează client" : "Adaugă client nou"}
            </DialogTitle>
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
                disabled={submitting}
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
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="taxId" className="text-sm font-medium text-gray-700">
                CUI / CIF
              </label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="RO12345678"
                disabled={submitting}
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
                placeholder="Informații suplimentare despre client"
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
                {submitting ? "Se salvează..." : editingClient ? "Actualizează" : "Salvează client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
