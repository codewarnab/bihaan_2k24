'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, QrCode, Send } from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { getVolunteersInfo } from '@/utils/functions/volunteers/getVolunteeersInfo'
import { VolunteerData } from '@/lib/types/volunteer'
import { supabase } from '@/lib/supabase-client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import sendEmail from "@/utils/functions/sendEmail"
import { useUser } from '@/lib/store/user'

interface VolunteersDashboardProps {
    searchTerm: string
}

export default function VolunteerTable({ searchTerm }: VolunteersDashboardProps) {
    const [data, setData] = useState<VolunteerData[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSendingAll, setIsSendingAll] = useState<boolean>(false)
    const { user } = useUser()

    useEffect(() => {
        const fetchData = async () => {
            const peopleData = await getVolunteersInfo()
            if (peopleData) {
                setData(peopleData)

            }
            setIsLoading(false)
        }

        fetchData()

        const subscription = supabase
            .channel('public:volunteers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'volunteers' }, payload => {
                const { eventType, new: newItem, old: oldItem } = payload

                setData(prevData => {
                    if (eventType === 'INSERT') {
                        return [...prevData, newItem as VolunteerData]
                    } else if (eventType === 'UPDATE') {
                        return prevData.map(item =>
                            item.id === (newItem as VolunteerData).id ? newItem as VolunteerData : item
                        )
                    } else if (eventType === 'DELETE') {
                        return prevData.filter(item => item.id !== (oldItem as VolunteerData).id)
                    }
                    return prevData
                })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    const filteredData = useMemo(() => {
        if (!data) return []
        if (!searchTerm) return data
        return data.filter(item =>
            (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.college_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.phone?.toString().includes(searchTerm) ?? false) ||
            (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        )
    }, [data, searchTerm])

    const totalVolunteers = filteredData.length

    const handleSendEmail = async (id: number, type: 'volunteer') => {
        try {
            // Call sendEmail function and await its response
            const response = await sendEmail(id, type, user); // Pass appropriate user if needed

            // Check response to update the status accordingly
            if (response) {
                setData(prevData => prevData.map(item =>
                    item.id === id ? { ...item, status: 'sent' } : item
                ));
            } else {
                setData(prevData => prevData.map(item =>
                    item.id === id ? { ...item, status: 'failed' } : item
                ));
            }
        } catch (error) {
            console.error("Error in handleSendEmail:", error);
        }
    };

    const handleSendAll = async () => {
        setIsSendingAll(true)
        try {
            await Promise.all(filteredData.map(async (volunteer) => {
                if (volunteer.status !== "sent" && volunteer.status !== "sending") {
                    await handleSendEmail(volunteer.id, 'volunteer') // 
                }
            }))
        } catch (error) {
            console.error("Error sending emails: ", error)
        } finally {
            setIsSendingAll(false)
        }
    }

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const item = filteredData[index]

        if (isLoading || data.length === 0) {
            return (
                <div style={{ ...style, width: '100%' }} className="flex items-center border-b hover:bg-gray-50 animate-pulse">
                    <div className="flex-1 p-4 bg-gray-200" />
                    <div className="flex-1 p-4 bg-gray-200" />
                    <div className="flex-1 p-4 bg-gray-200" />
                    <div className="flex-1 p-4 bg-gray-200" />
                    <div className="flex-1 p-4 bg-gray-200" />
                </div>
            )
        }

        return (
            <div style={{ ...style, width: '100%' }} className="flex items-center border-b hover:bg-gray-50">
                <div className="flex-1 p-4 truncate">{item.college_roll}</div>
                <div className="flex-1 p-4 truncate">{item.email}</div>
                <div className="flex-1 p-4 truncate">{item.phone}</div>
                <div className="flex-1 p-4 truncate">{item.team}</div>
                <div className="flex-1 p-4 ">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Badge variant={
                                item.status === "sent" ? "default" :
                                    item.status === "sending" ? "outline" :
                                        item.status === "failed" ? "destructive" : "secondary"
                            }>
                                {item.status}
                            </Badge>
                        </DialogTrigger>
                        {item.status === "failed" && item.reason && (
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Error Details</DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                    <p>{item.reason}</p>
                                </div>
                            </DialogContent>
                        )}
                    </Dialog>
                </div>
                <div className="flex-1 p-4">
                    {(item.status !== "sending") && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(item.id, 'volunteer')}
                            disabled={item.status === "sending"}
                            className="w-full"
                        >
                            {item.status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                <Send className="h-4 w-4 mr-1" />}
                            {item.status === "sent" ? "Resend" :
                                item.status === "failed" ? "Retry" : "Send"}
                        </Button>
                    )}
                </div>

                <div className="flex-1 p-4">
                    {item.qrcode && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                >
                                    <QrCode className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>QR Code for {item.college_roll}  : {item.name}</DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center justify-center p-6">
                                    {item.qrcode && item.status === "sent" && (
                                        <Image
                                            src={item.qrcode}
                                            alt="QR Code" width={200}
                                            height={200}
                                            className="w-auto h-auto"
                                            loading="lazy"
                                        />
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between mb-4">
                <Button
                    variant="default"
                    onClick={handleSendAll}
                    disabled={isSendingAll || isLoading || totalVolunteers === 0}
                >
                    {isSendingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send All"}
                </Button>
            </div>
            <div className="overflow-x-auto">
                <div className="flex items-center font-bold border-b bg-gray-100 rounded-sm">
                    <div className="flex-1 p-4">College Roll</div>
                    <div className="flex-1 p-4">Email</div>
                    <div className="flex-1 p-4">Phone</div>
                    <div className="flex-1 p-4">Team</div>
                    <div className="flex-1 p-4">Status</div>
                    <div className="flex-1 p-4">Action</div>
                    <div className="flex-1 p-4">Qr Code</div>
                </div>
                <div style={{ height: '500px', width: '100%' }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                height={height}
                                width={width}
                                itemCount={totalVolunteers}
                                itemSize={50}
                            >
                                {Row}
                            </List>
                        )}
                    </AutoSizer>
                </div>
            </div>
        </div>
    )
}
