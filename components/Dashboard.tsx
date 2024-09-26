'use client';

import { useState, useMemo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { toast } from 'sonner';

import UserMenu from './nav';

// Deterministic random number generator
function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Mock data generation function
const generateMockData = (count: number) => {
    const departments = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
    const foodPreferences = ['Veg', 'Non-Veg'];
    const sizes = ['S', 'M', 'L', 'XL'];
    return Array.from({ length: count }, (_, i) => {
        const seed = i + 1;
        const department = departments[Math.floor(seededRandom(seed) * departments.length)];
        return {
            id: i + 1,
            name: `Student ${i + 1}`,
            collegeRoll: `${department.toLowerCase()}2024${String(i + 1).padStart(3, '0')}`,
            email: `${department.toLowerCase()}2024${String(i + 1).padStart(3, '0')}@rcciit.org.in`,
            phone: `+91${Math.floor(seededRandom(seed * 2) * 9000000000 + 1000000000)}`,
            attendance: seededRandom(seed * 3) > 0.5,
            foodCollected: false,
            merchandiseCollected: false,
            foodPreference: foodPreferences[Math.floor(seededRandom(seed * 4) * foodPreferences.length)],
            merchandiseSize: sizes[Math.floor(seededRandom(seed * 5) * sizes.length)],
            isLoading: false,
            foodLoading: false,
            merchandiseLoading: false,
        };
    });
}

export default function Dashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState(() => generateMockData(800));

    const filteredData = useMemo(() => {
        return data.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.collegeRoll.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.phone.includes(searchTerm) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    const totalStudents = filteredData.length;
    const foodCollected = filteredData.filter(item => item.foodCollected).length;
    const merchandiseCollected = filteredData.filter(item => item.merchandiseCollected).length;

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const toggleFoodCollection = useCallback((id: number) => {
        setData(prevData =>
            prevData.map(student =>
                student.id === id
                    ? { ...student, foodLoading: true }
                    : student
            )
        );

        setTimeout(() => {
            setData(prevData =>
                prevData.map(student =>
                    student.id === id
                        ? {
                            ...student,
                            foodCollected: !student.foodCollected,
                            foodLoading: false,
                        }
                        : student
                )
            );
            const foodStatus = data.find((s) => s.id === id)?.foodCollected ? 'not collected' : 'collected';
            toast.success(`Food has been marked as ${foodStatus} for student: ${data.find((s) => s.id === id)?.name}`);
        }, 1000);
    }, [data]);

    const toggleMerchandiseCollection = useCallback((id: number) => {
        setData(prevData =>
            prevData.map(student =>
                student.id === id
                    ? { ...student, merchandiseLoading: true }
                    : student
            )
        );

        setTimeout(() => {
            setData(prevData =>
                prevData.map(student =>
                    student.id === id
                        ? {
                            ...student,
                            merchandiseCollected: !student.merchandiseCollected,
                            merchandiseLoading: false,
                        }
                        : student
                )
            );
            const merchStatus = data.find((s) => s.id === id)?.merchandiseCollected ? 'not collected' : 'collected';
            toast.success(`Merchandise has been marked as ${merchStatus} for student: ${data.find((s) => s.id === id)?.name}`);
        }, 1000);
    }, [data]);

    const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
        const item = filteredData[index];
        return (
            <div style={{ ...style, width: '1160px' }} className="flex items-center border-b hover:bg-gray-50">
                <div className="w-[150px] p-4 ">{item.name}</div>
                <div className="w-[130px] p-4 truncate">{item.collegeRoll}</div>
                <div className="w-[250px] p-4 truncate">{item.email}</div>
                <div className="w-[180px] p-4 truncate">{item.phone}</div>
                <div className="w-[100px] p-4 ">{item.foodPreference}</div>
                <div className="w-[50px] p-4 ">{item.merchandiseSize}</div>
                <div className="w-[150px] p-4">
                    <Button
                        variant={item.foodCollected ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleFoodCollection(item.id)}
                        disabled={item.foodLoading}
                        className="w-28"
                    >
                        {item.foodLoading ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.foodCollected ? 'Collected' : 'Not Collected'}
                    </Button>
                </div>
                <div className="w-[150px] p-4">
                    <Button
                        variant={item.merchandiseCollected ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleMerchandiseCollection(item.id)}
                        disabled={item.merchandiseLoading}
                        className="w-28"
                    >
                        {item.merchandiseLoading ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.merchandiseCollected ? 'Collected' : 'Not Collected'}
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
                    <div className="w-[100px] p-4">Veg/Non</div>
                    <div className="w-[70px] p-4">Size</div>
                    <div className="w-[130px] p-4">Food</div>
                    <div className="w-[150px] p-4">Merchandise</div>
                </div>
                <div className="mt-4" style={{ height: '70vh' }}>
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                height={height}
                                itemCount={filteredData.length}
                                itemSize={60}
                                width={width}
                                innerElementType="div"
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
