import { useEffect, useRef, useState } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import ConversationSkeleton from '../../components/skeletons/ConversationSkeleton';

import { IoSend } from "react-icons/io5";
import { IoArrowBack } from "react-icons/io5";
import {IoIosSearch} from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import { FaRegImage } from "react-icons/fa";


import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../../atoms/userAtom';
import { selectedConversationAtom } from '../../atoms/messageAtom';
import { UseSocket } from '../../context/socket';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MessagesPage = () => {
  const currentUser = useRecoilValue(userAtom);
  const {socket, onlineUsers} = UseSocket();
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
  const [allMessages, setAllMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [search, setSearch] = useState("");
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

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

  const { data: messages } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      if (selectedConversation.mock) return [];
      if (!selectedConversation._id) return [];
      try {
        const res = await fetch(`/api/messages/get/${selectedConversation?.userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        setAllMessages(data);
        return data;
      } catch (error) {
        console.error('Fetch error:', error.message);
        throw new Error(error.message);
      }
    },
    retry: false,
  });

  
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.refetchQueries('messages');
  }, [selectedConversation]);


  const sendMessage = () => async () => {
    if (!messageText && !img) return; 
    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedConversation.userId,
          message: messageText,
          img: img,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setMessageText('');
      setImg(null);
      queryClient.invalidateQueries('conversations')
    } catch (error) {
      console.error('Fetch error:', error.message);
    } finally {
      setSendingMessage(false)
    }
  }

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (newMessage) => {
        setAllMessages((prev) => [...prev, newMessage]);
      });
      
    }
    return () => {
      socket?.off('newMessage');
    };
  }, [messages]);

  const messageEndRef = useRef(null);
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, allMessages]);

  const { data: searchedUsers, isLoading: isSearchUserLoading} = useQuery({
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

  useEffect(() => {
	queryClient.invalidateQueries("searchedUsers");
  }, [search]);

  // Input Image to send
  const [img, setImg] = useState(null);
	const imgRef = useRef(null);
  const handleImgChange = (e) => {
    document.getElementById('my_modal_3').showModal()
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

  return (
    <div className="flex-[4_4_0] flex flex-col h-screen overflow-hidden border-r border-l border-gray-700 ">
      {/* Header */}
      {
        selectedConversation._id !== '' && (
          <button
            className="absolute left-5 top-5 transform -translate-y-1/2 md:hidden"
            onClick={() => setSelectedConversation({ mock:false, _id: '', userId: '', username: '', fullname: '', profileImg: '' })}
          >
            <IoArrowBack className="text-white text-xl" />
          </button>
        )
      }
      <div className="p-4 font-bold border-b border-gray-600 bg-black flex justify-center items-center h-10 ">Messages</div>

      <div className="flex flex-row flex-1 overflow-hidden">
        {/* Left Section - Conversation List */}
        <div className={`w-full md:w-1/3 text-white border-r border-gray-700 overflow-y-auto ${selectedConversation._id ? 'hidden md:block' : 'block'}`}>
          {/* Search Conversation */}
          <div className="flex justify-center items-center">
            <label className="input border border-gray-700 flex justify-between items-center w-full rounded-full m-2">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={handleSearchChange}
              />
              <IoIosSearch className="w-5 h-5 text-gray-400" />
            </label>
          </div>
          { !isSearchUserLoading &&
          searchedUsers?.map((user) => (
            <div
              className="flex items-center justify-between hover:bg-gray-800 cursor-pointer"
              key={user._id}
              onClick={() => {
                const conversationAlreadyExists = conversations?.some((conversation) => conversation.members[0]._id === user._id);
                setSelectedConversation({
                  mock: conversationAlreadyExists? false : true,
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
          {!isConversationLoading && search==='' && (
            <div>
              {conversations?.map((conversation) => (
                <div
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-800 ${selectedConversation?._id === conversation._id ? "bg-gray-800" : ""}`}
                  onClick={() => {
                    setSelectedConversation({
                      mock:false,
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
                    { onlineUsers.includes(conversation.members[0]._id) && (
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

        {/* Right Section - Conversation View */}
        <div className={`w-full md:w-2/3 text-white flex flex-col h-full ${selectedConversation._id ? 'block': 'hidden md:block'}`}>
          {selectedConversation._id === '' ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a conversation to start messaging
            </div>
          ) : (
            <>
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Conversation Header */}
                <div className="p-4 bg-black text-center flex-shrink-0">
                  <img
                    className="w-20 h-20 rounded-full mx-auto"
                    src={selectedConversation.profileImg || "/avatar-placeholder.png"}
                    alt="Avatar"
                  />
                  <div className="font-bold mt-2">{selectedConversation.fullname}</div>
                  <div className="text-sm text-gray-400">@{selectedConversation.username}</div>
                </div>

                {/* Messages */}
                <div className="flex-1 px-4">
                  {allMessages?.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message?.sender === currentUser._id ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      {message.text!='' && (<div className={`rounded-xl p-3 py-2 max-w-xs text-white ${message.sender === currentUser._id ? 'bg-blue-500' : 'bg-gray-700'}`}>
                        {message.text}
                      </div>)}
                      {message.img && (
                        <div className="relative w-72">
                          <img src={message.img} className={`w-72 mx-auto h-72 object-contain rounded`} />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              </div>
              {/* Input Field */}
              <div className="p-3 py-2 flex items-center flex-shrink-0 md:mb-0 mb-12 ">
                  <input
                    type="text"
                    className="flex-1 p-2 bg-gray-700 text-white rounded-full focus:outline-none"
                    placeholder="Type a message..."
                    value={messageText} onChange={(e) => setMessageText(e.target.value)}
                  />
                  <div className='flex gap-1 items-center'>
                    <FaRegImage
                      className='fill-primary w-6 h-6 cursor-pointer'
                      onClick={() => {
                        imgRef.current.click()
                      }}
                    />
                  </div>
                  <input type='file' hidden ref={imgRef} onChange={handleImgChange} />
                  <dialog id="my_modal_3" className="modal">
                    <div className="modal-box bg-gray-700">
                      <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                          onClick={()=>{
                            setImg(null);
                            imgRef.current.value = null;
                          }}
                        >✕</button>
                      </form>
                      {img && (
                        <div>
                          <div className='relative w-72 mx-auto'>
                            <img src={img} className='w-full mx-auto h-72 object-contain rounded' />
                          </div>
                          <button className="absolute bottom-2 -right-0 mx-2 p-2 bg-blue-500 rounded-lg flex items-center justify-center"
                            onClick={sendMessage()}
                          >
                            {sendingMessage && <LoadingSpinner size="xs" />}
                            {!sendingMessage && <IoSend className="text-white" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </dialog>
                  <button className="mx-2 p-2 bg-blue-500 rounded-lg flex items-center justify-center"
                    onClick={sendMessage()}
                  >
                    {sendingMessage && <LoadingSpinner size="xs" />}
                    {!sendingMessage && <IoSend className="text-white" />}
                  </button>
                </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
