import { SignInForm } from "@/components/forms/sign-in-form";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Iniciar sessão",
    description: "Inicio de sessão no sistema",
  };
}

export default function LoginPage() {
  return (
    <>
      <div className="space-y-2 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Insira suas credenciais para aceder o sistema
        </p>
      </div>
      <SignInForm />
    </>
  );
}
