"use client";

import { useState } from "react";
import { AdminPageWrapper } from "@/app/admin/admin-page-wrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Upload, AlertCircle, CheckCircle, FileSpreadsheet } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";

export default function BulkUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ success: number; failed: number; errors: { row: number; email: string; error: string }[] } | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null); // Reset result on new file
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setIsUploading(true);
            const data = await adminService.bulkUploadUsers(file);
            setResult(data);
            if (data.success > 0) {
                toast({
                    title: "Success",
                    description: `Successfully processed ${data.success} records`,
                    variant: "default",
                });
            }
            if (data.failed > 0) {
                toast({
                    title: "Warning",
                    description: `${data.failed} records failed to process`,
                    variant: "destructive",
                });
            }
        } catch (error: unknown) {
            console.error(error);
            const err = error as { message?: string };
            toast({
                title: "Error",
                description: err.message || "Failed to upload file",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AdminPageWrapper
            title="Bulk User Upload"
            subtitle="Import users from Excel sheet"
        >
            <div className="grid gap-6 md:grid-cols-2">
                {/* Upload Section */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Excel File</CardTitle>
                            <CardDescription>
                                Select an .xlsx file containing user data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className="w-full"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Users
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    {result && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Results</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-medium">{result.success} Successful</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                                        <AlertCircle className="h-5 w-5" />
                                        <span className="font-medium">{result.failed} Failed</span>
                                    </div>
                                </div>

                                {result.errors.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">Error Details:</h4>
                                        <div className="max-h-60 overflow-y-auto space-y-2 text-sm border p-2 rounded">
                                            {result.errors.map((err, idx) => (
                                                <div key={idx} className="p-2 bg-slate-50 border-b last:border-0">
                                                    <span className="font-mono text-xs text-slate-500 mr-2">Row {err.row}</span>
                                                    <span className="font-medium text-slate-700">{err.email}</span>
                                                    <p className="text-red-500 mt-1">{err.error}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Instructions Section */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                Required Columns
                            </CardTitle>
                            <CardDescription>
                                Your Excel sheet must contain these headers exactly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Important</AlertTitle>
                                    <AlertDescription>
                                        Required fields: firstName, lastName, email, gender, dateOfBirth.
                                        Dates should be in YYYY-MM-DD or valid Excel date format.
                                    </AlertDescription>
                                </Alert>

                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="p-2 text-left font-medium">Column Name</th>
                                                <th className="p-2 text-left font-medium">Format / Example</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            <tr>
                                                <td className="p-2 font-mono text-blue-600">firstName</td>
                                                <td className="p-2">Text</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono text-blue-600">lastName</td>
                                                <td className="p-2">Text</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono text-blue-600">email</td>
                                                <td className="p-2">Unique Email Address</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono text-blue-600">gender</td>
                                                <td className="p-2">MALE, FEMALE, OTHER</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono text-blue-600">dateOfBirth</td>
                                                <td className="p-2">YYYY-MM-DD</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono">maritalStatus</td>
                                                <td className="p-2 text-xs">NEVER_MARRIED, DIVORCED, WIDOWED...</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono">religion</td>
                                                <td className="p-2 text-xs">HINDU, MUSLIM, CHRISTIAN...</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono">motherTongue</td>
                                                <td className="p-2">HINDI, CHHATTISGARHI...</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono">phone</td>
                                                <td className="p-2">Optional (Unique)</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono">caste</td>
                                                <td className="p-2">Optional</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 font-mono">country / state / city</td>
                                                <td className="p-2">Defaults to India/CG/Raipur</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminPageWrapper>
    );
}
