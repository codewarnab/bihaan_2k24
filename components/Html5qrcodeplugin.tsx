import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

// Define the props interface
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

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: Html5QrcodePluginProps) => {
    const config: any = {};
    if (props.fps) {
        config.fps = props.fps;
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox;
    }
    if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio;
    }
    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
    }

    return config;
};

const Html5QrcodePlugin: React.FC<Html5QrcodePluginProps> = (props) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null); 

    useEffect(() => {
        
        if (!scannerRef.current) {
            const config = createConfig(props);
            const verbose = props.verbose === true;

            // Success callback is required.
            if (!props.qrCodeSuccessCallback) {
                throw new Error("qrCodeSuccessCallback is required callback.");
            }

            // Create the scanner instance
            scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
            scannerRef.current.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);

            // Pass scanner state to parent component
            if (props.setHtml5QrcodeScannerState) {
                props.setHtml5QrcodeScannerState(scannerRef.current.getState());
            }
        }

        // Cleanup function when component unmounts
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
                scannerRef.current = null; // Reset the scanner instance reference
            }
        };
    }, [props]);

    return (
        <div id={qrcodeRegionId} />
    );
};

export default Html5QrcodePlugin;
