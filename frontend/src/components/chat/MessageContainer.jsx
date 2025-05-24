import { useRecoilState } from 'recoil';
import { selectedConversationAtom } from '../../atoms/messageAtom';
import Message from "./Message";
import MessageInput from "./MessageInput";
import LoadingSpinner from '../common/LoadingSpinner';

function MessageContainer({ allMessages, setAllMessages, messagesContainerRef, handleScroll, isLoading }) {
    const [selectedConversation] = useRecoilState(selectedConversationAtom);

    return (
        <div className={`w-full md:w-2/3 text-white flex flex-col h-full ${selectedConversation._id ? 'block' : 'hidden md:block'}`}>
            {selectedConversation._id === '' ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                    Select a conversation to start messaging
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div 
                        className="flex-1 overflow-y-auto" 
                        ref={messagesContainerRef} 
                        onScroll={handleScroll}
                    >
                        {isLoading && (
                            <div className="flex justify-center p-2">
                                <LoadingSpinner size="sm" />
                            </div>
                        )}
                        <Message allMessages={allMessages} />
                    </div>
                    <MessageInput allMessages={allMessages} setAllMessages={setAllMessages}/>
                </div>
            )}
        </div>
    );
}

export default MessageContainer;