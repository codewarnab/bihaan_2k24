'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { supabase } from "@/lib/supabase-client";
import { markFoodCollected } from '@/utils/functions/students/markAsFoodCollected'
import { useUser } from '@/lib/store/user'
import { markMerchandiseCollected } from '@/utils/functions/students/markAsMerchCollcted'
import { formatDistanceToNow } from 'date-fns'; 


interface Log {
    id: number;
    created_at: string;
    organizer_name: string;
    email: string;
    actionType: string;
    fresher_roll: string;
}

type ScanResult = {
    name: string
    roll: string
    email: string
    phone: string
    veg_nonveg: string
    tshirt_size: string
    dept: string
    id: number
}

type Result = {
    decodedText: string
    result: {
        format: {
            formatName: string
        }
    }
}

export default function Component({ results, handleScanAgain }: { results: Result[], handleScanAgain: () => void }) {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [studentStatus, setStudentStatus] = useState<{ food: boolean, merch: boolean, college_roll: string } | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [logs, setLogs] = useState<Log[]>([]);
    const { user } = useUser();
    console.log("logs", logs)


    const fetchStudentStatus = useCallback(async (id: number) => {
        if (!id) {
            console.log("id",id)
            toast.error("Invalid student ID. Please try again.");
            return;
        }
        
        const { data: student, error: fetchError } = await supabase
            .from("people")
            .select(`food, merch ,college_roll`)
            .eq("id", id)
            .single();

        if (fetchError) {
            toast.error("Failed to fetch student status. Please try again.");
            console.error("Failed to fetch student status:", fetchError);
            return;
        }

        setStudentStatus(student);

        // Fetch logs if food or merch is collected
        if (student.food || student.merch) {
            fetchLogs(student.college_roll);
        }
    }, []);

    useEffect(() => {
        if (results.length > 0) {
            try {
                const parsedResult = JSON.parse(results[0])
                console.log("parsedResult",parsedResult)
                if (parsedResult.id) {
                    setScanResult(parsedResult);
                    setIsOpen(true);
                    fetchStudentStatus(parsedResult.id);  // Fetch food and merch status
                } else {
                    toast.error("No valid ID found in QR code data.");
                }
            } catch (error) {
                console.error("Failed to parse QR code data:", error)
                toast.error("Failed to parse QR code data. Please try scanning again.")
            }
        }
    }, [fetchStudentStatus, results])
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
        setStudentStatus(null)
        setLogs([])
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

                    {studentStatus && (
                        <>
                            <Button onClick={() => {
                                if (scanResult) {
                                    markFoodCollected(scanResult.id, studentStatus, setStudentStatus, user?.name || 'Unknown', user?.email || 'Unknown', studentStatus.college_roll);
                                }
                            }} className="w-full"
                                disabled={studentStatus.food}
                            >
                                <Utensils className="w-4 h-4 mr-2" />
                                {studentStatus.food ? 'Food Collected' : 'Mark Food as Collected'}
                            </Button>

                            <Button
                                onClick={() => {
                                    if (scanResult) {
                                        markMerchandiseCollected(scanResult.id, studentStatus, setStudentStatus, user?.name || 'Unknown', user?.email || 'Unknown', studentStatus.college_roll);
                                    }
                                }}
                                className="w-full"
                                disabled={studentStatus.merch}
                            >
                                <Shirt className="w-4 h-4 mr-2" />
                                {studentStatus.merch ? 'Merch Collected' : 'Mark Merch as Collected'}
                            </Button>

                        </>
                    )}

                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
