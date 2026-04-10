"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import apiService from "@/lib/api.service";
import apiConfig from "@/lib/api.config";
import { useToast } from "@/hooks/use-toast";

export interface Plan {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    isActive: boolean;
    type: 'SUBSCRIPTION' | 'BOOST';
}

export function useMembership() {
    const { toast } = useToast();
    
    const { data: plans, isLoading: plansLoading } = useQuery({
        queryKey: ["membership-plans"],
        queryFn: async () => {
            const res = await apiService.get('/web/payment/plans');
            return res.data.data as Plan[];
        }
    });

    const initiatePayment = useMutation({
        mutationFn: async (planId: number) => {
            const res = await apiService.post('/web/payment/initiate-session', { planId });
            return res.data.data;
        },
        onError: (error: any) => {
            toast({
                title: "Payment Error",
                description: error.response?.data?.error || "Failed to initiate payment",
                variant: "destructive"
            });
        }
    });

    const verifyPayment = useMutation({
        mutationFn: async (data: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
        }) => {
            const res = await apiService.post(apiConfig.endpoints.payments.verify, data);
            return res.data;
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Payment successful! Your membership is active.",
            });
            window.location.href = "/dashboard";
        },
        onError: (error: any) => {
            toast({
                title: "Verification Failed",
                description: error.response?.data?.error || "Payment verification failed",
                variant: "destructive"
            });
        }
    });

    return {
        plans,
        plansLoading,
        initiatePayment,
        verifyPayment
    };
}
