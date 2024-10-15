import { supabase } from "@/lib/supabase-client";

export async function getFacultiesInfo() {
    const { data, error } = await supabase
        .from('faculties')
        .select("*");
    if (error) {
        console.error("Error fetching data from faculty table:", error);
        return null;
    }
    return data;

}