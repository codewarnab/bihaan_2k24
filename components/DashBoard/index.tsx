'use client'

import { useState, Suspense, lazy } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import UserMenu from '@/components/nav'
import { Skeleton } from "@/components/ui/skeleton"
import { IUser } from '@/lib/types/user'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const VolunteersDashboard = lazy(() => import('@/components/DashBoard/VolunteerDashboard'))
const FacultyDashboard = lazy(() => import('@/components/DashBoard/FacultyDashboard'))
const StudentsDashboard = lazy(() => import('@/components/DashBoard/StudentDashBoard'))
import Link from 'next/link'
import AddStudentDialog from '@/components/DashBoard/AddStudentForm'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import MobileStudentsDashboard from '@/components/DashBoard/MobileStudentDashbaord'
import MobileVolunteersDashboard from '@/components/DashBoard/MobileVolunteerDashboard'

function LoadingFallback() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        </div>
    )
}

export default function Dashboard({ user }: { user: IUser | null }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTab, setSelectedTab] = useState('students')
    const isDesktop = useIsDesktop()

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    if (!user || !(user.isGod || user.isAdmin)) {
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
        <div className="container mx-auto p-7 relative">
            <h1 className="text-3xl sm:text-2xl font-bold mb-6">Bihaan 2024 Dashboard</h1>
            {isDesktop &&
                <UserMenu
                    firstLinkHref="/logs"
                    firstLinkLabel="Logs"
                    secondLinkHref="/contact"
                    secondLinkLabel="Contact"
                />
            }

            <div className="mb-6">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Search by name, college roll, phone, or email"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-10 py-6 text-lg"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
                </div>
            </div>
            <div className="flex justify-between items-center mb-4">
                {isDesktop ? (
                    <Tabs defaultValue="students" className="w-full" onValueChange={(value) => setSelectedTab(value)}>
                        <div className="flex justify-between items-center">
                            <TabsList>
                                <TabsTrigger value="students">Students</TabsTrigger>
                                <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                                <TabsTrigger value="faculty">Faculty</TabsTrigger>
                            </TabsList>
                            {selectedTab === 'students' &&     
                                <AddStudentDialog user={user} />
                            }
                        </div>
                        <TabsContent value="students" className="p-6">
                            <Suspense fallback={<LoadingFallback />}>
                                <StudentsDashboard searchTerm={searchTerm} user={user} />
                            </Suspense>
                        </TabsContent>
                        <TabsContent value="volunteers" className="p-6">
                            <Suspense fallback={<LoadingFallback />}>
                               <VolunteersDashboard searchTerm={searchTerm} user={user} />  
                            </Suspense>
                        </TabsContent>
                        <TabsContent value="faculty" className="p-6">
                            <Suspense fallback={<LoadingFallback />}>
                                <FacultyDashboard searchTerm={searchTerm} user={user} />
                            </Suspense>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-4">
                            <Select defaultValue="students" onValueChange={(value) => setSelectedTab(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="students">Students</SelectItem>
                                    <SelectItem value="volunteers">Volunteers</SelectItem>
                                    <SelectItem value="faculty">Faculty</SelectItem>
                                </SelectContent>
                            </Select>
                            <AddStudentDialog user={user} />
                        </div>
                        <div className="mt-4">
                            {selectedTab === 'students' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <MobileStudentsDashboard searchTerm={searchTerm} user={user} />
                                </Suspense>
                            )}
                            {selectedTab === 'volunteers' && (
                                <Suspense fallback={<LoadingFallback />}>
                                   <MobileVolunteersDashboard searchTerm={searchTerm} user={user} />
                                </Suspense>
                            )}
                            {selectedTab === 'faculty' && (
                                <Suspense fallback={<LoadingFallback />}>
                                    <FacultyDashboard searchTerm={searchTerm} user={user} />
                                </Suspense>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}