"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Autentificare reușită",
        description: "Ai fost autentificat cu succes.",
      });
    } catch (error: any) {
      toast({
        title: "Eroare la autentificare",
        description: error.message || "Email sau parolă incorectă",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] px-4">
      <Card className="rounded-lg shadow-md">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <img
              src="https://www.schela.com/wp-content/uploads/2015/07/logo-schele.gif"
              alt="Schele Logo"
              className="max-w-[180px] h-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Autentificare</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Se autentifică..." : "Autentificare"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
