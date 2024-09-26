'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Search, Loader, User } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { toast } from 'sonner';
import { useUser } from "@/lib/store/user";

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
            department: department,
            attendance: seededRandom(seed * 3) > 0.5,
            isLoading: false,
        };
    });
}

export default function Dashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState(() => generateMockData(50000));
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

    const attendanceCount = useMemo(() => {
        return filteredData.filter(item => item.attendance).length;
    }, [filteredData]);

    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const toggleAttendance = useCallback((id: number) => {
        setData(prevData =>
            prevData.map(student =>
                student.id === id
                    ? { ...student, isLoading: true }
                    : student
            )
        );

        setTimeout(() => {
            setData(prevData =>
                prevData.map(student =>
                    student.id === id
                        ? {
                            ...student,
                            attendance: !student.attendance,
                            isLoading: false,
                        }
                        : student
                )
            );
            toast.success(`Attendance ${!data.find((s) => s.id === id)?.attendance ? 'marked' : 'revoked'} for student: ${data.find((s) => s.id === id)?.name}`);
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
                <div>{item.department}</div>
                <div>
                    <Button
                        variant={item.attendance ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleAttendance(item.id)}
                        disabled={item.isLoading}
                        className="w-24"
                    >
                        {item.isLoading ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : item.attendance ? (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Revoke
                            </>
                        ) : (
                            <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Mark
                            </>
                        )}
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
        // Clear cookies here if needed
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
                <div className="relative">
                    <div
                        className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold cursor-pointer"
                        onClick={handleDropdownToggle}
                    >
                        <User className="w-6 h-6" />
                    </div>
                    {isMounted && dropdownOpen && ( // Render dropdown only if mounted
                        <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
                            <div className="p-2 text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={handleLogout}>
                                Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Attendance Count Display */}
            <div className="mb-4 flex justify-start gap-4 text-lg">
                <span>Total Students: {filteredData.length}</span>
                <span>Marked Attendance: {attendanceCount}</span>
            </div>
            <div className="mb-6 relative">
                <Input
                    type="text"
                    placeholder="Search by name, college roll, phone, or email"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-10 py-6 text-lg"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
            </div>
            <div className="overflow-x-auto shadow-lg rounded-lg" style={{ height: '600px' }}>
                {filteredData.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-2xl text-gray-500">No student found</p>
                    </div>
                ) : (
                    <AutoSizer>
                        {({ height, width }) => (
                            <List
                                height={height}
                                itemCount={filteredData.length}
                                itemSize={70}
                                width={width}
                            >
                                {Row}
                            </List>
                        )}
                    </AutoSizer>
                )}
            </div>
        </div>
    );
}
