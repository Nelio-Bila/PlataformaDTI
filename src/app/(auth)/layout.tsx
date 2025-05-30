// // src/app/(auth)/layout.tsx
import AuthHeader from "@/components/layout/auth-header";
import GuestFooter from "@/components/layout/guest-footer";


export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AuthHeader />
      {children}
      <GuestFooter />
    </>
  );
}


