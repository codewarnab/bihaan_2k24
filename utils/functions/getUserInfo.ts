import { supabase } from "@/lib/supabase-client";

export async function getUserInfo() {
    const { data } = await supabase.auth.getSession()
    const userdetails = await supabase
        .from('users')
        .select("*").eq('id', data?.session?.user?.id);
    if (userdetails && userdetails.data && userdetails.data.length > 0) {
        console.log(userdetails.data[0]);
        return userdetails.data[0];
    }
    

}