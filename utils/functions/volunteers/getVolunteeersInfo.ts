import { supabase } from "@/lib/supabase-client";

export async function getVolunteersInfo() {
    const { data, error } = await supabase
        .from('volunteers')
        .select("*");
    if (error) {
        console.error("Error fetching data from volunteers table:", error);
        return null;
    }
    console.log("Volunteers data fetched successfully:", data);
    return data;

}