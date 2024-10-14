"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mail, Send, Loader2, Search, QrCode } from "lucide-react"
import { Input } from "@/components/ui/input"
import UserMenu from '@/components/nav'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { getAllPeople } from "@/utils/functions/getStudentsInfo"
import { StudentData } from "@/lib/types/student"
import axios from "axios"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"

const sendEmail = async (id: number) => {
    const response = await axios.post("/api/sendEmails", {
        id,
    });

    if (response.status !== 200) {
        throw new Error("Failed to send email");
    }
    return response.data;
};

export default function QRCodeEmailSender() {
    const [data, setData] = useState<StudentData[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    const updateStudentStatus = (id: number, status: string, reason: string = "") => {
        setData(prevStudents =>
            prevStudents.map(student =>
                student.id === id ? { ...student, status: status as "pending" | "sending" | "sent" | "failed", reason } : student
            )
        )
    }

    useEffect(() => {
        const fetchData = async () => {
            const peopleData = await getAllPeople();
            if (peopleData) {
                setData(peopleData);
                console.log(peopleData)
            }
        };
        fetchData();
    }, []);

    const handleSendEmail = async (id: number) => {
        console.log("Sending email to student with ID:", id)
        updateStudentStatus(id, "sending")
        try {
            await sendEmail(id)
            updateStudentStatus(id, "sent")
        } catch (error) {
            updateStudentStatus(id, "failed", (error as Error).message)
        }
    }

    const handleSendAllEmails = async () => {
        for (const student of filteredStudents) {
            if (student.status !== "sent") {
                await handleSendEmail(student.id)
            }
        }
    }

    const filteredStudents = useMemo(() => {
        return data.filter(item =>
            (item.college_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.phone?.toString().includes(searchTerm) ?? false) ||
            (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        )
    }, [data, searchTerm])

    const sentCount = filteredStudents.filter(s => s.status === "sent").length
    const totalCount = filteredStudents.length
    const progressPercentage = (sentCount / totalCount) * 100

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const student = filteredStudents[index]
        

        return (
            <div style={{ ...style, width: '100%' }} className={`flex items-center border-b gap-16 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="w-[130px] p-4 truncate">{student.college_roll}</div>
                <div className="w-[250px] p-4 truncate">{student.email}</div>
                <div className="w-[180px] p-4 truncate">{student.phone}</div>
                <div className="flex-shrink-0 w-[80px] px-2 py-3 ">
                    <Badge variant={
                        student.status === "sent" ? "default" :
                            student.status === "sending" ? "outline" :
                                student.status === "failed" ? "destructive" : "secondary"
                    }>
                        {student.status}
                    </Badge>
                </div>
                <div className="flex-shrink-0 w-[100px] px-2 py-3">
                    {(student.status !== "sending") && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(student.id)}
                            disabled={student.status === "sending"}
                            className="w-full"
                        >
                            {student.status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                <Send className="h-4 w-4 mr-1" />}
                            {student.status === "sent" ? "Resend" :
                                student.status === "failed" ? "Retry" : "Send"}
                        </Button>
                    )}
                </div>
                <div className="flex-shrink-0 w-[80px] px-2 py-3">
                    {student.qrcode && (
                        <Dialog >
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
                                    <DialogTitle>QR Code for {student.college_roll}</DialogTitle>
                                </DialogHeader>
                                <div className="flex items-center justify-center p-6">
                                    {student.qrcode && student.status === "sent" && (
                                        <Image
                                            src={student.qrcode}
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
        <div className="container mx-auto p-4">
            <UserMenu
                firstLinkHref="/logs"
                firstLinkLabel="Logs"
                secondLinkHref="/dashboard"
                secondLinkLabel="Dashboard"
            />
            <Card className="w-full mt-12">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Mail className="h-6 w-6" />
                        QR Code Email Sender
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold">Progress</h2>
                                <p className="text-sm text-muted-foreground">{sentCount} of {totalCount} emails sent</p>
                            </div>
                            <Button onClick={handleSendAllEmails} className="mb-4">
                                <Send className="mr-2 h-4 w-4" />
                                Send All Emails
                            </Button>
                        </div>
                        <Progress value={progressPercentage} className="w-full" />
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search by roll number, email, or phone"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 py-2"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <div className="rounded-md border">
                            <div className="flex items-center font-semibold border-b bg-gray-100 text-sm gap-16">
                                <div className="w-[150px] p-4">College Roll</div>
                                <div className="w-[250px] p-4">Email</div>
                                <div className="w-[180px] p-4">Phone</div>
                                <div className="flex-shrink-0 w-[80px] px-2 py-3">Status</div>
                                <div className="flex-shrink-0 w-[100px] px-2 py-3">Action</div>
                                <div className="flex-shrink-0 w-[80px] px-2 py-3">QR Code</div>
                            </div>
                            <div style={{ height: '400px', width: '100%' }}>
                                <AutoSizer>
                                    {({ height, width }) => (
                                        <List
                                            height={height}
                                            width={width}
                                            itemCount={filteredStudents.length}
                                            itemSize={45}
                                        >
                                            {Row}
                                        </List>
                                    )}
                                </AutoSizer>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}