'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Loader } from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { getAllPeople } from "@/utils/functions/students/getStudentsInfo"
import { StudentData } from "@/lib/types/student"
import { toggleMerchandiseCollection } from "@/utils/functions/students/toggleMerchCollection"
import { supabase } from '@/lib/supabase-client'
import { toggleFoodCollection } from '@/utils/functions/students/toggleFoodCollection'
import { IUser } from '@/lib/types/user'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudentsDashboardProps {
    searchTerm: string
    user: IUser | null
}

export default function StudentsDashboard({ searchTerm, user }: StudentsDashboardProps) {
    const [data, setData] = useState<StudentData[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [merchLoadingIds, setMerchLoadingIds] = useState<Set<number>>(new Set())
    const [foodLoadingIds, setFoodLoadingIds] = useState<Set<number>>(new Set())
    const [deptFilter, setDeptFilter] = useState<string>("all")

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
        let filtered = data

        if (searchTerm) {
            filtered = filtered.filter(item =>
                (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                (item.college_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                (item.phone?.toString().includes(searchTerm) ?? false) ||
                (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
            )
        }

        if (deptFilter !== "all") {
            filtered = filtered.filter(item => item.dept === deptFilter)
        }

        return filtered
    }, [data, searchTerm, deptFilter])

    const totalStudents = filteredData.length
    const foodCollected = filteredData.filter(item => item.food).length
    const merchandiseCollected = filteredData.filter(item => item.merch).length

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
                    <div className="flex-1 p-4 bg-gray-200" />
                    <div className="flex-1 p-4 bg-gray-200" />
                </div>
            )
        }

        return (
            <div style={{ ...style, width: '100%' }} className="flex items-center border-b hover:bg-gray-50">
                <div className="flex-1 p-4">{item.name}</div>
                <div className="flex-1 p-4 truncate">{item.college_roll}</div>
                <div className="flex-1 p-4 truncate">{item.email}</div>
                <div className="flex-1 p-4 truncate">{item.phone}</div>
                <div className="flex-1 p-4">{item.veg_nonveg}</div>
                <div className="flex-1 p-4">{item.tshirt_size}</div>
                <div className="flex-1 p-4">
                    <Button
                        variant={item.food ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleFoodCollection(
                            item.id, data, setData,
                            setFoodLoadingIds,
                            user?.name || 'Unknown',
                            user?.email || 'Unknown'
                        )}
                        disabled={foodLoadingIds.has(item.id) || item.food!}
                        className="w-28"
                    >
                        {foodLoadingIds.has(item.id) ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.food ? 'Collected' : 'Not Collected'}
                    </Button>
                </div>
                <div className="flex-1 p-4">
                    <Button
                        variant={item.merch ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleMerchandiseCollection(
                            item.id, data, setData,
                            setMerchLoadingIds,
                            user?.name || 'Unknown',
                            user?.email || 'Unknown'
                        )}
                        disabled={merchLoadingIds.has(item.id) || item.merch!}
                        className="w-28"
                    >
                        {merchLoadingIds.has(item.id) ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.merch ? 'Collected' : 'Not Collected'}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="text-lg">
                    Total Students: {totalStudents}, Food Collected: {foodCollected}, Merchandise Collected: {merchandiseCollected}
                </div>
                <div className="hidden md:block">
                    <Select value={deptFilter} onValueChange={setDeptFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            <SelectItem value="CSE">CSE</SelectItem>
                            <SelectItem value="ECE">ECE</SelectItem>
                            <SelectItem value="EE">EE</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="BCA">BCA</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="flex items-center font-bold border-b bg-gray-100 rounded-sm">
                    <div className="flex-1 p-4">Name</div>
                    <div className="flex-1 p-4">College Roll</div>
                    <div className="flex-1 p-4">Email</div>
                    <div className="flex-1 p-4">Phone</div>
                    <div className="flex-1 p-4">Veg/NonVeg</div>
                    <div className="flex-1 p-4">Size</div>
                    <div className="flex-1 p-4">Food</div>
                    <div className="flex-1 p-4">Merch</div>
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