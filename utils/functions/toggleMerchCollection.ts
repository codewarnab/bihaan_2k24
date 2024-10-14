// src/utils/toggleMerchandiseCollection.ts
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { StudentData } from '@/lib/types/student';


export const toggleMerchandiseCollection = async (
    id: number,
    data: StudentData[],
    setData: React.Dispatch<React.SetStateAction<StudentData[]>>,
    setLoadingIds: React.Dispatch<React.SetStateAction<Set<number>>>,
    organizer_name: string,
    organizer_email: string
) => {
    

    const student = data.find((s) => s.id === id);
    if (!student) {
        toast.error(`Student with id ${id} not found.`);
        setLoadingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        return;
    }

    // If merch is already collected, prevent toggling back
    if (student.merch) {
        toast.error(`Merchandise has already been collected for student: ${student.name}`);
        setLoadingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        return;
    }

    const newMerchStatus = true; 

    const { error } = await supabase
        .from('people') 
        .update({ merch: newMerchStatus })
        .eq('id', id);

    if (error) {
        toast.error(`Error updating merchandise status: ${error.message}`);
    } else {
        setData(prevData =>
            prevData.map(student =>
                student.id === id ? { ...student, merch: newMerchStatus } : student
            )
        );
        const { error } = await supabase
            .from('logs')
            .insert({
                organizer_name: organizer_name || 'Unknown', 
                email: organizer_email || 'Unknown', 
                actionType: 'merchandise collected', 
                fresher_roll: student.college_roll || 'Unknown' 
            });
        console.error("error while adding the logs ", error);
        toast.success(`Merchandise has been marked as collected for student: ${student.name}`);
    }

    setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
    });
};
