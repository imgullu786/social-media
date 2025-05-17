import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { IoIosSearch } from "react-icons/io";
import { FaCheck } from "react-icons/fa";

import { selectedConversationAtom } from "../../atoms/messageAtom"
import ConversationSkeleton from "../skeletons/ConversationSkeleton";
import { UseSocket } from "../../context/socket";
import userAtom from "../../atoms/userAtom";

function Conversation() {
    const currentUser = useRecoilValue(userAtom)
    const {onlineUsers} = UseSocket();
    const [search, setSearch] = useState("");
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);


    const { data: searchedUsers, isLoading: isSearchUserLoading } = useQuery({
        queryKey: ["searchedUsers", search],
        queryFn: async () => {
            try {
                if (search.trim() === "") {
                    return []; // Return empty array if search is empty
                }
                const response = await fetch(`/api/user/search?username=${search}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Something went wrong!");
                }
                // filter the current user from the search results
                return data.filter((user) => user._id !== currentUser._id);
            } catch (error) {
                throw new Error(error);
            }
        },
        retry: false,
        enabled: search.trim() !== ""
    });

    const queryClient = useQueryClient();
    useEffect(() => {
        queryClient.invalidateQueries("searchedUsers");
    }, [search]);

    const { data: conversations, isLoading: isConversationLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            try {
                const res = await fetch('/api/messages/conversations');
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Something went wrong');

                return data;
            } catch (error) {
                console.error('Fetch error:', error.message);
                throw new Error(error.message);
            }
        },
    });


    return (
        <div className={`w-full md:w-1/3 text-white border-r border-gray-700 overflow-y-auto ${selectedConversation._id ? 'hidden md:block' : 'block'}`}>
            {/* Search Conversation */}
            <div className="flex justify-center items-center">
                <label className="input border border-gray-700 flex justify-between items-center w-full rounded-full m-2">
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value) }
                    />
                    <IoIosSearch className="w-5 h-5 text-gray-400" />
                </label>
            </div>
            {!isSearchUserLoading &&
                searchedUsers?.map((user) => (
                    <div
                        className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
                        key={user._id}
                        onClick={() => {
                            const conversationAlreadyExists = conversations?.some((conversation) => conversation.members[0]._id === user._id);
                            setSelectedConversation({
                                mock: conversationAlreadyExists ? false : true,
                                _id: Date.now(),
                                userId: user._id,
                                username: user.username,
                                fullname: user.fullname,
                                profileImg: user.profileImg,
                            });
                        }}
                    >
                        <div className="flex gap-2 items-center px-3 py-2">
                            <div className="avatar">
                                <div className="w-10 rounded-full">
                                    <img src={user.profileImg || "/avatar-placeholder.png"} />
                                </div>
                            </div>
                            <div className="ml-3 flex flex-col">
                                <span className="font-semibold tracking-tight truncate w-full">
                                    {user.fullname}
                                </span>
                                <span className="text-sm text-slate-500">
                                    @{user.username}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            {(isConversationLoading || isSearchUserLoading) && (
                <>
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                </>
            )}

            {/* Existing Conversation */}
            {!isConversationLoading && search === '' && (
                <div>
                    {conversations?.map((conversation) => (
                        <div
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-800 ${selectedConversation?._id === conversation._id ? "bg-gray-800" : ""}`}
                            onClick={() => {
                                setSelectedConversation({
                                    mock: false,
                                    _id: conversation._id,
                                    userId: conversation.members[0]._id,
                                    username: conversation.members[0].username,
                                    fullname: conversation.members[0].fullname,
                                    profileImg: conversation.members[0].profileImg,
                                });
                            }}
                            key={conversation._id}
                        >
                            <div className="flex items-center">
                                <img
                                    className="w-10 h-10 rounded-full"
                                    src={conversation.members[0].profileImg || "/avatar-placeholder.png"}
                                    alt="Avatar"
                                />
                                {onlineUsers.includes(conversation.members[0]._id) && (
                                    <span className="absolute w-3.5 h-3.5 bg-green-500 rounded-full transform translate-x-7 -translate-y-3"></span>
                                )}
                                <div className="ml-3">
                                    <div className="font-bold truncate">{conversation.members[0]?.fullname}</div>
                                    <div className="text-sm text-gray-500 flex items-center space-x-1 truncate">
                                        {conversation.lastMessage.sender === currentUser?._id && <FaCheck />}
                                        <span className="truncate">{conversation.lastMessage?.text}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Conversation