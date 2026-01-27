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
import { Download } from "lucide-react";

interface Client {
  id: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Contract {
  id: string;
  number: string;
  clientId: string;
  startDate: string;
  endDate?: string;
  contractDate: string;
  location?: string;
  description?: string;
  terms?: string;
  supplierName?: string;
  supplierTaxId?: string;
  supplierAddress?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  supplierBankAccount?: string;
  supplierBankName?: string;
  notes?: string;
  client?: Client;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    clientId: "none",
    startDate: "",
    endDate: "",
    contractDate: new Date().toISOString().split("T")[0],
    location: "",
    description: "",
    terms: "",
    supplierName: "A.D. SCHELE",
    supplierTaxId: "",
    supplierAddress: "",
    supplierPhone: "",
    supplierEmail: "",
    supplierBankAccount: "",
    supplierBankName: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContracts();
    fetchClients();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Contract[]>("/contracts");
      setContracts(data);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut încărca contractele",
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

  const handleClientChange = (clientId: string) => {
    if (clientId === "none") {
      setFormData({ ...formData, clientId: "none" });
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    if (selectedClient) {
      setFormData({ ...formData, clientId });
      // Auto-completează datele clientului (pentru vizualizare, nu se trimit la backend)
      // Datele clientului se preiau automat din backend când se salvează contractul
    }
  };

  const handleOpenDialog = (contract?: Contract) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        number: contract.number || "",
        clientId: contract.clientId || "none",
        startDate: contract.startDate ? contract.startDate.split("T")[0] : "",
        endDate: contract.endDate ? contract.endDate.split("T")[0] : "",
        contractDate: contract.contractDate ? contract.contractDate.split("T")[0] : new Date().toISOString().split("T")[0],
        location: contract.location || "",
        description: contract.description || "",
        terms: contract.terms || "",
        supplierName: contract.supplierName || "A.D. SCHELE",
        supplierTaxId: contract.supplierTaxId || "",
        supplierAddress: contract.supplierAddress || "",
        supplierPhone: contract.supplierPhone || "",
        supplierEmail: contract.supplierEmail || "",
        supplierBankAccount: contract.supplierBankAccount || "",
        supplierBankName: contract.supplierBankName || "",
        notes: contract.notes || "",
      });
    } else {
      setEditingContract(null);
      setFormData({
        number: "",
        clientId: "none",
        startDate: "",
        endDate: "",
        contractDate: new Date().toISOString().split("T")[0],
        location: "",
        description: "",
        terms: "",
        supplierName: "A.D. SCHELE",
        supplierTaxId: "",
        supplierAddress: "",
        supplierPhone: "",
        supplierEmail: "",
        supplierBankAccount: "",
        supplierBankName: "",
        notes: "",
      });
    }
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setEditingContract(null);
    setFormData({
      number: "",
      clientId: "none",
      startDate: "",
      endDate: "",
      contractDate: new Date().toISOString().split("T")[0],
      location: "",
      description: "",
      terms: "",
      supplierName: "A.D. SCHELE",
      supplierTaxId: "",
      supplierAddress: "",
      supplierPhone: "",
      supplierEmail: "",
      supplierBankAccount: "",
      supplierBankName: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number.trim()) {
      toast({
        title: "Eroare",
        description: "Numărul contractului este obligatoriu",
        variant: "destructive",
      });
      return;
    }
    if (formData.clientId === "none") {
      toast({
        title: "Eroare",
        description: "Selectați un client",
        variant: "destructive",
      });
      return;
    }
    if (!formData.startDate) {
      toast({
        title: "Eroare",
        description: "Data începerii este obligatorie",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        clientId: formData.clientId === "none" ? undefined : formData.clientId,
      };
      
      if (editingContract) {
        await apiRequest(`/contracts/${editingContract.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Contractul a fost actualizat cu succes",
        });
      } else {
        await apiRequest("/contracts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({
          title: "Succes",
          description: "Contractul a fost creat cu succes",
        });
      }
      handleCloseDialog();
      fetchContracts();
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
    if (!confirm("Sigur dorești să ștergi acest contract?")) {
      return;
    }

    try {
      await apiRequest(`/contracts/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Succes",
        description: "Contractul a fost șters cu succes",
      });
      fetchContracts();
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergere",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPdf = async (contractId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/pdf`, {
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
      a.download = `Contract_${contracts.find((c) => c.id === contractId)?.number || contractId}.pdf`;
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ro-RO");
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contracte</h1>
          <p className="text-sm text-gray-600">
            Gestionarea contractelor de închiriere schele
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Adaugă contract
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-600">Se încarcă...</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nu există contracte înregistrate
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Adaugă primul contract pentru a începe
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Număr contract
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Data contractului
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Perioada
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {contracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {contract.number}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {contract.client?.name || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatDate(contract.contractDate)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate) || "Nedeterminată"}
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                            onClick={() => handleDownloadPdf(contract.id)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                            onClick={() => handleOpenDialog(contract)}
                          >
                            Editează
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                            onClick={() => handleDelete(contract.id)}
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

      {/* Add/Edit Contract Dialog */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContract ? "Editează contract" : "Adaugă contract nou"}
            </DialogTitle>
            <DialogDescription>
              Completează informațiile despre contract. Câmpurile marcate cu * sunt obligatorii.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="number" className="text-sm font-medium text-gray-700">
                  Număr contract <span className="text-red-500">*</span>
                </label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ex: CT-2024-001"
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
                  onValueChange={handleClientChange}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selectează client...</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.clientId !== "none" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Date client selectat:</h4>
                {(() => {
                  const selectedClient = clients.find((c) => c.id === formData.clientId);
                  return selectedClient ? (
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Nume:</strong> {selectedClient.name}</p>
                      {selectedClient.taxId && <p><strong>CUI/CIF:</strong> {selectedClient.taxId}</p>}
                      {selectedClient.address && <p><strong>Adresă:</strong> {selectedClient.address}</p>}
                      {selectedClient.phone && <p><strong>Telefon:</strong> {selectedClient.phone}</p>}
                      {selectedClient.email && <p><strong>Email:</strong> {selectedClient.email}</p>}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="contractDate" className="text-sm font-medium text-gray-700">
                  Data contractului
                </label>
                <Input
                  id="contractDate"
                  type="date"
                  value={formData.contractDate}
                  onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                  Data începerii <span className="text-red-500">*</span>
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                  Data încheierii
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Locația lucrărilor
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: București, Sector 1, Strada Exemplu"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Descrierea lucrărilor
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrierea lucrărilor de închiriere schele"
                rows={3}
                disabled={submitting}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Date furnizor (proprietar)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="supplierName" className="text-sm font-medium text-gray-700">
                    Nume furnizor
                  </label>
                  <Input
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="supplierTaxId" className="text-sm font-medium text-gray-700">
                    CUI/CIF furnizor
                  </label>
                  <Input
                    id="supplierTaxId"
                    value={formData.supplierTaxId}
                    onChange={(e) => setFormData({ ...formData, supplierTaxId: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="supplierAddress" className="text-sm font-medium text-gray-700">
                    Adresă furnizor
                  </label>
                  <Input
                    id="supplierAddress"
                    value={formData.supplierAddress}
                    onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="supplierPhone" className="text-sm font-medium text-gray-700">
                    Telefon furnizor
                  </label>
                  <Input
                    id="supplierPhone"
                    value={formData.supplierPhone}
                    onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="supplierEmail" className="text-sm font-medium text-gray-700">
                    Email furnizor
                  </label>
                  <Input
                    id="supplierEmail"
                    type="email"
                    value={formData.supplierEmail}
                    onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="supplierBankAccount" className="text-sm font-medium text-gray-700">
                    Cont bancar
                  </label>
                  <Input
                    id="supplierBankAccount"
                    value={formData.supplierBankAccount}
                    onChange={(e) => setFormData({ ...formData, supplierBankAccount: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="supplierBankName" className="text-sm font-medium text-gray-700">
                    Nume bancă
                  </label>
                  <Input
                    id="supplierBankName"
                    value={formData.supplierBankName}
                    onChange={(e) => setFormData({ ...formData, supplierBankName: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="terms" className="text-sm font-medium text-gray-700">
                Termeni și condiții
              </label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Termeni și condiții ale contractului (opțional - se vor folosi termeni default dacă este gol)"
                rows={5}
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
                placeholder="Observații suplimentare"
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
                {submitting ? "Se salvează..." : editingContract ? "Actualizează" : "Salvează contract"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
