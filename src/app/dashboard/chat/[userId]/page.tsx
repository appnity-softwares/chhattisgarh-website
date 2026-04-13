"use client";

import ChatPage from "../page";
import { useParams } from "next/navigation";
import React from "react";

export default function DirectChatPage() {
    const params = useParams();
    const userId = params.userId ? parseInt(params.userId as string) : null;

    // We can technically just wrap the ChatPage or pass the initial ID to it.
    // For now, since ChatPage manages its own selectedUserId, we might need to modify it 
    // or just pass the ID as an override.
    
    return <ChatPage initialUserId={userId} />;
}
