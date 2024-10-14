"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Utensils, Shirt, Building2, QrCode, RotateCcw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Html5QrcodePlugin from "@/components/Html5qrcodeplugin"; 

type ScanResult = {
    name: string;
    roll: string;
    email: string;
    phone: string;
    veg_nonveg: string;
    tshirt_size: string;
    dept: string;
    jwtToken: string;
} | null;

export default function QRCodeScanner() {
    const [scanResult, setScanResult] = useState<ScanResult>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(true);

    const handleScanSuccess = (decodedText: string) => {
        try {
            const parsedData = JSON.parse(decodedText);
            setScanResult(parsedData);
            setScanning(false);
        } catch (error) {
            console.error("Failed to parse QR code data:", error);
            setError("Failed to parse QR code data. Please try again.");
        }
    };

    const handleScanError = (err: string | Error) => {
        console.error("Camera error:", err);
        setError("An error occurred while accessing the camera. Please ensure camera permissions are granted and you are using a supported device and browser.");
        setScanning(false);
    };

    const handleScanAnother = () => {
        setScanResult(null);
        setError(null);
        setScanning(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col p-4">
            <h1 className="text-2xl font-bold text-center mb-4">QR Code Scanner</h1>
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {scanning ? (
                <Card>
                    <CardContent className="p-4">
                        <Html5QrcodePlugin
                            qrCodeSuccessCallback={handleScanSuccess}
                            qrCodeErrorCallback={handleScanError}
                            fps={10}
                            qrbox={{ width: 250, height: 250 }}
                        />
                    </CardContent>
                    <CardFooter>
                        <p className="text-center w-full text-sm text-gray-500">
                            Position the QR code within the frame to scan
                        </p>
                    </CardFooter>
                </Card>
            ) : scanResult ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-center">{scanResult.name}</CardTitle>
                        <Badge variant="secondary" className="mx-auto mt-2">{scanResult.roll}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-500" />
                            <span className="text-sm">{scanResult.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <span className="text-sm">{scanResult.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Utensils className="h-5 w-5 text-gray-500" />
                            <span className="text-sm">{scanResult.veg_nonveg}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Shirt className="h-5 w-5 text-gray-500" />
                            <span className="text-sm">T-Shirt Size: {scanResult.tshirt_size}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Building2 className="h-5 w-5 text-gray-500" />
                            <span className="text-sm">{scanResult.dept}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleScanAnother} className="w-full">
                            <RotateCcw className="mr-2 h-4 w-4" /> Scan Another
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-4">
                        <p className="text-center">No QR code scanned yet.</p>
                        <Button onClick={handleScanAnother} className="w-full mt-4">
                            <QrCode className="mr-2 h-4 w-4" /> Start Scanning
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
