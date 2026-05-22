"use client"

import { useEffect, useState } from "react"

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

const getStoredLocation = () => {
    try {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
            return null;
        }
        const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
        if (!stored) return null;
        const parsedData = JSON.parse(stored);
        const expireTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        const isExpired = Date.now() - parsedData.timestamp > expireTime;
        return isExpired ? null : parsedData;
    } catch (e) {
        return null;
    }
}

const useLocationTracking = () => {
    const [location, setLocation] = useState<{ country: string, city: string } | null>(null);

    useEffect(() => {
        const stored = getStoredLocation();
        if (stored) {
            setLocation(stored);
            return;
        }

        fetch("http://ip-api.com/json").then(res => res.json()).then((data) => {
            const newLocation = {
                country: data?.country,
                city: data?.city,
                timestamp: Date.now(),
            }
            try {
                if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
                    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
                }
            } catch (e) {}
            setLocation(newLocation);
        }).catch(() => {
            console.log('Location tracking failed');
        })
    }, []);

    return location;
}

export default useLocationTracking;