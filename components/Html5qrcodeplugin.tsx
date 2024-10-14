/* eslint-disable @typescript-eslint/no-explicit-any */
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

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
    const config: any = {}; // You can further refine this type
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
    config.videoConstraints = {
        facingMode: { exact: "environment" }
    };

    return config;
};

const Html5QrcodePlugin: React.FC<Html5QrcodePluginProps> = (props) => {

    useEffect(() => {
        // when component mounts
        const config = createConfig(props);
        const verbose = props.verbose === true;

        // Success callback is required.
        if (!props.qrCodeSuccessCallback) {
            throw new Error("qrCodeSuccessCallback is required callback.");
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
        html5QrcodeScanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);

        if (props.setHtml5QrcodeScannerState) {
            props.setHtml5QrcodeScannerState(html5QrcodeScanner.getState());
        }

        // cleanup function when component will unmount
        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, [props]);

    return (
        <div id={qrcodeRegionId} />
    );
};

export default Html5QrcodePlugin;
