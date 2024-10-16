// src/utils/toggleFoodCollection.ts
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { FacultyData } from '@/lib/types/faculty';

export const markFoodCollectedfaculty = async (
    id: number,
    data: FacultyData[],
    setData: React.Dispatch<React.SetStateAction<FacultyData[]>>,
    setLoadingIds: React.Dispatch<React.SetStateAction<Set<number>>>,
    organizer_name: string,
    organizer_email: string,
) => {
    console.log(`Toggling food collection for volunteer ID: ${id}`);
    setLoadingIds((prev) => new Set(prev).add(id));

    const faculty = data.find((s) => s.id === id);
    if (!faculty) {
        console.error(`faculty with id ${id} not found in data.`);
        toast.error(`faculty with id ${id} not found.`);
        setLoadingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        return;
    }

    const newFoodStatus = true;
    console.log(`New food status for ${faculty.name}: ${newFoodStatus}`);

    const { error } = await supabase
        .from('faculties')
        .update({ food: newFoodStatus })
        .eq('id', id);

    if (error) {
        console.error(`Error updating food status for ID ${id}: ${error.message}`);
        toast.error(`Error updating food status: ${error.message}`);
    } else {
        console.log(`Successfully updated food status for ${faculty.name}`);
        setData((prevData) =>
            prevData.map((student) =>
                student.id === id ? { ...student, food: newFoodStatus } : student
            )
        );
        const foodStatus = newFoodStatus ? 'collected' : 'not collected';
        toast.success(`Food has been marked as ${foodStatus} for faculty: ${faculty.name}`);
        const { error: logError } = await supabase
            .from('logs')
            .insert({
                organizer_name: organizer_name || 'Unknown',
                email: organizer_email || 'Unknown',
                actionType: 'Food  collected for faculty',
                fresher_roll:  "no roll avaialbe"
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
