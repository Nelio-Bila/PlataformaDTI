"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { create_user } from "@/actions/auth-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const sign_up_schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  name: z.string().min(1, { message: "Name is required" }).optional(),
});

type SignUpFormData = z.infer<typeof sign_up_schema>;

export function SignUpForm() {
  const [is_pending, start_transition] = useTransition();
  const router = useRouter();
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(sign_up_schema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const on_submit = (values: SignUpFormData) => {
    start_transition(async () => {
      const result = await create_user(values);
      if (result.success) {
        router.push("/auth/sign-in");
      } else {
        form.setError("root", { message: result.error });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(on_submit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-red-500 text-sm">{form.formState.errors.root.message}</p>
        )}
        <Button type="submit" className="w-full" disabled={is_pending}>
          {is_pending ? "Signing up..." : "Sign Up"}
        </Button>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/auth/sign-in" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </Form>
  );
}