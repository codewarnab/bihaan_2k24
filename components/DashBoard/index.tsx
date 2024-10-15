'use client'

import { useState, Suspense, lazy } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import UserMenu from '@/components/nav'
import { Skeleton } from "@/components/ui/skeleton"

const VolunteersDashboard = lazy(() => import('@/components/DashBoard/VolunteerDashboard'))
const FacultyDashboard = lazy(() => import('@/components/DashBoard/FacultyDashboard'))
const StudentsDashboard = lazy(() => import('@/components/DashBoard/StudentDashBoard'))

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

export default function Dashboard() {
    const [searchTerm, setSearchTerm] = useState('')

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    return (
        <div className="container mx-auto p-8 relative">
            <h1 className="text-3xl font-bold mb-6">Bihaan 2024 Dashboard</h1>
            <UserMenu
                firstLinkHref="/logs"
                firstLinkLabel="Logs"
                secondLinkHref="/contact"
                secondLinkLabel="Contact"
            />
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
            <Tabs defaultValue="students" className="w-full">
                <TabsList>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                    <TabsTrigger value="faculty">Faculty</TabsTrigger>
                </TabsList>
                <TabsContent value="students">
                    <Suspense fallback={<LoadingFallback />}>
                        <StudentsDashboard searchTerm={searchTerm} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="volunteers">
                    <Suspense fallback={<LoadingFallback />}>
                        <VolunteersDashboard
                            searchTerm={searchTerm} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="faculty">
                    <Suspense fallback={<LoadingFallback />}>
                        <FacultyDashboard
                            searchTerm={searchTerm} />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}