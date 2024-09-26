'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader, User } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { toast } from 'sonner';
import { useUser } from "@/lib/store/user";
import Link from 'next/link';

// Deterministic random number generator
function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Mock data generation function
const generateMockData = (count: number) => {
    const departments = ['CSE', 'ECE', 'ME', 'CE', 'EE'];
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
            isLoading: false,
            foodLoading: false,
            merchandiseLoading: false,
        };
    });
}

export default function Dashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState(() => generateMockData(800));
    const setUser = useUser((state) => state.setUser);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false); // Flag for client-side rendering

    useEffect(() => {
        setIsMounted(true); // Update mounted state
    }, []);

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
            <div style={style} className="grid grid-cols-6 gap-4 px-6 py-4 border-b hover:bg-gray-50">
                <div>{item.name}</div>
                <div>{item.collegeRoll}</div>
                <div>{item.email}</div>
                <div>{item.phone}</div>
                <div>
                    <Button
                        variant={item.foodCollected ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleFoodCollection(item.id)}
                        disabled={item.foodLoading}
                        className="w-24"
                    >
                        {item.foodLoading ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.foodCollected ? 'Collected' : 'Not Collected'}
                    </Button>
                </div>
                <div>
                    <Button
                        variant={item.merchandiseCollected ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleMerchandiseCollection(item.id)}
                        disabled={item.merchandiseLoading}
                        className="w-24"
                    >
                        {item.merchandiseLoading ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.merchandiseCollected ? 'Collected' : 'Not Collected'}
                    </Button>
                </div>
            </div>
        );
    };

    const handleDropdownToggle = () => {
        setDropdownOpen(prev => !prev);
    };

    const handleLogout = () => {
        setUser(null); // Clear user state
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").split("=")[0] + "=;expires=" + new Date().toUTCString() + ";path=/";
        });
        window.location.reload(); // Refresh the page
    };

    return (
        <div className="container mx-auto p-8 relative">
            <h1 className="text-3xl font-bold mb-6">Bihaan 2024 Dashboard</h1>
            {/* User Avatar */}
            <div className="absolute top-4 right-4 flex items-center">
                <Link href="/logs">
                    <Button variant="outline" size="sm" className="mr-2">
                        Logs
                    </Button>
                </Link>
                <Link href="/contact">
                    <Button variant="outline" size="sm" className="mr-2">
                        contact
                    </Button>
                </Link>
                <div className="relative">
                    <div
                        className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold cursor-pointer"
                        onClick={handleDropdownToggle}
                    >
                        <User className="w-6 h-6" />
                    </div>
                    {isMounted && dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg">
                            <div
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                onClick={handleLogout}
                            >
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mb-6">
                {/* Total Students, Food Collected, and Merchandise Collected */}
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
            <div className="grid grid-cols-6 gap-4 px-6 py-4 font-bold border-b">
                <div>Name</div>
                <div>College Roll</div>
                <div>Email</div>
                <div>Phone</div>
                <div>Food </div>
                <div>Merchandise </div>
            </div>
            <div className="mt-4" style={{ height: '70vh' }}>
                <AutoSizer>
                    {({ height, width }) => (
                        <List
                            height={height}
                            itemCount={filteredData.length}
                            itemSize={50}
                            width={width}
                        >
                            {Row}
                        </List>
                    )}
                </AutoSizer>
            </div>
        </div>
    );
}
