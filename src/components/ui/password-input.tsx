// 'use client'

// import { EyeIcon, EyeOffIcon } from 'lucide-react'
// import * as React from 'react'

// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { cn } from '@/lib/utils'

// const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => {
// 	const [showPassword, setShowPassword] = React.useState(false)
// 	const disabled = props.value === '' || props.value === undefined || props.disabled

// 	return (
// 		<div className="relative">
// 			<Input
// 				type={showPassword ? 'text' : 'password'}
// 				className={cn('hide-password-toggle pr-10', className)}
// 				ref={ref}
// 				{...props}
// 			/>
// 			<Button
// 				type="button"
// 				variant="ghost"
// 				size="sm"
// 				className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
// 				onClick={() => setShowPassword((prev) => !prev)}
// 				disabled={disabled}
// 			>
// 				{showPassword && !disabled ? (
// 					<EyeIcon className="h-4 w-4" aria-hidden="true" />
// 				) : (
// 					<EyeOffIcon className="h-4 w-4" aria-hidden="true" />
// 				)}
// 				<span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
// 			</Button>

// 			{/* hides browsers password toggles */}
// 			<style>{`
// 					.hide-password-toggle::-ms-reveal,
// 					.hide-password-toggle::-ms-clear {
// 						visibility: hidden;
// 						pointer-events: none;
// 						display: none;
// 					}
// 				`}</style>
// 		</div>
// 	)
// })
// PasswordInput.displayName = 'PasswordInput'

// export { PasswordInput }

"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { showPassword?: boolean }>(
  ({ className, showPassword = false, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        {/* Optional: Keep eye icon for visual feedback, but disable interaction since checkbox controls visibility */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent opacity-50 cursor-default"
          disabled
        >
          {showPassword ? (
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? "Password visible" : "Password hidden"}</span>
        </Button>

        {/* Hides browser password toggles (works for modern browsers, including Edge and Chrome) */}
        <style>
          {`
            .pr-10::-ms-reveal,
            .pr-10::-ms-clear {
              visibility: hidden;
              pointer-events: none;
              display: none;
            }
            .pr-10::-webkit-password-toggle {
              display: none;
            }
          `}
        </style>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
