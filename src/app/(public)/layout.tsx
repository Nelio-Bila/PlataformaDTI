// // src/app/(public)/layout.tsx
import AuthHeader from "@/components/layout/auth-header";
import GuestFooter from "@/components/layout/guest-footer";


export default function PublicLayout({
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


