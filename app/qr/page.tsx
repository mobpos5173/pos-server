'use client';

import { useAuth } from "@clerk/nextjs";
import QRCode from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QRPage() {
    const { userId } = useAuth();

    if (!userId) {
        return <div>Please sign in to view your QR code</div>;
    }

    return (
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Your QR Code</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <QRCode 
                        value={userId}
                        size={256}
                        level="H"
                        includeMargin={true}
                    />
                    <p className="mt-4 text-sm text-muted-foreground">
                        Scan this code with your mobile app to connect
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}