import { User } from "@supabase/supabase-js";

export interface IUser extends User {
    email: string;
    name: string;
    isAdmin: boolean;
    isGod: boolean;
    id: string;
} 