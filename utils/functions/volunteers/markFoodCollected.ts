// src/utils/toggleFoodCollection.ts
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export const markFoodCollectedVolunteer = async (
    id: number,
    volunteerStatus: { food: boolean, college_roll: string } | null,
    setVolunteerStatus: React.Dispatch<React.SetStateAction<{ food: boolean, college_roll: string } | null>>,
    organizer_name: string,
    organizer_email: string,
    college_roll: string
) => {
    if (!volunteerStatus) {
        toast.error('No volunteer data found.');
        return;
    }

    if (volunteerStatus.food) {
        toast.error(`Food has already been collected.`);
        return;
    }

    const newFoodStatus = true;
    const { error } = await supabase
        .from('volunteers')
        .update({ food: newFoodStatus })
        .eq('id', id);

    if (error) {
        console.error(`Error updating food status for ID ${id}: ${error.message}`);
        toast.error(`Error updating food status: ${error.message}`);
    } else {
        
        toast.success(`Food marked as collected successfully.`);
        setVolunteerStatus((prevStatus) => prevStatus ? { ...prevStatus, food: newFoodStatus } : null);
        const { error: logError } = await supabase
            .from('logs')
            .insert({
                organizer_name: organizer_name || 'Unknown',
                email: organizer_email || 'Unknown',
                actionType: 'Food  collected for Volunteer',
                fresher_roll: college_roll || 'Unknown'
            });

        if (logError) {
            console.error("Error while adding the log: ", logError);
        }

    }

    
};
