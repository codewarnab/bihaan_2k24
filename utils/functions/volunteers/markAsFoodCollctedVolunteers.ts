// src/utils/toggleFoodCollection.ts
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { VolunteerData } from '@/lib/types/volunteer';

export const markFoodCollectedVolunteer = async (
    id: number,
    data: VolunteerData[],
    setData: React.Dispatch<React.SetStateAction<VolunteerData[]>>,
    setLoadingIds: React.Dispatch<React.SetStateAction<Set<number>>>,
    organizer_name: string,
    organizer_email: string,
    college_roll: string
) => {
    console.log(`Toggling food collection for volunteer ID: ${id}`);
    setLoadingIds((prev) => new Set(prev).add(id));

    const volunteer = data.find((s) => s.id === id);
    if (!volunteer) {
        console.error(`Student with id ${id} not found in data.`);
        toast.error(`Student with id ${id} not found.`);
        setLoadingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        return;
    }

    const newFoodStatus = true;
    console.log(`New food status for ${volunteer.name}: ${newFoodStatus}`);

    const { error } = await supabase
        .from('volunteers')
        .update({ food: newFoodStatus })
        .eq('id', id);

    if (error) {
        console.error(`Error updating food status for ID ${id}: ${error.message}`);
        toast.error(`Error updating food status: ${error.message}`);
    } else {
        console.log(`Successfully updated food status for ${volunteer.name}`);
        setData((prevData) =>
            prevData.map((student) =>
                student.id === id ? { ...student, food: newFoodStatus } : student
            )
        );
        const foodStatus = newFoodStatus ? 'collected' : 'not collected';
        toast.success(`Food has been marked as ${foodStatus} for student: ${volunteer.name}`);
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

    setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
    });
};
