"use client"

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

interface Html5QrcodePluginProps {
    fps?: number;
    qrbox?: { width: number; height: number };
    aspectRatio?: number;
    disableFlip?: boolean;
    verbose?: boolean;
    qrCodeSuccessCallback: (decodedText: string, result: any) => void;
    qrCodeErrorCallback?: (error: string) => void;
    setHtml5QrcodeScannerState?: (state: any) => void;
}

const qrcodeRegionId = "html5qr-code-full-region";

const createConfig = (props: Html5QrcodePluginProps) => {
    const config: any = {};
    if (props.fps) config.fps = props.fps;
    if (props.qrbox) config.qrbox = props.qrbox;
    if (props.aspectRatio) config.aspectRatio = props.aspectRatio;
    if (props.disableFlip !== undefined) config.disableFlip = props.disableFlip;
    config.videoConstraints = {
        facingMode: { exact: "environment" }
    };
    return config;
};

export default function Html5QrcodePlugin(props: Html5QrcodePluginProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // This effect should only run once when the component mounts
        console.log("Html5QrcodePlugin mounted");
        scannerRef.current = null;
        if (!scannerRef.current) {
            const config = createConfig(props);
            const verbose = props.verbose === true;

            if (!props.qrCodeSuccessCallback) {
                throw new Error("qrCodeSuccessCallback is required callback.");
            }

            scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
            scannerRef.current.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);

            if (props.setHtml5QrcodeScannerState) {
                props.setHtml5QrcodeScannerState(scannerRef.current.getState());
            }
        }

        // Cleanup function
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [props]); // Empty dependency array ensures this effect runs only once

    return <div id={qrcodeRegionId} />;
}