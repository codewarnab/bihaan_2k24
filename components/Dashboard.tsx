"use client";
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import UserMenu from './nav';
import { getAllPeople } from "@/utils/functions/getStudentInfo";
import { StudentData } from "@/lib/types/student";
import { toggleFoodCollection } from "@/utils/functions/toggleFoodCollection";
import { toggleMerchandiseCollection } from "@/utils/functions/toggleMerchCollection";


export default function Dashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState<StudentData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [foodLoadingIds, setFoodLoadingIds] = useState<Set<number>>(new Set());
    const [merchLoadingIds, setMerchLoadingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchData = async () => {
            const peopleData = await getAllPeople();
            if (peopleData) {
                setData(peopleData);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(item =>
            (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.college_roll?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (item.phone?.toString().includes(searchTerm) ?? false) ||
            (item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        );
    }, [data, searchTerm]);

    const totalStudents = filteredData.length;
    const foodCollected = filteredData.filter(item => item.food).length;
    const merchandiseCollected = filteredData.filter(item => item.merch).length;

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);



   

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const item = filteredData[index];

        if (isLoading || data.length == 0) {
            return (
                <div style={{ ...style, width: '100%' }} className="flex items-center border-b hover:bg-gray-50 animate-pulse">
                    <div className="w-[150px] p-4 bg-gray-200 " />
                    <div className="w-[130px] p-4 bg-gray-200" />
                    <div className="w-[250px] p-4 bg-gray-200" />
                    <div className="w-[180px] p-4 bg-gray-200" />
                    <div className="w-[100px] p-4 bg-gray-200" />
                    <div className="w-[50px] p-4 bg-gray-200" />
                    <div className="w-[150px] p-4 bg-gray-200" />
                    <div className="w-[150px] p-4 bg-gray-200" />
                </div>
            );
        }

        // Render actual data when not loading
        return (
            <div style={{ ...style, width: '100%' }} className="flex items-center border-b hover:bg-gray-50">
                <div className="w-[150px] p-4">{item.name}</div>
                <div className="w-[130px] p-4 truncate">{item.college_roll}</div>
                <div className="w-[250px] p-4 truncate">{item.email}</div>
                <div className="w-[180px] p-4 truncate">{item.phone}</div>
                <div className="w-[100px] p-4">{item.veg_nonveg}</div>
                <div className="w-[50px] p-4">{item.tshirt_size}</div>
                <div className="w-[150px] p-4">
                    <Button
                        variant={item.food ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleFoodCollection(item.id, data, setData, setFoodLoadingIds)}
                        disabled={foodLoadingIds.has(item.id)}
                        className="w-28"
                    >
                        {foodLoadingIds.has(item.id) ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.food ? 'Collected' : 'Not Collected'}
                    </Button>
                </div>
                <div className="w-[150px] p-4">
                    <Button
                        variant={item.merch ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleMerchandiseCollection(item.id, data, setData, setMerchLoadingIds)}
                        disabled={merchLoadingIds.has(item.id)}
                        className="w-28"
                    >
                        {merchLoadingIds.has(item.id) ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.merch ? 'Collected' : 'Not Collected'}
                    </Button>
                </div>
            </div>
        );
    };


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
                <div className="text-lg mb-4">
                    Total Students: {totalStudents}, Food Collected: {foodCollected}, Merchandise Collected: {merchandiseCollected}
                </div>
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
            <div className="overflow-x-auto">
                <div className="flex items-center font-bold border-b bg-gray-100 rounded-sm">
                    <div className="w-[150px] p-4">Name</div>
                    <div className="w-[150px] p-4">College Roll</div>
                    <div className="w-[250px] p-4">Email</div>
                    <div className="w-[180px] p-4">Phone</div>
                    <div className="w-[100px] p-4">Veg/NonVeg</div>
                    <div className="w-[50px] p-4">Size</div>
                    <div className="w-[150px] p-4">Food</div>
                    <div className="w-[150px] p-4">Merch</div>
                </div>
                <div style={{ height: '500px', width: '100%' }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                height={height}
                                width={width}
                                itemCount={totalStudents}
                                itemSize={50} // Height of each row
                            >
                                {Row}
                            </List>
                        )}
                    </AutoSizer>
                </div>
            </div>
        </div>
    );
}
