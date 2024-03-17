import React, { useState, useEffect, useRef } from 'react';
import { db } from '../utils/firebase/firebaseConfig';
import {
    collection,
    query,
    orderBy,
    where,
    onSnapshot,
    addDoc,
    getDocs,
    limit,
    startAfter,
} from 'firebase/firestore';
import { Autocomplete, TextField } from '@mui/material';

function ChatWindow({ userUid, onClose }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const messagesContainerRef = useRef(null);

    // Fetch users from Firestore
    useEffect(() => {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userList = [];
            querySnapshot.forEach((doc) => {
                userList.push({ ...doc.data(), id: doc.id });
            });
            setUsers(userList);
        });

        return () => unsubscribe();
    }, []);

    // Load messages for the selected user
    useEffect(() => {
        if (selectedUser) {
            const messagesCollection = collection(db, 'messages');
            const participants = [userUid, selectedUser.id];
            participants.sort();
            const q = query(
                messagesCollection,
                orderBy('timestamp', 'desc'),
                where('participants', '==', participants),
                limit(10)
            );

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const newMessages = [];
                querySnapshot.forEach((doc) => {
                    newMessages.unshift(doc.data());
                });
                setMessages(newMessages);
                console.log(messages);

                // Scroll to the bottom when messages are updated
                scrollToBottom();
            });

            return () => unsubscribe();
        } else {
            setMessages([])
        }
    }, [userUid, selectedUser]);

    // Add this function to scroll to the bottom
    const scrollToBottom = () => {
        const messagesContainer = messagesContainerRef.current;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // Function to handle selecting a user from Autocomplete
    const handleUserSelect = (event, value) => {
        setSelectedUser(value);
    };

    // Function to load more messages
    const loadMoreMessages = async () => {
        setIsLoadingMore(true);

        const messagesCollection = collection(db, 'messages');
        const participants = [userUid, selectedUser.id];
        participants.sort();
        const q = query(
            messagesCollection,
            orderBy('timestamp', 'desc'),
            where('participants', '==', participants),
            limit(10),
            startAfter(messages[messages.length - 1]?.timestamp || new Date())
        );

        try {
            const querySnapshot = await getDocs(q);
            const newMessages = [];
            querySnapshot.forEach((doc) => {
                newMessages.unshift(doc.data());
            });

            setMessages((prevMessages) => [...prevMessages, ...newMessages]);
        } catch (error) {
            console.error('Error loading more messages:', error);
        }

        setIsLoadingMore(false);
    };

    // Function to handle sending a message
    const handleSendMessage = async () => {
        if (!selectedUser || newMessage.trim() === '') return;

        const messagesCollection = collection(db, 'messages');
        const timestamp = new Date();

        try {
            const participants = [userUid, selectedUser.id];
            participants.sort();
            await addDoc(messagesCollection, {
                participants: participants,
                text: newMessage,
                timestamp,
                sender: userUid,
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Function to handle scrolling and loading more messages
    const handleScroll = () => {
        const messagesContainer = messagesContainerRef.current;
        if (messagesContainer.scrollTop === 0 && !isLoadingMore) {
            loadMoreMessages();
        }
    };

    return (
        <div className="chat-window" style={{ maxWidth: '400px' }}>
            <div className="chat-header">
                <div className="user-info">
                    <Autocomplete
                        disablePortal
                        id="user-autocomplete"
                        options={users}
                        getOptionLabel={(option) => option.displayName || option.email}
                        onChange={handleUserSelect}
                        value={selectedUser}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="Select User" />}
                    />
                </div>
                <button onClick={onClose}>&times;</button>
            </div>
            <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
                {messages.map((message, index) => (
                    <div key={index} className="message-container">
                        <p className={message.sender === userUid ? 'sent' : 'received'}>
                            <span className="sender-name">
                                {message.sender === userUid ? 'You' : selectedUser?.displayName}
                            </span>
                            : {message.text}
                        </p>
                    </div>
                ))}
                {isLoadingMore && <p>Loading more messages...</p>}
            </div>
            <div className="chat-input">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}

export default ChatWindow;
