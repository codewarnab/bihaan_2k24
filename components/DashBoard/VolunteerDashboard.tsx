'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Loader } from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { getVolunteersInfo } from '@/utils/functions/volunteers/getVolunteeersInfo'
import { VolunteerData } from '@/lib/types/volunteer'
import { supabase } from '@/lib/supabase-client'
import { markFoodCollectedVolunteer } from "@/utils/functions/volunteers/markAsFoodCollctedVolunteers"
import { IUser } from '@/lib/types/user'

interface VolunteersDashboardProps {
    searchTerm: string
    user: IUser | null
}

export default function VolunteersDashboard({ searchTerm ,user}: VolunteersDashboardProps) {
    const [data, setData] = useState<VolunteerData[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [foodLoadingIds, setFoodLoadingIds] = useState<Set<number>>(new Set())
    

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
        if(!searchTerm) return data
        return data.filter(item =>
            (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.college_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.phone?.toString().includes(searchTerm) ?? false) ||
            (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        )
    }, [data, searchTerm])

    const totalVolunteers = filteredData.length
    const foodCollected = filteredData.filter(item => item.food).length

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
                <div className="flex-1 p-4">{item.name}</div>
                <div className="flex-1 p-4 truncate">{item.college_roll}</div>
                <div className="flex-1 p-4 truncate">{item.email}</div>
                <div className="flex-1 p-4 truncate">{item.phone}</div>
                <div className="flex-1 p-4">{item.team}</div>
                <div className="flex-1 p-4">{item.veg_nonveg}</div>
                <div className="flex-1 p-4">
                    <Button
                        variant={item.food ? "outline" : "default"}
                        size="sm"
                        onClick={() => markFoodCollectedVolunteer(
                            item.id,
                            data,
                            setData,
                            setFoodLoadingIds,
                            user?.name || 'Unknown',
                            user?.email || 'Unknown',
                            item.college_roll || 'Unknown'
                        )}
                        disabled={foodLoadingIds.has(item.id) || item.food!}
                        className="w-28"
                    >
                        {foodLoadingIds.has(item.id) ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.food ? 'Collected' : 'Not Collected'}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="text-lg mb-4">
                Total Volunteers: {totalVolunteers}, Food Collected: {foodCollected}
            </div>
            <div className="overflow-x-auto">
                <div className="flex items-center font-bold border-b bg-gray-100 rounded-sm">
                    <div className="flex-1 p-4">Name</div>
                    <div className="flex-1 p-4">College Roll</div>
                    <div className="flex-1 p-4">Email</div>
                    <div className="flex-1 p-4">Phone</div>
                    <div className="flex-1 p-4">Team</div> 
                    <div className="flex-1 p-4">Veg/NonVeg</div>
                    <div className="flex-1 p-4">Food</div>
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