import AuthHeader from "@/components/layout/auth-header";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AuthHeader />
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <Link
            href={"/"}
            className="flex justify-center content-center text-center"
          >
            <Image
              src={Logo}
              width={100}
              height={100}
              alt="Logotipo do HCM"
            />
          </Link>
          <p className="text-3xl font-bold tracking-tight text-center">
            {process.env.APP_NAME}
          </p>
          {children}
        </div>
      </div>
    </>
  );
}
