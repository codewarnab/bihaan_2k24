"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Filter as FilterIcon, Clock, User, Mail, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/nav";

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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <UserMenu
                        firstLinkHref="/contact"
                        firstLinkLabel="Contact"
                        secondLinkHref="/"
                        secondLinkLabel="Dashboard"
                    />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Event Logs</h2>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto">
                                <FilterIcon className="mr-2 h-4 w-4" />
                                {selectedFilter === "all" ? "All Actions" : selectedFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
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
                            <Button variant="outline" className="w-full sm:w-auto">
                                <Clock className="mr-2 h-4 w-4" />
                                {timeFilter === "all" ? "All Time" : timeFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
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

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 px-6 py-4 font-semibold text-gray-700 border-b border-gray-200">
                        <div className="flex items-center"><User className="mr-2 h-4 w-4" /> Organizer Name</div>
                        <div className="flex items-center"><Mail className="mr-2 h-4 w-4" /> Email</div>
                        <div className="flex items-center"><Activity className="mr-2 h-4 w-4" /> Action</div>
                        <div className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Timestamp</div>
                    </div>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No logs available.</div>
                    ) : (
                        <div>
                            {filteredLogs.map((log, index) => (
                                <div key={index} className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                    <div className="text-sm font-medium text-gray-900">{log.name}</div>
                                    <div className="text-sm text-gray-600">{log.email}</div>
                                    <div className="text-sm text-gray-600">{log.action}</div>
                                    <div className="text-sm text-gray-600">{log.timestamp}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}