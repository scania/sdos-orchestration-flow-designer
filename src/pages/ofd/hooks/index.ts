import axios from "axios";
import { useQuery } from "react-query";

export const useFetchClassDetails = (className: string) => {
  return useQuery(["classDetails", className], () =>
    axios
      .get(`http://localhost:3001/api/class-details?className=${className}`)
      .then((res) => res.data)
  );
};
