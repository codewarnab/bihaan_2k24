"use client";

import { useState, useEffect, useCallback } from "react";
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
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
interface Log {
    id: number;
    created_at: string;
    organizer_name: string;
    email: string;
    actionType: string;
    fresher_roll: string;
}

export default function EventLogs() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    type ActionFilter = "all" | "food collected" | "merchandise collected" | "Food  collected for Volunteer" | "Food  collected for faculty" ;
    type TimeFilter = "all" | "last 1 hour" | "last 2 hours" | "last 3 hours" | "last 6 hours";

    const [selectedFilter, setSelectedFilter] = useState<ActionFilter>("all");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

    useEffect(() => {
        // Fetch initial logs
        fetchLogs();

        // Set up real-time subscription
        const subscription = supabase
            .channel('logs_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setLogs(prevLogs => [...prevLogs, payload.new as Log]);
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    
    const fetchLogs = async () => {
        const { data, error } = await supabase
        .from('logs')
            .select('*')
            .order('created_at', { ascending: false });

            if (error) {
            console.error('Error fetching logs:', error);
        } else {
            setLogs(data || []);
        }
    };

    const handleFilterChange = (filter: ActionFilter) => {
        setSelectedFilter(filter);
    };
    
    const handleTimeFilterChange = (timeFilter: TimeFilter) => {
        setTimeFilter(timeFilter);
    };
    
    const applyFilters = useCallback((actionFilter: ActionFilter, timeFilter: TimeFilter) => {
        const now = new Date();
    
        const filtered = logs.filter((log) => {
            const logDate = new Date(log.created_at);
            const timeDiffInHours = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);
            
            const matchesAction = actionFilter === "all" || log.actionType === actionFilter;
            const matchesTime =
                timeFilter === "all" ||
                (timeFilter === "last 1 hour" && timeDiffInHours <= 1) ||
                (timeFilter === "last 2 hours" && timeDiffInHours <= 2) ||
                (timeFilter === "last 3 hours" && timeDiffInHours <= 3) ||
                (timeFilter === "last 6 hours" && timeDiffInHours <= 6);
                
                return matchesAction && matchesTime;
            });
            
            setFilteredLogs(filtered);
        }, [logs]);
    
        useEffect(() => {
            applyFilters(selectedFilter, timeFilter);
        }, [applyFilters, logs, selectedFilter, timeFilter]);
        
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
                                checked={selectedFilter === "Food  collected for Volunteer"}
                                onCheckedChange={() => handleFilterChange("Food  collected for Volunteer")}
                            >
                                Food Collected for Volunteer
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={selectedFilter === "Food  collected for faculty"}
                                onCheckedChange={() => handleFilterChange("Food  collected for faculty")}
                            >
                                Food Collected for faculty
                            </DropdownMenuCheckboxItem>
                            
                            <DropdownMenuCheckboxItem
                                checked={selectedFilter === "merchandise collected"}
                                onCheckedChange={() => handleFilterChange("merchandise collected")}
                            >
                                Merchandise Collected
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
                    <div className="grid grid-cols-5 gap-4 px-6 py-4 font-semibold text-gray-700 border-b border-gray-200">
                        <div className="flex items-center"><User className="mr-2 h-4 w-4" /> Organizer Name</div>
                        <div className="flex items-center"><Mail className="mr-2 h-4 w-4" /> Email</div>
                        <div className="flex items-center"><Activity className="mr-2 h-4 w-4" /> Action Type</div>
                        <div className="flex items-center">Fresher/volunteer Roll</div>
                        <div className="flex items-center"><Clock className="mr-2 h-4 w-4" /> Timestamp</div>
                    </div>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No logs available.</div>
                    ) : (
                            <AnimatePresence initial={false}>
                                {filteredLogs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        <div className="text-sm font-medium text-gray-900">{log.organizer_name}</div>
                                        <div className="text-sm text-gray-600">{log.email}</div>
                                        <div className="text-sm text-gray-600">{log.actionType}</div>
                                        <div className="text-sm text-gray-600">{log.fresher_roll}</div>
                                        <div className="text-sm text-gray-600">{new Date(log.created_at).toLocaleString()}</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>  
                    )}
                </div>
            </div>
        </div>
    );
}