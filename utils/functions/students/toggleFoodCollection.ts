// src/utils/toggleFoodCollection.ts
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { StudentData } from '@/lib/types/student';

export const toggleFoodCollection = async (
    id: number,
    data: StudentData[],
    setData: React.Dispatch<React.SetStateAction<StudentData[]>>,
    setLoadingIds: React.Dispatch<React.SetStateAction<Set<number>>>,
    organizer_name: string,
    organizer_email: string
) => {
    console.log(`Toggling food collection for student ID: ${id}`);
    setLoadingIds((prev) => new Set(prev).add(id));

    const student = data.find((s) => s.id === id);
    if (!student) {
        console.error(`Student with id ${id} not found in data.`);
        toast.error(`Student with id ${id} not found.`);
        setLoadingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        return;
    }


    const newFoodStatus = true

    const { error } = await supabase
        .from('people')
        .update({ food: newFoodStatus })
        .eq('id', id);

    if (error) {
        console.error(`Error updating food status for ID ${id}: ${error.message}`);
        toast.error(`Error updating food status: ${error.message}`);
    } else {
        console.log(`Successfully updated food status for ${student.name}`);
        setData((prevData) =>
            prevData.map((student) =>
                student.id === id ? { ...student, food: newFoodStatus } : student
            )
        );
        const foodStatus = newFoodStatus ? 'collected' : 'not collected';
        toast.success(`Food has been marked as ${foodStatus} for student: ${student.name}`);
        const { error } = await supabase
            .from('logs')
            .insert({
                organizer_name: organizer_name || 'Unknown',
                email: organizer_email || 'Unknown',
                actionType: 'food collected',
                fresher_roll: student.college_roll || 'Unknown'
            });
        console.error("error while adding the logs ", error);
    }

    setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
    });
};
    