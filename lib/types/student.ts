export type StudentData = {
    college_roll: string | null;
    dept: string | null;
    email: string ;
    food: boolean | null;
    id: number;
    merch: boolean | null;
    name: string | null;
    phone: number | null;
    tshirt_size: string | null;
    veg_nonveg: string | null;
    status: "pending" | "sending" | "sent" | "failed";
    reason: string;
};
