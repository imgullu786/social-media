import { useRef, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import userAtom from "../../atoms/userAtom.js"
import { selectedConversationAtom } from "../../atoms/messageAtom.js";

function Message({ allMessages }) {
    const currentUser = useRecoilValue(userAtom);
    const [selectedConversation] = useRecoilState(selectedConversationAtom);
    const messagesEndRef = useRef(null);
    
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [allMessages]);

    return (
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
                        <div className={`rounded-xl p-3 py-2 max-w-xs text-white ${message.sender === currentUser._id ? 'bg-blue-500' : 'bg-gray-700'}`}>
                            {message.text && <div>{message.text}</div>}
                            {message.img && (
                                <img src={message.img} className="mt-2 w-full h-72 object-contain rounded" alt="message attachment" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div ref={messagesEndRef} />
        </div>
    )
}

export default Message