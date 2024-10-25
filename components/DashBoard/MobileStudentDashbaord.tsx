'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader } from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { getAllPeople } from "@/utils/functions/students/getStudentsInfo"
import { StudentData } from "@/lib/types/student"
import { supabase } from '@/lib/supabase-client'
import { toggleFoodCollection } from '@/utils/functions/students/toggleFoodCollection'
import { toggleMerchandiseCollection } from "@/utils/functions/students/toggleMerchCollection"
import { IUser } from '@/lib/types/user'

interface StudentsDashboardProps {
    user: IUser | null
}

type CollectionType = 'food' | 'merch'

export default function MobileStudentsDashboard({ user }: StudentsDashboardProps) {
    const [data, setData] = useState<StudentData[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set())
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [collectionType, setCollectionType] = useState<CollectionType>('food')

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
            (item.college_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        )
    }, [data, searchTerm])

    const toggleCollection = (id: number) => {
        if (collectionType === 'food') {
            toggleFoodCollection(
                id, data, setData,
                setLoadingIds,
                user?.name || 'Unknown',
                user?.email || 'Unknown'
            )
        } else {
            toggleMerchandiseCollection(
                id, data, setData,
                setLoadingIds,
                user?.name || 'Unknown',
                user?.email || 'Unknown'
            )
        }
    }

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const item = filteredData[index]

        if (isLoading || data.length === 0) {
            return (
                <div style={style} className="flex items-center border-b hover:bg-gray-50 animate-pulse">
                    <div className="flex-1 p-2 bg-gray-200" />
                    <div className="flex-1 p-2 bg-gray-200" />
                    <div className="flex-1 p-2 bg-gray-200" />
                </div>
            )
        }

        return (
            <div style={style} className="flex items-center border-b hover:bg-gray-50">
                <div className="flex-1 p-2 truncate">{item.college_roll}</div>
                <div className="flex-1 p-2">
                    {collectionType === 'food' ? item.veg_nonveg : item.tshirt_size}
                </div>
                <div className="flex-1 p-2">
                    <Button
                        variant={item[collectionType] ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleCollection(item.id)}
                        disabled={loadingIds.has(item.id) || item[collectionType]!}
                        className="w-full"
                    >
                        {loadingIds.has(item.id) ? (
                            <Loader className="h-4 w-4 animate-spin" />
                        ) : item[collectionType] ? 'Collected' : 'Not Collected'}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div >
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                    type="text"
                    placeholder="Search by Roll Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                <Select
                    value={collectionType}
                    onValueChange={(value: CollectionType) => setCollectionType(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select collection type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="merch">Merchandise</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="overflow-x-auto">
                <div className="flex items-center font-bold border-b bg-gray-100 rounded-sm">
                    <div className="flex-1 p-2">Roll Number</div>
                    <div className="flex-1 p-2">{collectionType === 'food' ? 'Veg/NonVeg' : 'T-Shirt Size'}</div>
                    <div className="flex-1 p-2">{collectionType === 'food' ? 'Food' : 'Merch'}</div>
                </div>
                <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                height={height}
                                width={width}
                                itemCount={filteredData.length}
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