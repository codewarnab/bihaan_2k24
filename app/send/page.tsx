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
import { getAllPeople } from "@/utils/functions/students/getStudentsInfo"
import { StudentData } from "@/lib/types/student"
import { getVolunteersInfo } from "@/utils/functions/volunteers/getVolunteeersInfo"
import { VolunteerData } from "@/lib/types/volunteer"
import axios from "axios"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/lib/store/user"
import Link from "next/link"
const sendEmail = async (id: number, type: 'student' | 'volunteer') => {
    const response = await axios.post("/api/sendEmails", {
        id,
        type,
    });

    if (response.status !== 200) {
        throw new Error("Failed to send email");
    }
    return response.data;
};

export default function QRCodeEmailSender() {
    const [activeTab, setActiveTab] = useState<'students' | 'volunteers'>('students')
    const [studentData, setStudentData] = useState<StudentData[]>([])
    const [volunteerData, setVolunteerData] = useState<VolunteerData[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const { user } = useUser()

    const updateStatus = (id: number, status: string, reason: string = "", isStudent: boolean) => {
        const updateFunction = isStudent ? setStudentData : setVolunteerData;
        updateFunction(prevData =>
            prevData.map(item =>
                item.id === id ? { ...item, status: status as "pending" | "sending" | "sent" | "failed", reason } : item
            )
        )
    }

    useEffect(() => {
        const fetchData = async () => {
            const peopleData = await getAllPeople();
            if (peopleData) {
                setStudentData(peopleData);
            }
            const volunteersData = await getVolunteersInfo();
            if (volunteersData) {
                setVolunteerData(volunteersData);
            }
        };
        fetchData();
    }, []);

    const handleSendEmail = async (id: number, isStudent: boolean) => {
        console.log(`Sending email to ${isStudent ? 'student' : 'volunteer'} with ID:`, id)
        updateStatus(id, "sending", "", isStudent)
        try {
            await sendEmail(id, isStudent ? 'student' : 'volunteer')
            updateStatus(id, "sent", "", isStudent)
        } catch (error) {
            updateStatus(id, "failed", (error as Error).message, isStudent)
        }
    }

    const handleSendAllEmails = async () => {
        const data = activeTab === 'students' ? filteredStudents : filteredVolunteers;
        for (const item of data) {
            if (item.status !== "sent") {
                await handleSendEmail(item.id, activeTab === 'students')
            }
        }
    }

    const filteredStudents = useMemo(() => {
        return studentData.filter(item =>
            (item.college_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.phone?.toString().includes(searchTerm) ?? false) ||
            (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        )
    }, [studentData, searchTerm])

    const filteredVolunteers = useMemo(() => {
        return volunteerData.filter(item =>
            (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.phone?.toString().includes(searchTerm) ?? false) ||
            (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        )
    }, [volunteerData, searchTerm])

    const activeData = activeTab === 'students' ? filteredStudents : filteredVolunteers;
    const sentCount = activeData.filter(s => s.status === "sent").length
    const totalCount = activeData.length
    const progressPercentage = (sentCount / totalCount) * 100

    if (!user || !user.isGod) {
        return (
            <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
                <h1 className="text-4xl font-bold text-center text-red-600">
                    You are not authorized. Please <Link href='/contact' className='underline'>contact
                    </Link> the developer.
                </h1>
            </div>
        )
    }

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const item = activeData[index]
        const isStudent = activeTab === 'students'

        return (
            <div style={{ ...style, width: '100%' }} className={`flex items-center border-b gap-16 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="w-[130px] p-4 truncate">{isStudent ? (item as StudentData).college_roll : (item as VolunteerData).name}</div>
                <div className="w-[250px] p-4 truncate">{item.email}</div>
                <div className="w-[180px] p-4 truncate">{item.phone}</div>
                <div className="flex-shrink-0 w-[80px] px-2 py-3 ">
                    <Badge variant={
                        item.status === "sent" ? "default" :
                            item.status === "sending" ? "outline" :
                                item.status === "failed" ? "destructive" : "secondary"
                    }>
                        {item.status}
                    </Badge>
                </div>
                <div className="flex-shrink-0 w-[100px] px-2 py-3">
                    {(item.status !== "sending") && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(item.id, isStudent)}
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
                <div className="flex-shrink-0 w-[80px] px-2 py-3">
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
                                    <DialogTitle>QR Code for {isStudent ? (item as StudentData).college_roll : (item as VolunteerData).name}</DialogTitle>
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
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'students' | 'volunteers')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="students">Students</TabsTrigger>
                            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                        </TabsList>
                        <TabsContent value="students">
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
                        </TabsContent>
                        <TabsContent value="volunteers">
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
                                        placeholder="Search by name, email, or phone"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 py-2"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                                <div className="rounded-md border">
                                    <div className="flex items-center font-semibold border-b bg-gray-100 text-sm gap-16">
                                        <div className="w-[150px] p-4">Name</div>
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
                                                    itemCount={filteredVolunteers.length}
                                                    itemSize={45}
                                                >
                                                    {Row}
                                                </List>
                                            )}
                                        </AutoSizer>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}