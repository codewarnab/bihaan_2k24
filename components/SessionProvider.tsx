"use client";
import { useUser } from '@/lib/store/user';
import { getUserInfo } from '@/utils/functions/getUserInfo';
import { useEffect, useCallback } from 'react';

const SessionProvider = () => {
    const setUser = useUser((state) => state.setUser);

    const readUserSession = useCallback(async () => {
        const userData = await getUserInfo();
        setUser(userData);
    }, [setUser]);

    useEffect(() => {
        readUserSession()
    }, [readUserSession])

  return <> </>
}

export default SessionProvider