"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSeller from "../hooks/useSeller";
import { Loader2 } from "lucide-react";

export default function Index() {
  const router = useRouter();
  const { seller, isLoading } = useSeller();

  useEffect(() => {
    if (!isLoading) {
      if (seller) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [seller, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 font-medium">Redirecting...</p>
    </div>
  );
}
