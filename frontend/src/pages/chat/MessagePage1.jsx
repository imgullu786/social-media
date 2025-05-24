import { useRecoilState} from 'recoil';
import { selectedConversationAtom } from '../../atoms/messageAtom';
import { useState , useEffect, useRef} from 'react';
import { UseSocket } from '../../context/socket';

import Conversation from '../../components/chat/Conversation';
import MessageContainer from '../../components/chat/MessageContainer';
import { IoArrowBack } from 'react-icons/io5';

const MessagesPage = () => {
  const {socket} = UseSocket();
  const [allMessages, setAllMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  const loadMessages = async (pageNum) => {
    if (isLoading || (!hasMore && pageNum !== 1)) return;
    setIsLoading(true);
    try {
      if (selectedConversation.mock) {
        setAllMessages([]);
        setHasMore(false);
        return;
      }
      const res = await fetch(`/api/messages/get/${selectedConversation.userId}?page=${pageNum}`);
      const data = await res.json();
      
      if (pageNum === 1) {
        setAllMessages(data.messages);
      } else {
        setAllMessages(prev => [...data.messages, ...prev]);
      }
      setHasMore(data.hasMore);
      setPage(data.currentPage);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadMessages(1);
  }, [selectedConversation.userId]);

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !isLoading) {
      prevScrollHeightRef.current = e.target.scrollHeight;
      loadMessages(page + 1);
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current && prevScrollHeightRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
      messagesContainerRef.current.scrollTop = scrollDiff;
    }
  }, [allMessages]);

  useEffect(() => {
    socket.on("newMessage", (message) => {
      if (selectedConversation._id === message.conversationId) {
        setAllMessages((prev) => [...prev, message]);
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }
    });

    return () => socket.off("newMessage");
  }, [socket, selectedConversation._id]);

  return (
    <div className="flex-[4_4_0] flex flex-col h-screen overflow-hidden border-r border-l border-gray-700 ">
      {selectedConversation._id !== '' && (
        <button
          className="absolute left-5 top-5 transform -translate-y-1/2 md:hidden"
          onClick={() => setSelectedConversation({ mock:false, _id: '', userId: '', username: '', fullname: '', profileImg: '' })}
        >
          <IoArrowBack className="text-white text-xl" />
        </button>
      )}
      <div className="p-4 font-bold border-b border-gray-600 bg-black flex justify-center items-center h-10 ">Messages</div>

      <div className="flex flex-row flex-1 overflow-hidden">
        <Conversation/>
        <MessageContainer 
          allMessages={allMessages} 
          setAllMessages={setAllMessages}
          messagesContainerRef={messagesContainerRef}
          handleScroll={handleScroll}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default MessagesPage;