import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import UserMenu from '@/components/nav';
import { Mail, Phone, User, BookOpen, Calendar } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className='relative mb-8'>
                    <UserMenu
                        firstLinkHref="/logs"
                        firstLinkLabel="Logs"
                        secondLinkHref="/"
                        secondLinkLabel="Dashboard"
                    />
                </div>
                <Card className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <CardTitle className="text-3xl font-bold text-center">Developer Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ContactItem icon={<User className="w-6 h-6" />} title="Name" description="Arnab Mondal" />
                            <ContactItem icon={<BookOpen className="w-6 h-6" />} title="Department" description="CSE" />
                            <ContactItem icon={<Calendar className="w-6 h-6" />} title="Year" description="2nd" />
                            <ContactItem icon={<Phone className="w-6 h-6" />} title="Phone" description="+916291912672" />
                            <ContactItem icon={<Mail className="w-6 h-6" />} title="Email" description="arnab18039836@gmail.com" className="md:col-span-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

interface ContactItemProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    className?: string;
}

const ContactItem = ({ icon, title, description, className = '' }: ContactItemProps) => (
    <Card className={`shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
        <CardContent className="flex items-center p-4">
            <div className="mr-4 text-blue-600">
                {icon}
            </div>
            <div>
                <CardTitle className="text-lg font-medium text-gray-800">{title}</CardTitle>
                <CardDescription className="text-gray-600">{description}</CardDescription>
            </div>
        </CardContent>
    </Card>
);

export default Contact;