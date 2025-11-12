// app/deactivated/page.tsx

"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function DeactivatedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <Lock className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Account Deactivated
        </h1>
        <p className="text-gray-600 mb-6">
          Your account has been deactivated by the administrator.  
          You won’t be able to access your dashboard or system features until it’s reactivated.
        </p>
        <Button
          onClick={() => router.push("/sign-in")}
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          Return to Sign In
        </Button>
      </div>
    </div>
  );
}
