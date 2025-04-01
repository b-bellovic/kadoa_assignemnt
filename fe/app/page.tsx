"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in via cookie
    const hasAuthCookie = document.cookie.includes("token=");
    
    // Redirect to appropriate page
    router.push(hasAuthCookie ? "/dashboard" : "/login");
  }, [router]);

  return <LoadingSpinner />;
}
