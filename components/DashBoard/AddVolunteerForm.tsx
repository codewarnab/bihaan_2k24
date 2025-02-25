'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { IUser } from '@/lib/types/user'
import { supabase } from '@/lib/supabase-client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

interface AddVolunteerDialogProps {
    user: IUser | null
}

const formSchema = z.object({
    college_roll: z.string().min(1, { message: "College roll is required." }),
    dept: z.enum(["CSE", "EE", "ECE", "IT", "BCA", "BSc", "CSE (AI&ML)"], { required_error: "Please select a department." }),
    email: z.string().email({ message: "Invalid email address." }),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    phone: z.string().regex(/^\d{10}$/, { message: "Phone number must be 10 digits." }),
    veg_nonveg: z.enum(["Veg", "Non-Veg"], { required_error: "Please select a preference." }),
})

type FormData = z.infer<typeof formSchema>

export default function AddVolunteerDialog({ user }: AddVolunteerDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            college_roll: '',
            dept: undefined,
            email: '',
            name: '',
            phone: '',
            veg_nonveg: undefined,
        },
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            const id = Date.now()
            const { error } = await supabase
                .from('volunteers')
                .insert([
                    {
                        ...data,
                        id: id,
                        phone: parseInt(data.phone, 10),
                        food: false,
                        status: 'pending',
                        reason: '',
                        qrcode: '',
                    }
                ])

            if (error) throw error

            toast.success('Volunteer added successfully!')
            const { error: logError } = await supabase
                .from('logs')
                .insert({
                    organizer_name: user?.name || 'Unknown',
                    email: user?.email || 'Unknown',
                    actionType: 'Added new volunteer',
                    volunteer_roll: data.college_roll
                });

            if (logError) {
                console.error("Error while adding the log: ", logError);
            }
            form.reset()
            setIsOpen(false)
        } catch (error) {
            console.error('Error adding volunteer:', error)
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        form.reset()
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add Volunteer</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Add New Volunteer</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new volunteer here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="college_roll"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>College Roll</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dept"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CSE">CSE</SelectItem>
                                                <SelectItem value="EE">EE</SelectItem>
                                                <SelectItem value="ECE">ECE</SelectItem>
                                                <SelectItem value="IT">IT</SelectItem>
                                                <SelectItem value="BCA">BCA</SelectItem>
                                                <SelectItem value="BSc">BSc</SelectItem>
                                                <SelectItem value="CSE (AI&ML)">CSE (AI&ML)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="tel" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="veg_nonveg"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Veg/Non-Veg</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select preference" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Veg">Veg</SelectItem>
                                                <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancel} className='pb-2' >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Adding...' : 'Add Volunteer'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}