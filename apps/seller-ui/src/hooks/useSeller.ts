import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

// fetch user data from API
const fetchSeller = async () => {
    const response = await axiosInstance.get(`/api/logged-in-seller`);
    return response.data.seller;
}

// use query hook to fetch user data
export const useSeller = () => {
    const { data: seller, isError, refetch, isLoading } = useQuery({
        queryKey: ["seller"],
        queryFn: fetchSeller,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })

    return {
        seller,
        isLoading,
        isError,
        refetch
    }
}

export default useSeller;
