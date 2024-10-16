export type VolunteerData = {
    college_roll: string | null;
    dept: string | null;
    email: string;
    food: boolean | null;
    id: number;
    name: string | null;
    phone: number | null;
    veg_nonveg: string | null;
    status: "pending" | "sending" | "sent" | "failed";
    reason: string;
    qrcode: string;
    team:string;
};
