"use client"

import { useState } from "react"
import Html5QrcodePlugin from "@/components/Html5qrcodeplugin"
import ResultContainerPlugin from "@/components/ResultContainerPlugin"
import { useIsDesktop } from "@/hooks/useIsDesktop"
import { useUser } from "@/lib/store/user"
import { Button } from "@/components/ui/button"
import { Phone, LogOut } from "lucide-react"

export default function QRCodeScanner() {
  const [decodedResults, setDecodedResults] = useState([])
  const [scanningstate, setHtml5QrcodeScannerState] = useState(null)
  const isDesktop = useIsDesktop()
  const { user, setUser } = useUser()

  const onNewScanResult = (decodedResult: any) => {
    console.log("App [result]", decodedResult)
    setDecodedResults(prev => [...prev, decodedResult])
  }

  const handleScanAgain = () => {
    setDecodedResults([]) // Clear previous results
      setHtml5QrcodeScannerState(null) // Reset scanner state to trigger re-rendering
      
      setTimeout(() => {
          const cameraPermissionButton = document.querySelector('#html5-qrcode-button-camera-permission') as HTMLElement
          if (cameraPermissionButton) {
              cameraPermissionButton.click()
          }
      }, 0)

  }

  const handleLogout = () => {
    setUser(null) // Clear user state
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").split("=")[0] + "=;expires=" + new Date().toUTCString() + ";path=/"
    })
    window.location.reload() // Refresh the page
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4 justify-center">
      {!isDesktop ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.location.href = 'tel:6291912672'}
            >
              <Phone className="h-4 w-4" />
              <span>6291912672</span>
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
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
      ) : (
        <h1 className="text-4xl font-bold text-center mb-4">Please use mobile phone</h1>
      )}
    </div>
  )
}