// src/utils/toggleMerchandiseCollection.ts
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { StudentData } from '@/lib/types/student';

export const toggleMerchandiseCollection = async (id: number, data: StudentData[], setData: React.Dispatch<React.SetStateAction<StudentData[]>>, setLoadingIds: React.Dispatch<React.SetStateAction<Set<number>>>) => {
    setLoadingIds(prev => new Set(prev).add(id));

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
    const newMerchStatus = !student.merch;

    const { error } = await supabase
        .from('people') // Replace with your actual table name
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
        const merchStatus = newMerchStatus ? 'collected' : 'not collected';
        toast.success(`Merchandise has been marked as ${merchStatus} for student: ${student.name}`);
    }

    setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
    });
};
