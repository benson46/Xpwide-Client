import axios from "axios";

export const axiosInstance = axios.create({
    baseURL:"http://localhost:5000/api/user",
    withCredentials:true, // send cookies to the server
})


export const adminAxiosInstance = axios.create({
    baseURL:"http://localhost:5000/api/admin",
    withCredentials:true, 
})

export const googleAxiosInstance = axios.create({
    baseURL:"http://localhost:5000/api/google",
    withCredentials:true, 
})