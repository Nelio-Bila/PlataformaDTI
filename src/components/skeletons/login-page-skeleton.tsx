import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Introductory Text Skeleton */}
      <div className="space-y-2 text-center">
        <Skeleton className="h-4 w-64 mx-auto" /> {/* Text "Insira suas credenciais para aceder o sistema" */}
      </div>

      {/* Form Skeleton (Mirroring SignInForm structure) */}
      <div className="space-y-6">
        {/* Email Field Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-16" /> {/* Label "Email" */}
          <Skeleton className="h-10 w-full" /> {/* Input Skeleton */}
          <Skeleton className="h-4 w-32" /> {/* Error/Message Skeleton */}
        </div>

        {/* Password Field Skeleton */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-16" /> {/* Label "Senha" */}
            <Skeleton className="h-10 w-full" /> {/* Password Input Skeleton */}
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" /> {/* Checkbox Skeleton */}
            <Skeleton className="h-4 w-32" /> {/* "Mostrar senha" Label Skeleton */}
          </div>
          <Skeleton className="h-4 w-32" /> {/* Error/Message Skeleton */}
        </div>

        {/* Error Message Skeleton (if any) */}
        <Skeleton className="h-4 w-full" />

        {/* Submit Button Skeleton */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24" /> {/* "Entrar" Button Skeleton */}
        </div>
      </div>
    </div>
  );
}