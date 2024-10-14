"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Utensils, Shirt, Building2, QrCode, RotateCcw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Html5QrcodePlugin from "@/components/Html5qrcodeplugin";
import ResultContainerPlugin from "@/components/ResultContainerPlugin"
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
    const [decodedResults, setDecodedResults] = useState();
    const onNewScanResult = (decodedText, decodedResult) => {
        console.log("App [result]", decodedResult);
        setDecodedResults(decodedResult);
    };

    return (
        <div className="App">
            <section className="App-section">
                <div className="App-section-title"> Html5-qrcode React demo</div>
                <br />
                <br />
                <br />
                <Html5QrcodePlugin
                    fps={10}
                    qrbox={{ width: 250, height: 250 }}
                    disableFlip={false}
                    qrCodeSuccessCallback={onNewScanResult}
                />
                <ResultContainerPlugin results={decodedResults} />
                {/* <HowToUse /> */}
            </section>
        </div>
    );
}
