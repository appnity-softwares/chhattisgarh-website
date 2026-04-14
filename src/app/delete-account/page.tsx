import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DeleteAccountForm } from "@/components/account/delete-account-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Delete Account | Chhattisgarh Shaadi",
  description: "Request to delete your Chhattisgarh Shadi account and associated data.",
};

export default function DeleteAccountPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-destructive/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
              Delete Account Request
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We&apos;re sorry to see you go. If you wish to delete your account and all associated data, 
              please fill out the form below.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-destructive/20 shadow-lg">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-destructive/10">
                      <ShieldAlert className="h-8 w-8 text-destructive" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">Data Deletion Request</CardTitle>
                  <CardDescription>
                    In compliance with Google Play Data Safety policies, we provide this 
                    simple way to request permanent deletion of your account data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DeleteAccountForm />
                </CardContent>
              </Card>

              {/* FAQs or Additional Info */}
              <div className="mt-12 space-y-6">
                <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">What data will be deleted?</h3>
                    <p className="text-sm text-muted-foreground">
                      All your personal information, including name, contact details, profile photos, 
                      partner preferences, and chat history, will be permanently purged from our servers.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">How long does it take?</h3>
                    <p className="text-sm text-muted-foreground">
                      Once submitted, our team verifies the request and completes the deletion within 48 hours. 
                      You will no longer be able to log in once the process is complete.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">Can I recover my account later?</h3>
                    <p className="text-sm text-muted-foreground">
                      No. Account deletion is permanent. If you wish to use the service again, 
                      you will need to create a completely new profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
