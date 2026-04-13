"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  reason: z.string().min(10, "Please provide a reason for deletion (min 10 characters)"),
  confirm: z.boolean().refine((val) => val === true, {
    message: "You must confirm that you want to delete your account",
  }),
});

export function DeleteAccountForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      reason: "",
      confirm: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // In a real scenario, this would call your backend API
      // Since we're setting this up for compliance, we simulate a successful request
      console.log("Deletion Request:", values);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Your account deletion request has been received and will be processed within 48 hours.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again or contact support.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold">Request Received</h3>
        <p className="text-muted-foreground">
          Thank you. We have received your request to delete your account. 
          Our team will verify the details and complete the deletion process within 48 hours.
          You will receive a confirmation email once it&apos;s done.
        </p>
        <Button onClick={() => window.location.href = "/"} variant="outline" className="mt-4">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert variant="destructive" className="bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Deleting your account is permanent. All your profile data, photos, and matches will be permanently removed and cannot be recovered.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registered Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registered Email Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Deletion</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Please tell us why you want to delete your account..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I understand that this action is irreversible and all my data will be lost.
                </FormLabel>
                <FormDescription>
                  This will also cancel any active subscriptions.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" variant="destructive" disabled={isLoading}>
          {isLoading ? "Processing..." : "Submit Deletion Request"}
        </Button>
      </form>
    </Form>
  );
}
