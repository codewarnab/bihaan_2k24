'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Utensils, Shirt, Building2, QrCode, RotateCcw, AlertCircle } from "lucide-react"
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";
import { markFoodCollected } from '@/utils/functions/students/markAsFoodCollected'
import { IUser } from '@/lib/types/user'
import { markMerchandiseCollected } from '@/utils/functions/students/markAsMerchCollcted'
import { formatDistanceToNow } from 'date-fns';
import { Log } from '@/lib/types/log'
import { markFoodCollectedVolunteer } from "@/utils/functions/volunteers/markFoodCollected"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'


type ScanResult = {
    name: string
    roll: string
    email: string
    phone: string
    veg_nonveg: string
    tshirt_size?: string 
    dept: string
    id: number
    isVolunteer: boolean 
    team?: string
    isLate? : boolean
}

type Result = {
    decodedText: string
    result: {
        format: {
            formatName: string
        }
    }
}

export default function Component({ results, handleScanAgain ,user}: { results: Result[], handleScanAgain: () => void ,user:IUser | null }) {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [status, setStatus] = useState<{ food: boolean, merch?: boolean , college_roll: string } | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [logs, setLogs] = useState<Log[]>([]);
    

    console.log("logs", logs)
    console.log("status", status)
    console.log("scanResult", scanResult)

    const fetchStatus = useCallback(async (id: number, isVolunteer: boolean) => {
        if (!id) {
            toast.error("Invalid ID. Please try again.");
            return;
        }

        const table = isVolunteer ? "volunteers" : "people";
        const fields = isVolunteer ? `food, college_roll` : `food, merch, college_roll`;

        const { data, error: fetchError } = await supabase
            .from(table)
            .select(fields)
            .eq("id", id)
            .single();

        if (fetchError) {
            toast.error("Failed to fetch status. Please try again.");
            console.error("Failed to fetch status:", fetchError);
            return;
        }

        setStatus(data as unknown as { food: boolean, merch?: boolean, college_roll: string });

        // Fetch logs if food or merch is collected
        if (data?.food || (!isVolunteer && data?.merch)) {
            fetchLogs(data.college_roll);
        }
    }, []);

    useEffect(() => {
        if (results.length > 0) {
            try {
                const parsedResult = JSON.parse(results[0])
                console.log("parsedResult", parsedResult)
                if (parsedResult.id) {
                    setScanResult(parsedResult);
                    setIsOpen(true);
                    fetchStatus(parsedResult.id, parsedResult.isVolunteer);  // Fetch food/merch status
                } else {
                    toast.error("No valid ID found in QR code data.");
                }
            } catch (error) {
                console.error("Failed to parse QR code data:", error)
                toast.error("Failed to parse QR code data or it is not a valid QR code. Please try again.");
                handleScanAgain()
            }
        }
    }, [fetchStatus, results, handleScanAgain]);

    

    const fetchLogs = async (collegeRoll: string) => {
        const { data: logData, error: logError } = await supabase
            .from("logs")
            .select("*")
            .eq("fresher_roll", collegeRoll);

        if (logError) {
            toast.error("Failed to fetch logs. Please try again.");
            console.error("Failed to fetch logs:", logError);
        } else {
            setLogs(logData || []);
        }
    };

    const handleClose = () => {
        setIsOpen(false)
        setScanResult(null)
        setStatus(null)
        setLogs([])
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} onClose={handleScanAgain} >
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Scanned QR Code Result</DrawerTitle>
                    <DrawerDescription>Details from the scanned QR code</DrawerDescription>
                </DrawerHeader>
                {scanResult ? (
                    <div className="p-4 space-y-4">
                        <h1 className="text-xl font-semibold">{scanResult.isVolunteer ? "Volunteer Details" : "Student Details"}</h1>
                        {scanResult.isLate && (
                            <Badge variant="destructive" className="bg-red-500">
                                Late
                            </Badge>
                        )}
                        <div className="flex items-center space-x-2">
                            <QrCode className="w-5 h-5 text-primary" />
                            <span className="font-semibold">{scanResult.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <span>{scanResult.roll} - {scanResult.dept.toUpperCase()}</span>
                        </div>
                        {scanResult.isVolunteer && scanResult.team && (
                            <div className="flex items-center space-x-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                <span>Team: {scanResult.team}</span>
                            </div>
                        )}
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
                            <span>{scanResult.veg_nonveg.toLocaleLowerCase() === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                        </div>
                        {scanResult && !scanResult.isVolunteer && (
                            <div className="flex items-center space-x-2">
                                <Shirt className="w-5 h-5 text-primary" />
                                <span>T-Shirt Size: {scanResult.tshirt_size}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-4 flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-10 h-10 text-yellow-500" />
                        <p className="text-center">No valid QR code data found. Please try scanning again.</p>
                    </div>
                )}

                {logs.length > 0 && (
                    <div className="p-4 space-y-2">
                        {logs.map((log) => (
                            <p key={log.id}>
                                {log.organizer_name} marked {log.actionType} {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })} ago
                            </p>
                        ))}
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

                    {status && status.college_roll === 'disabled' ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Discarded QR Attachment</AlertTitle>
                            <AlertDescription>
                                The organizers have discarded this QR attachment. No actions can be performed.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        status && (
                            <>
                                <Button onClick={() => {
                                    if (scanResult) {
                                        if (scanResult.isVolunteer) {
                                            markFoodCollectedVolunteer(scanResult.id, status, setStatus, user?.name || 'Unknown', user?.email || 'Unknown', status.college_roll, user);
                                        } else {
                                            markFoodCollected(scanResult.id, status, setStatus, user?.name || 'Unknown', user?.email || 'Unknown', status.college_roll);
                                        }
                                    }
                                }} className="w-full"
                                    disabled={status.food}
                                >
                                    <Utensils className="w-4 h-4 mr-2" />
                                    {status.food ? 'Food Collected' : 'Mark Food as Collected'}
                                </Button>

                                {scanResult && !scanResult.isVolunteer && (
                                    <Button
                                        onClick={() => {
                                            if (scanResult) {
                                                markMerchandiseCollected(scanResult.id, status, setStatus, user?.name || 'Unknown', user?.email || 'Unknown', status.college_roll);
                                            }
                                        }}
                                        className="w-full"
                                        disabled={status.merch}
                                    >
                                        <Shirt className="w-4 h-4 mr-2" />
                                        {status.merch ? 'Merch Collected' : 'Mark Merch as Collected'}
                                    </Button>
                                )}
                            </>
                        )
                    )}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
