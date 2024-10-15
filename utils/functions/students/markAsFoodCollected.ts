// src/utils/markFoodCollected.ts
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export const markFoodCollected = async (
    id: number,
    studentStatus: { food: boolean, merch: boolean, college_roll :string } | null,
    setStudentStatus: React.Dispatch<React.SetStateAction<{ food: boolean, merch: boolean, college_roll: string } | null>>,
    organizer_name: string,
    organizer_email: string,
    college_roll: string
) => {
    if (!studentStatus) {
        toast.error('No student data found.');
        return;
    }

    if (studentStatus.food) {
        toast.error(`Food has already been collected.`);
        return;
    }

    const { error } = await supabase
        .from('people')
        .update({ food: true })
        .eq('id', id);
    
    const { error: logError } = await supabase
        .from('logs')
        .insert({
            organizer_name: organizer_name || 'Unknown',
            email: organizer_email || 'Unknown',
            actionType: 'food  collected',
            fresher_roll: college_roll || 'Unknown'
        });

    if (logError) {
        console.error("Error while adding the log: ", logError);
    }

    if (error) {
        toast.error(`Error marking food as collected: ${error.message}`);
    } else {
        toast.success(`Food marked as collected successfully.`);
        setStudentStatus((prevStatus) => prevStatus ? { ...prevStatus, food: true } : null);
    }
};
