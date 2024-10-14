// src/utils/markMerchandiseCollected.ts
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export const markMerchandiseCollected = async (
    id: number,
    studentStatus: { food: boolean, merch: boolean } | null,
    setStudentStatus: React.Dispatch<React.SetStateAction<{ food: boolean, merch: boolean, college_roll:string } | null>>,
    organizer_name: string,
    organizer_email: string,
    college_roll: string
) => {

    if (!studentStatus) {
        toast.error(`Student with id ${id} not found.`);
        return;
    }

    // Prevent toggling if merchandise is already collected
    if (studentStatus.merch) {
        toast.error(`Merchandise has already been collected for this student.`);
        return;
    }

    const newMerchStatus = true;  // Only allowing collection, not toggling back

    const { error } = await supabase
        .from('people')
        .update({ merch: newMerchStatus })
        .eq('id', id);

    if (error) {
        toast.error(`Error updating merchandise status: ${error.message}`);
    } else {
        // Update local state to reflect new merchandise status
        setStudentStatus(prevStatus => prevStatus ? { ...prevStatus, merch: newMerchStatus } : null);

        // Log action to `logs` table
        const { error: logError } = await supabase
            .from('logs')
            .insert({
                organizer_name: organizer_name || 'Unknown',
                email: organizer_email || 'Unknown',
                actionType: 'merchandise collected',
                fresher_roll: college_roll || 'Unknown'
            });

        if (logError) {
            console.error("Error while adding the log: ", logError);
        }

        toast.success(`Merchandise has been marked as collected for this student.`);
    }
};
