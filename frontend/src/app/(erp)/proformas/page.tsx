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

interface WorkReport {
  id: string;
  reportNumber?: string;
  reportDate: string;
  client?: Client;
  project?: { id: string; name: string };
}

interface ProformaInvoice {
  id: string;
  number: string;
  clientId: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  client?: Client;
  items?: Array<{ workReport: WorkReport }>;
}

export default function ProformasPage() {
  const [proformas, setProformas] = useState<ProformaInvoice[]>([]);
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    clientId: "",
    workReportIds: [] as string[],
    issueDate: "",
    dueDate: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProformas();
    fetchWorkReports();
    fetchClients();
  }, []);

  const fetchProformas = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<ProformaInvoice[]>("/proformas");
      setProformas(data);
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "Nu s-au putut încărca proformele",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkReports = async () => {
    try {
      const data = await apiRequest<WorkReport[]>("/work-reports");
      // Filtrează doar work reports care nu sunt deja facturate
      const unbilled = data.filter((wr: any) => wr.status !== "BILLED");
      setWorkReports(unbilled);
    } catch (error: any) {
      console.error("Failed to fetch work reports:", error);
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

  const handleOpenDialog = () => {
    setFormData({
      number: "",
      clientId: "",
      workReportIds: [],
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      notes: "",
    });
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setFormData({
      number: "",
      clientId: "",
      workReportIds: [],
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      notes: "",
    });
  };

  const handleWorkReportToggle = (workReportId: string) => {
    setFormData((prev) => {
      const ids = prev.workReportIds.includes(workReportId)
        ? prev.workReportIds.filter((id) => id !== workReportId)
        : [...prev.workReportIds, workReportId];
      return { ...prev, workReportIds: ids };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number.trim() || !formData.clientId || formData.workReportIds.length === 0) {
      toast({
        title: "Eroare",
        description: "Numărul proformei, clientul și cel puțin un proces verbal sunt obligatorii",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        issueDate: formData.issueDate || undefined,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
      };
      await apiRequest("/proformas", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({
        title: "Succes",
        description: "Proforma a fost generată cu succes",
      });
      handleCloseDialog();
      fetchProformas();
      fetchWorkReports(); // Refresh work reports to update status
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la generare",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur dorești să ștergi această proformă?")) {
      return;
    }

    try {
      await apiRequest(`/proformas/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Succes",
        description: "Proforma a fost ștearsă cu succes",
      });
      fetchProformas();
      fetchWorkReports(); // Refresh to show unbilled work reports
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la ștergere",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proforme</h1>
          <p className="text-sm text-gray-600">
            Facturi proforme generate din procese verbale
          </p>
        </div>
        <Button
          onClick={handleOpenDialog}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Generează proformă
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-600">Se încarcă...</p>
            </div>
          ) : proformas.length === 0 ? (
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
                      Dată emitere
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Procese verbale
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
                        {proforma.client?.name || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatDate(proforma.issueDate)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {proforma.items?.length || 0} proces(e) verbal(e)
                      </td>
                      <td className="py-4 px-6 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                            onClick={() => handleDelete(proforma.id)}
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

      {/* Generate Proforma Dialog */}
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generează proformă</DialogTitle>
            <DialogDescription>
              Selectează clientul și procesele verbale pentru proformă. Toate câmpurile marcate cu * sunt obligatorii.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="number" className="text-sm font-medium text-gray-700">
                Număr proformă <span className="text-red-500">*</span>
              </label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="Ex: PROF-2024-001"
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
              <label className="text-sm font-medium text-gray-700">
                Procese verbale <span className="text-red-500">*</span>
              </label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {workReports.length === 0 ? (
                  <p className="text-sm text-gray-500">Nu există procese verbale disponibile</p>
                ) : (
                  workReports.map((wr) => (
                    <label
                      key={wr.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.workReportIds.includes(wr.id)}
                        onChange={() => handleWorkReportToggle(wr.id)}
                        disabled={submitting}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {wr.reportNumber || `Proces verbal ${wr.id.slice(0, 8)}`} -{" "}
                        {formatDate(wr.reportDate)}
                        {wr.project && ` - ${wr.project.name}`}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="issueDate" className="text-sm font-medium text-gray-700">
                  Dată emitere
                </label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                  Dată scadență
                </label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  disabled={submitting}
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
                {submitting ? "Se generează..." : "Generează proformă"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
