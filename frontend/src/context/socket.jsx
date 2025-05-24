import { createContext, useContext, useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import userAtom from "../atoms/userAtom";

const SocketContext = createContext();

export const UseSocket = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const user = useRecoilValue(userAtom);
    
    useEffect(()=>{
        const socket = io("http://localhost:5000",{
            query:{
                userId: user?._id
            }
        });
        setSocket(socket);
        socket.on('getOnlineUsers', (users) => {
            setOnlineUsers(users);
        });
        return () => socket && socket.close();
    },[user?._id,]);
    console.log(onlineUsers);


    return (
        <SocketContext.Provider value={{
            socket,
            onlineUsers,
        }}>
            {children}
        </SocketContext.Provider>
    );
};