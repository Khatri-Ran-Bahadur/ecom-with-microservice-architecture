import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

export const useAdmin = () => {
  return useQuery({
    queryKey: ["admin"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/api/logged-in-admin");
      return response.data?.admin;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
