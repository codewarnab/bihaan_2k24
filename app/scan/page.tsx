"use client"
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Utensils, Shirt, Building2, QrCode, RotateCcw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Html5QrcodePlugin from "@/components/Html5qrcodeplugin";
import ResultContainerPlugin from "@/components/ResultContainerPlugin";

export default function QRCodeScanner() {
    const [decodedResults, setDecodedResults] = useState([]);
    const onNewScanResult = (decodedText, decodedResult) => {
        console.log("App [result]", decodedResult);
        setDecodedResults(prev => [...prev, decodedResult]);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col p-4">
            <h1 className="text-2xl font-bold text-center mb-4">QR Code Scanner</h1>
            <Html5QrcodePlugin
                fps={10}
                qrbox={{ width: 250, height: 250 }}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}
            />
            <ResultContainerPlugin results={decodedResults} />
        </div>
    );
}  