import { supabase } from "@/lib/supabase-client";

export async function getAllPeople() {
    const { data, error } = await supabase
        .from('people')
        .select("*");
    if (error) {
        console.error("Error fetching data from people table:", error);
        return null;
    }

    console.log("People data fetched successfully:", data);
    return data;
}
