import { useRecoilState } from 'recoil';
import { selectedConversationAtom } from '../../atoms/messageAtom';

import Message from "../../components/chat/Message";
import MessageInput from "../../components/chat/MessageInput"

function MessageContainer({ allMessages, setAllMessages }) {
    const [selectedConversation] = useRecoilState(selectedConversationAtom);

    return (
        <div className={`w-full md:w-2/3 text-white flex flex-col h-full ${selectedConversation._id ? 'block' : 'hidden md:block'}`}>
            {selectedConversation._id === '' ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                    Select a conversation to start messaging
                </div>
            ) : (
                <div className="flex flex-col h-full overflow-y-auto">
                    <Message allMessages={allMessages} />
                    <MessageInput allMessages={allMessages} setAllMessages={setAllMessages}/>
                </div>
            )}
        </div>
    );
}

export default MessageContainer;