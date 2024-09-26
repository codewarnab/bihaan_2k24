"use client";
import { useState,useEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter as FilterIcon,User } from "lucide-react"; 
import Link from "next/link";
import { useUser } from "@/lib/store/user";

export default function EventLogs() {

    
    const logs = [
        { name: "Arnab", email: "arnab@example.com", action: "marked Student 1 (cse2024029) food collected", type: "food collected", timestamp: "2023-04-15 10:30 AM" },
        { name: "John Doe", email: "john@example.com", action: "marked Student 3 (ece2024023) food collected", type: "food collected", timestamp: "2023-04-16 2:45 PM" },
        { name: "Jane Smith", email: "jane@example.com", action: "marked Student 2 (ee2024029) merchandise not collected", type: "merchandise not collected", timestamp: "2023-04-17 9:20 AM" },
        { name: "Michael Brown", email: "michael@example.com", action: "marked Student 2 (it2024023) merchandise collected", type: "merchandise collected", timestamp: "2023-04-18 4:10 PM" },
    ];

    const [filteredLogs, setFilteredLogs] = useState(logs);
    type ActionFilter = "all" | "food collected" | "food not collected" | "merchandise collected" | "merchandise not collected";
    type TimeFilter = "all" | "last 1 hour" | "last 2 hours" | "last 3 hours" | "last 6 hours";
    
    const setUser = useUser((state) => state.setUser);
    const [isMounted, setIsMounted] = useState(false); // Flag for client-side rendering
    const [dropdownOpen, setDropdownOpen] = useState(false);
    useEffect(() => {
        setIsMounted(true); // Update mounted state
    }, []);

    const [selectedFilter, setSelectedFilter] = useState<ActionFilter>("all");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

    const handleFilterChange = (filter: ActionFilter) => {
        setSelectedFilter(filter);
        applyFilters(filter, timeFilter);
    };

    const handleTimeFilterChange = (timeFilter: TimeFilter) => {
        setTimeFilter(timeFilter);
        applyFilters(selectedFilter, timeFilter);
    };

    const applyFilters = (actionFilter: ActionFilter, timeFilter: TimeFilter) => {
        const now = new Date();

        const filtered = logs.filter((log) => {
            const logDate = new Date(log.timestamp);
            const timeDiffInHours = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);

            const matchesAction = actionFilter === "all" || log.type === actionFilter;
            const matchesTime =
                timeFilter === "all" ||
                (timeFilter === "last 1 hour" && timeDiffInHours <= 1) ||
                (timeFilter === "last 2 hours" && timeDiffInHours <= 2) ||
                (timeFilter === "last 3 hours" && timeDiffInHours <= 3) ||
                (timeFilter === "last 6 hours" && timeDiffInHours <= 6);

            return matchesAction && matchesTime;
        });

        setFilteredLogs(filtered);
    };

    const handleLogout = () => {
        setUser(null); // Clear user state
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").split("=")[0] + "=;expires=" + new Date().toUTCString() + ";path=/";
        });
        window.location.reload(); 
    };
    const handleDropdownToggle = () => {
        setDropdownOpen(prev => !prev);
    };
    return (
        <div className="p-6 mx-4 md:mx-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Event Logs</h2>
            <div className="absolute top-4 right-4 flex items-center">
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
            <div className="flex space-x-4 mb-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto rounded-lg p-2">
                            <FilterIcon className="mr-2" />
                            {selectedFilter === "all" ? "All Actions" : selectedFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-full md:w-auto">
                        <DropdownMenuLabel>Filter by Action:</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={selectedFilter === "all"}
                            onCheckedChange={() => handleFilterChange("all")}
                        >
                            All Actions
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={selectedFilter === "food collected"}
                            onCheckedChange={() => handleFilterChange("food collected")}
                        >
                            Food Collected
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={selectedFilter === "food not collected"}
                            onCheckedChange={() => handleFilterChange("food not collected")}
                        >
                            Food Not Collected
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={selectedFilter === "merchandise collected"}
                            onCheckedChange={() => handleFilterChange("merchandise collected")}
                        >
                            Merchandise Collected
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={selectedFilter === "merchandise not collected"}
                            onCheckedChange={() => handleFilterChange("merchandise not collected")}
                        >
                            Merchandise Not Collected
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto rounded-lg p-2">
                            <FilterIcon className="mr-2" />
                            {timeFilter === "all" ? "All Time" : timeFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-full md:w-auto">
                        <DropdownMenuLabel>Filter by Time:</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={timeFilter === "all"}
                            onCheckedChange={() => handleTimeFilterChange("all")}
                        >
                            All Time
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={timeFilter === "last 1 hour"}
                            onCheckedChange={() => handleTimeFilterChange("last 1 hour")}
                        >
                            Last 1 Hour
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={timeFilter === "last 2 hours"}
                            onCheckedChange={() => handleTimeFilterChange("last 2 hours")}
                        >
                            Last 2 Hours
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={timeFilter === "last 3 hours"}
                            onCheckedChange={() => handleTimeFilterChange("last 3 hours")}
                        >
                            Last 3 Hours
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={timeFilter === "last 6 hours"}
                            onCheckedChange={() => handleTimeFilterChange("last 6 hours")}
                        >
                            Last 6 Hours
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="overflow-x-auto">
                <div className="grid grid-cols-4 gap-4 px-6 py-4 font-bold border-b">
                    <div>Organizer Name</div>
                    <div>Email</div>
                    <div>Action</div>
                    <div>Timestamp</div>
                </div>
                {filteredLogs.length === 0 ? (
                    <div className="text-center py-4">No logs available.</div>
                ) : (
                    <div>
                        {filteredLogs.map((log, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 px-6 py-4 border-b hover:bg-gray-50">
                                <div className="text-sm font-medium text-gray-900">{log.name}</div>
                                <div className="text-sm text-gray-800">{log.email}</div>
                                <div className="text-sm text-gray-800">{log.action}</div>
                                <div className="text-sm text-gray-800">{log.timestamp}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
