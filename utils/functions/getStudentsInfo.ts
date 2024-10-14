import { supabase } from "@/lib/supabase-client";

export async function getAllPeople() {
    const { data, error } = await supabase
        .from('people')
        .select("*");
    console.log(data);
    if (error) {
        console.error("Error fetching data from people table:", error);
        return null;
    }

    return data;
}
