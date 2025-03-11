import React,{ useEffect, useState } from "react";
import { adminAxiosInstance } from "../../../utils/axios";

const SearchComponent = ({ entity, placeholder, onFilter, extraParams = {} }) => {
    const [query, setQuery] = useState("");
  
    useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
        if (query.trim() === "") {
          onFilter(null);
        } else {
          adminAxiosInstance
            .get(`/search/${entity}`, { params: { q: query, ...extraParams } })
            .then((response) => onFilter(response.data))
            .catch((err) => console.error("Search error:", err));
        }
      }, 300);
  
      return () => clearTimeout(delayDebounceFn);
    }, [query, entity, extraParams]);
  
    return (
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || `Search ${entity}...`}
        className="p-2 rounded bg-gray-800 text-white outline-none"
      />
    );
  };
  
  export default SearchComponent;
  