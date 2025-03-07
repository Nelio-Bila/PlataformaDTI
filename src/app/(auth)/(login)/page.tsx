// src/app/(auth)/(login)/page.tsx

import { RequestOptionsForm } from "@/components/forms/request-options-form";
import { SignInForm } from "@/components/forms/sign-in-form";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../../public/logo.png";

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Iniciar sessão",
    description: "Inicio de sessão no sistema",
  };
}

export default function LoginPage() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col w-full max-w-6xl mx-auto p-4 overflow-y-auto h-screen lg:flex-row lg:h-auto gap-3">
        {/* LOGIN HALF */}
        <div className="md:px-20 px-5 w-full lg:w-1/2 flex flex-col justify-center">
          <Link href={"/"} className="flex justify-center content-center text-center">
            <Image src={Logo} width={100} height={100} alt="Logotipo do HCM" />
          </Link>
          <p className="text-3xl font-bold tracking-tight text-center">
            Departamento de Tecnologias de Informação {process.env.APP_NAME}
          </p>
          <div className="space-y-2 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Insira suas credenciais para aceder o dashboard sistema
            </p>
          </div>
          <SignInForm />
        </div>
        {/* REQUEST HALF */}
        <div className="md:px-15 px-5 bg-muted rounded-lg w-full lg:w-1/2 flex flex-col justify-center">
          <RequestOptionsForm />
        </div>
      </div>
    </div>
  );
}