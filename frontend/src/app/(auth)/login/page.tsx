"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

// DEMO MODE – Login page redirects directly to dashboard
export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // DEMO MODE – Instant redirect to dashboard, no backend call
    router.push('/dashboard');
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
            {/* DEMO MODE – No form fields, just redirect button */}
            <Button
              type="submit"
              className="w-full mt-6"
            >
              Autentificare
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
