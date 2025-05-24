import { useRecoilState} from 'recoil';
import { selectedConversationAtom } from '../../atoms/messageAtom';
import { useState , useEffect} from 'react';
import { UseSocket } from '../../context/socket';

import Conversation from '../../components/chat/Conversation';
import MessageContainer from '../../components/chat/MessageContainer';
import { IoArrowBack } from 'react-icons/io5';

const MessagesPage = () => {
  const {socket} = UseSocket();
  const [allMessages, setAllMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);

  useEffect(() => {
		const getMessages = async () => {
			setAllMessages([]);
			try {
				if (selectedConversation.mock) return;
				const res = await fetch(`/api/messages/get/${selectedConversation.userId}`);
				const data = await res.json();
				if (data.error) {
					throw new Error(data.error || 'Something went wrong')
				}
				setAllMessages(data);
			} catch (error) {
				console.log(error);
			}
		};

		getMessages();
	}, [selectedConversation.userId, selectedConversation.mock]);

  useEffect(() => {
        socket.on("newMessage", (message) => {
            if (selectedConversation._id === message.conversationId) {
                setAllMessages((prev) => [...prev, message]);
            }

            setSelectedConversation((prev) => {
                const updatedConversations = prev.map((conversation) => {
                    if (conversation._id === message.conversationId) {
                        return {
                            ...conversation,
                            lastMessage: {
                                text: message.text,
                                sender: message.sender,
                            },
                        };
                    }
                    return conversation;
                });
                return updatedConversations;
            });
        });

        return () => socket.off("newMessage");
    }, [socket, selectedConversation, setSelectedConversation]);

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
        <Conversation/>
        <MessageContainer allMessages={allMessages} setAllMessages={setAllMessages}/>
      </div>
    </div>
  );
};

export default MessagesPage;
