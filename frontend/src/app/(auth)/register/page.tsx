"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "OPERATOR" as "ADMIN" | "OPERATOR" | "ACCOUNTING" | "CLIENT",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast({
        title: "Cont creat cu succes",
        description: "Contul tău a fost creat. Te poți autentifica acum.",
      });

      // Redirect to login page
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Eroare la crearea contului",
        description: error.message || "A apărut o eroare la crearea contului",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[450px] px-4">
      <Card className="rounded-lg shadow-md">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <img
              src="https://www.schela.com/wp-content/uploads/2015/07/logo-schele.gif"
              alt="Schele Logo"
              className="max-w-[180px] h-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Creează cont</h1>
          <p className="text-sm text-gray-600">
            Completează formularul pentru a crea un cont nou
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nume complet
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Ion Popescu"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Parolă
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Minim 6 caractere"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-700">
                Rol
              </label>
              <Select
                value={formData.role}
                onValueChange={(value: "ADMIN" | "OPERATOR" | "ACCOUNTING" | "CLIENT") =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="OPERATOR">Operator</SelectItem>
                  <SelectItem value="ACCOUNTING">Contabil</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === "ADMIN" && "Acces complet la toate funcțiile sistemului"}
                {formData.role === "OPERATOR" && "Gestionare schele și rapoarte de lucru"}
                {formData.role === "ACCOUNTING" && "Gestionare facturi și date financiare"}
                {formData.role === "CLIENT" && "Acces doar la propriile date (citire)"}
              </p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-700">
              <strong>Notă:</strong> Primul utilizator creat va fi Administrator automat.
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Se creează contul..." : "Creează cont"}
            </Button>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Ai deja cont?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Autentifică-te
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
