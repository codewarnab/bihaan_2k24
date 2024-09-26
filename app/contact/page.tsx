
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import UserMenu from '@/components/nav';

const Contact = () => {




    return (
        <div className="pt-10 bg-white rounded-lg px-10   ">
            <div className='relative '>
                <UserMenu
                    firstLinkHref="/logs"
                    firstLinkLabel="Logs"
                    secondLinkHref="/"
                    secondLinkLabel="Dashboard"
                />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Developer Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium ">Name</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">Arnab Mondal</CardDescription>
                    </CardContent>
                </Card>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">CSE</CardDescription>
                    </CardContent>
                </Card>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">Year</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">2nd</CardDescription>
                    </CardContent>
                </Card>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">Phone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">+916291912672</CardDescription>
                    </CardContent>
                </Card>
                <Card className='shadow-md'>
                    <CardHeader>
                        <CardTitle className="text-xl font-medium">Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-gray-600">arnab18039836@gmail.com</CardDescription>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};

export default Contact;
