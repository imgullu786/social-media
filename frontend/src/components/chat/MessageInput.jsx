import { useState, useRef } from "react";
import {selectedConversationAtom, conversationsAtom} from "../../atoms/messageAtom"
import { useRecoilValue, useSetRecoilState } from "recoil";

import { IoSend } from "react-icons/io5";
import { FaRegImage } from "react-icons/fa";
import LoadingSpinner from "../common/LoadingSpinner"

function MessageInput({ allMessages, setAllMessages }) {
    const [messageText, setMessageText] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const setConversations = useSetRecoilState(conversationsAtom);
    const [img, setImg] = useState(null);
    const imgRef = useRef(null);

    const handleImgChange = (e) => {
        document.getElementById('my_modal_3').showModal();
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImg(reader.result);
            reader.readAsDataURL(file);
        }
    };

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

            // ✅ Update last message in conversation list
            setConversations((prevConvs) =>
                prevConvs.map((conversation) =>
                    conversation._id === selectedConversation._id
                        ? {
                            ...conversation,
                            lastMessage: {
                                text: messageText,
                                sender: data.sender,
                            },
                        }
                        : conversation
                )
            );

            // ✅ Append new message locally
            setAllMessages((prev) => [...prev, data]);

            setMessageText('');
            setImg(null);
        } catch (error) {
            console.error('Fetch error:', error.message);
        } finally {
            setSendingMessage(false);
        }
    };

    return (
        <div className="p-2 py-1 flex items-center flex-shrink-0 md:mb-0 mb-12">
            <input
                type="text"
                className="flex-1 p-2 m-2 bg-gray-700 text-white rounded-full focus:outline-none"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
            />
            <div className="flex gap-1 items-center">
                <FaRegImage
                    className="fill-primary w-6 h-6 cursor-pointer"
                    onClick={() => imgRef.current.click()}
                />
            </div>
            <input type="file" hidden ref={imgRef} onChange={handleImgChange} />
            <dialog id="my_modal_3" className="modal">
                <div className="modal-box bg-gray-700">
                    <form method="dialog">
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => {
                                setImg(null);
                                imgRef.current.value = null;
                            }}
                        >
                            ✕
                        </button>
                    </form>
                    {img && (
                        <div>
                            <div className="relative w-72 mx-auto">
                                <img src={img} className="w-full mx-auto h-72 object-contain rounded" />
                            </div>
                            <button
                                className="absolute bottom-2 -right-0 mx-2 p-2 bg-blue-500 rounded-lg flex items-center justify-center"
                                onClick={sendMessage()}
                            >
                                {sendingMessage && <LoadingSpinner size="xs" />}
                                {!sendingMessage && <IoSend className="text-white" />}
                            </button>
                        </div>
                    )}
                </div>
            </dialog>
            <button
                className="ml-2 px-4 py-2 bg-blue-500 rounded-lg flex items-center justify-center"
                onClick={sendMessage()}
            >
                {sendingMessage && <LoadingSpinner size="xs" />}
                {!sendingMessage && <IoSend className="text-white" />}
            </button>
        </div>
    );
}

export default MessageInput;