"use client"
import { useState, useEffect } from 'react'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; 
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User } from 'lucide-react';
import { useUser } from "@/lib/store/user";

const Contact = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const setUser = useUser((state) => state.setUser);
    const handleDropdownToggle = () => {
        setDropdownOpen(prev => !prev);
    };

    const [isMounted, setIsMounted] = useState(false); // Flag for client-side rendering

    useEffect(() => {
        setIsMounted(true); // Update mounted state
    }, []);

    const handleLogout = () => {
        setUser(null); // Clear user state
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").split("=")[0] + "=;expires=" + new Date().toUTCString() + ";path=/";
        });
        window.location.reload(); // Refresh the page
    };

    return (
        <div className="mt-8 bg-white rounded-lg px-10 p-6 ">
            <div className="absolute top-4 right-4 flex items-center p-5 mb-4">
                <Link href="/logs">
                    <Button variant="outline" size="sm" className="mr-2">
                        Logs
                    </Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" size="sm" className="mr-2">
                        Dashboard
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
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Developer Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium ">Name</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">Arnab Mondal</CardDescription>
                    </CardContent>
                </Card>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">CSE</CardDescription>
                    </CardContent>
                </Card>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">Year</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">2nd</CardDescription>
                    </CardContent>
                </Card>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">Phone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">+916291912672</CardDescription>
                    </CardContent>
                </Card>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">arnab18039836@gmail.com</CardDescription>
                    </CardContent>
                </Card>
            </div>
            
        </div>
    );
};

export default Contact;
