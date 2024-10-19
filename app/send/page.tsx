"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import UserMenu from '@/components/nav'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/lib/store/user"
import Link from "next/link"
import StudentsTable from "@/components/EmailTables/StudentTable"
import VolunteerTable from "@/components/EmailTables/VoluteersTable"



export default function QRCodeEmailSender() {
    const [activeTab, setActiveTab] = useState<'students' | 'volunteers'>('students')
    const [searchTerm, setSearchTerm] = useState('')
    const { user } = useUser()  
    
    


    

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

    return (
        <div className="container mx-auto p-4">
            <UserMenu
                firstLinkHref="/logs"
                firstLinkLabel="Logs"
                secondLinkHref="/"
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
                        <TabsContent value="students" className="p-6">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Search by roll number, email, or phone"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 py-2 mb-3"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                            <StudentsTable
                                searchTerm={searchTerm}
                            />
                        </TabsContent>
                        <TabsContent value="volunteers" className="p-6">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Search by roll number, email, or phone"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 py-2 mb-3"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                            <VolunteerTable
                                searchTerm={searchTerm}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}