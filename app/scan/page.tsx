/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react";
import Html5QrcodePlugin from "@/components/Html5qrcodeplugin";
import ResultContainerPlugin from "@/components/ResultContainerPlugin";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useUser } from "@/lib/store/user";


export default function QRCodeScanner() {
    const [decodedResults, setDecodedResults] = useState([]);
    const [scanningstate, setHtml5QrcodeScannerState] = useState(null);
    const isDesktop = useIsDesktop();
    const { user } = useUser();

    const onNewScanResult = (decodedResult: any) => {
        console.log("App [result]", decodedResult);
        setDecodedResults(prev => [...prev, decodedResult]);
    };

    const handleScanAgain = () => {
        setDecodedResults([]); // Clear previous results
        setHtml5QrcodeScannerState(null); // Reset scanner state to trigger re-rendering
    };



    return (
        <div className="min-h-screen bg-gray-100 flex flex-col p-4  justify-center ">

            {!isDesktop  ? (

                <>
                    <h1 className="text-2xl font-bold text-center mb-4">QR Code Scanner</h1>
                    <Html5QrcodePlugin
                        fps={10}
                        qrbox={{ width: 300, height: 300 }}
                        disableFlip={false}
                        qrCodeSuccessCallback={onNewScanResult}
                        verbose={true}
                        setHtml5QrcodeScannerState={setHtml5QrcodeScannerState}
                    />
                    <ResultContainerPlugin
                        results={decodedResults}
                        handleScanAgain={handleScanAgain}
                        user={user}
                    />
                </>
            ) :
                <h1 className="text-4xl font-bold text-center mb-4"> Please use mobile phone </h1>
            }
        </div>
    );
}  