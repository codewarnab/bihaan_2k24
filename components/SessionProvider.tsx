"use client";
import { useUser } from '@/lib/store/user';
import { getUserInfo } from '@/utils/functions/getUserInfo';
import { useEffect } from 'react';

const SessionProvider = () => {
    const setUser = useUser((state) => state.setUser);

    const readUserSession = async () => {
        const userData = await getUserInfo();
        setUser(userData);
    }

    useEffect(() => {
        readUserSession()
    }, [])

  return <> </>
}

export default SessionProvider