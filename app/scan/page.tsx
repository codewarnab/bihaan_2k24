"use client"
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Utensils, Shirt, Building2, QrCode, RotateCcw, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Html5QrcodePlugin from "@/components/Html5qrcodeplugin";
import ResultContainerPlugin from "@/components/ResultContainerPlugin";

export default function QRCodeScanner() {
    const [decodedResults, setDecodedResults] = useState([]);
    const [openScanner, setIsOpen] = useState(false);
    const onNewScanResult = (decodedText, decodedResult) => {
        console.log("App [result]", decodedResult);
        setDecodedResults(prev => [...prev, decodedResult]);
    };
    const [Html5QrcodeScannerState, setHtml5QrcodeScannerState] = useState(null);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col p-4  justify-center ">
            <h1 className="text-2xl font-bold text-center mb-4">QR Code Scanner</h1>
            {openScanner && (
                <Html5QrcodePlugin
                    fps={10}
                    qrbox={{ width: 250, height: 250 }}
                    disableFlip={false}
                    qrCodeSuccessCallback={onNewScanResult}
                    verbose={true}
                    setHtml5QrcodeScannerState={setHtml5QrcodeScannerState}
                />
            )

            }
            <Button
                onClick={() => setIsOpen(!openScanner)}
            >
                {Html5QrcodeScannerState === 2 ?
                    <>
                        Scaninng..
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </> :
                    <>
                        <QrCode className="w-5 h-5" />
                        <span className="ml-2">{
                            openScanner ? "Close Scanner" : "Open Scanner"
                        } </span>
                    </>
                }
            </Button>


            <ResultContainerPlugin results={decodedResults} />
        </div>
    );
}  