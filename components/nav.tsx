
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { User } from 'lucide-react';
import { useUser } from "@/lib/store/user";

interface UserMenuProps {
    firstLinkHref: string;
    firstLinkLabel: string;
    secondLinkHref: string;
    secondLinkLabel: string;
}

export default function UserMenu({
    firstLinkHref,
    firstLinkLabel,
    secondLinkHref,
    secondLinkLabel,
}: UserMenuProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false); // Flag for client-side rendering
    const setUser = useUser((state) => state.setUser);
    const { user } = useUser();
    console.log(user);

    useEffect(() => {
        setIsMounted(true); // Update mounted state
    }, []);

    const handleDropdownToggle = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleLogout = () => {
        setUser(null); // Clear user state
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").split("=")[0] + "=;expires=" + new Date().toUTCString() + ";path=/";
        });
        window.location.reload(); // Refresh the page
    };

    return (
        <div className="absolute top-4 right-4  flex items-center">
            <Link href={firstLinkHref}>
                <Button variant="outline" size="sm" className="mr-2">
                    {firstLinkLabel}
                </Button>
            </Link>
            <Link href={secondLinkHref}>
                <Button variant="outline" size="sm" className="mr-2">
                    {secondLinkLabel}
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
    );
}
