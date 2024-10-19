'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2, QrCode, Send } from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { getAllPeople } from "@/utils/functions/students/getStudentsInfo"
import { StudentData } from "@/lib/types/student"
import { supabase } from '@/lib/supabase-client'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/lib/store/user'
import sendEmail from '@/utils/functions/sendEmail'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Image from 'next/image'

interface StudentsDashboardProps {
    searchTerm: string
}

export default function StudentsTable({ searchTerm }: StudentsDashboardProps) {
    const [data, setData] = useState<StudentData[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [sendingAll, setSendingAll] = useState<boolean>(false)
    const { user } = useUser()

    useEffect(() => {
        const fetchData = async () => {
            const peopleData = await getAllPeople()
            if (peopleData) {
                setData(peopleData)
            }
            setIsLoading(false)
        }

        fetchData()

        const subscription = supabase
            .channel('public:people')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, payload => {
                const { eventType, new: newItem, old: oldItem } = payload

                setData(prevData => {
                    if (eventType === 'INSERT') {
                        return [...prevData, newItem as StudentData]
                    } else if (eventType === 'UPDATE') {
                        return prevData.map(item =>
                            item.id === (newItem as StudentData).id ? newItem as StudentData : item
                        )
                    } else if (eventType === 'DELETE') {
                        return prevData.filter(item => item.id !== (oldItem as StudentData).id)
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

    const totalStudents = filteredData.length

    const handleSendEmail = async (id: number) => {
        try {
            const response = await sendEmail(id, 'student', user) 
            setData(prevData => prevData.map(item =>
                item.id === id ? { ...item, status: response ? 'sent' : 'failed' } : item
            ));
        } catch (error) {
            console.error("Error in handleSendEmail:", error);
        }
    };

    const sendAllEmails = async () => {
        setSendingAll(true)
        try {
            for (const student of filteredData) {
                if (student.status !== "sent" && student.status !== "sending") {
                    await handleSendEmail(student.id) // Call the function for each student
                }
            }
        } catch (error) {
            console.error('Error sending emails:', error)
        } finally {
            setSendingAll(false)
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
                    <div className="flex-1 p-4 bg-gray-200" />
                </div>
            )
        }

        return (
            <div style={{ ...style, width: '100%' }} className="flex items-center border-b hover:bg-gray-50">
                <div className="flex-1 p-4 truncate">{item.college_roll}</div>
                <div className="flex-1 p-4 truncate">{item.email}</div>
                <div className="flex-1 p-4 truncate">{item.phone}</div>
                <div className="flex-1 p-4 ">
                    <Badge variant={
                        item.status === "sent" ? "default" :
                            item.status === "sending" ? "outline" :
                                item.status === "failed" ? "destructive" : "secondary"
                    }>
                        {item.status}
                    </Badge>
                </div>
                <div className="flex-1 p-4">
                    {(item.status !== "sending") && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(item.id)}
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
                    onClick={sendAllEmails}
                    disabled={sendingAll || totalStudents === 0}
                >
                    {sendingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send All"}
                </Button>
            </div>
            <div className="overflow-x-auto">
                <div className="flex items-center font-bold border-b bg-gray-100 rounded-sm">
                    <div className="flex-1 p-4">College Roll</div>
                    <div className="flex-1 p-4">Email</div>
                    <div className="flex-1 p-4">Phone</div>
                    <div className="flex-1 p-4">Status</div>
                    <div className="flex-1 p-4">Action</div>
                    <div className="flex-1 p-4">Qr Code </div>
                </div>
                <div style={{ height: '500px', width: '100%' }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                            height={height}
                            width={width}
                            itemCount={totalStudents}
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
