'use client'

import React, { useState, useEffect } from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Utensils, Shirt, Building2, QrCode, RotateCcw, AlertCircle } from "lucide-react"
import { toast } from "sonner";

type ScanResult = {
    name: string
    roll: string
    email: string
    phone: string
    veg_nonveg: string
    tshirt_size: string
    dept: string
    jwtToken: string
}

type Result = {
    decodedText: string
    result: {
        format: {
            formatName: string
        }
    }
}

export default function Component({ results ,handleScanAgain}: { results: Result[] , handleScanAgain: () => void}) {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (results.length > 0) {
            try {
                const parsedResult = JSON.parse(results[0])  
                setScanResult(parsedResult)
                setIsOpen(true)
            } catch (error) {
                console.error("Failed to parse QR code data:", error)
                toast.error("Failed to parse QR code data. Please try scanning again.")
                
            }
        }
    }, [results])

    const handleClose = () => {
        setIsOpen(false)
        setScanResult(null)
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Scanned QR Code Result</DrawerTitle>
                    <DrawerDescription>Details from the scanned QR code</DrawerDescription>
                </DrawerHeader>
                {scanResult ? (
                    <div className="p-4 space-y-4">
                        <div className="flex items-center space-x-2">
                            <QrCode className="w-5 h-5 text-primary" />
                            <span className="font-semibold">{scanResult.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <span>{scanResult.roll} - {scanResult.dept.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Mail className="w-5 h-5 text-primary" />
                            <span>{scanResult.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Phone className="w-5 h-5 text-primary" />
                            <span>{scanResult.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Utensils className="w-5 h-5 text-primary" />
                            <span>{scanResult.veg_nonveg === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Shirt className="w-5 h-5 text-primary" />
                            <span>T-Shirt Size: {scanResult.tshirt_size}</span>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-10 h-10 text-yellow-500" />
                        <p className="text-center">No valid QR code data found. Please try scanning again.</p>
                    </div>
                )}
                <DrawerFooter>
                    <Button onClick={() => {
                        handleScanAgain()
                        handleClose()
                    }} className="w-full">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Scan Again
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}