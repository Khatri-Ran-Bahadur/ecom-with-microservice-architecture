import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "./useUser";

const useRequiredAuth = () => {
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading]);

    return {
        user,
        isLoading
    }
}

export default useRequiredAuth