import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import { isProtected } from "../utils/protected";

// fetch user data from API
const fetchUser = async (isLoggedIn: boolean): Promise<any> => {
    const config = isLoggedIn ? isProtected : {};
    const response = await axiosInstance.get(`/auth/api/logged-in-user`, config);
    return response.data.user;
}

// use query hook to fetch user data
export const useUser = (): { user: any; isLoading: boolean; isError: boolean } => {

    const { setLoggedIn, isLoggedIn } = useAuthStore();

    const { data: user, isPending, isError } = useQuery({
        queryKey: ["user"],
        queryFn: () => fetchUser(isLoggedIn),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
        //@ts-ignore
        onSuccess: () => {
            setLoggedIn(true);
        },
        onError: () => {
            setLoggedIn(false);
        }
    })

    return {
        user,
        isLoading: isPending,
        isError
    }
}

export default useUser;
