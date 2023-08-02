import React, { useState } from "react";
import { over } from "stompjs";
import SockJS from "sockjs-client";

var stompClient = null;
const ChatRoom = () => {
  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState([]);
  const [tab, setTab] = useState("CHATROOM");
  const [userData, setUserData] = useState({
    username: "",
    receivername: "",
    connected: false,
    message: "",
  });

  const connect = () => {
    let Sock = new SockJS("http://localhost:8080/ws");
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    setUserData({ ...userData, connected: true });
    stompClient.subscribe("/chatroom/public", onMessageReceived);
    stompClient.subscribe(
      "/user/" + userData.username + "/private",
      onPrivateMessage
    );
    userJoin();
  };

  const userJoin = () => {
    var chatMessage = {
      senderName: userData.username,
      status: "JOIN",
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const onMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case "JOIN":
        if (!privateChats.get(payloadData.senderName)) {
          privateChats.set(payloadData.senderName, []);
          setPrivateChats(new Map(privateChats));
        }
        break;
      case "MESSAGE":
        publicChats.push(payloadData);
        setPublicChats([...publicChats]);
        break;
    }
  };

  const onPrivateMessage = (payload) => {
    var payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      let list = [];
      list.push(payloadData);
      privateChats.set(payloadData.senderName, list);
      setPrivateChats(new Map(privateChats));
    }
  };

  const onError = (err) => {
    console.log(err);
  };

  const handleMessage = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, message: value });
  };
  const sendValue = () => {
    if (stompClient) {
      var chatMessage = {
        senderName: userData.username,
        message: userData.message,
        date : new Date().toLocaleTimeString(),
        status: "MESSAGE",
      };
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const sendPrivateValue = () => {
    if (stompClient) {
      var time = new Date().toLocaleTimeString();
      var chatMessage = {
        senderName: userData.username,
        receiverName: tab,
        message: userData.message,
        date : time.slice(),
        status: "MESSAGE"
      };

      if (userData.username !== tab) {
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const handleUsername = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, username: value });
  };

  const registerUser = () => {
    connect();
  };
  return (
    <div className='relative min-h-screen'>
      {userData.connected ? (
        // Main Container
        <div className='flex'>
          {/* List of Chats */}
          <div className='w-[15%] min-h-screen'>
            <ul>
              <li
                onClick={() => {
                  setTab("CHATROOM");
                }}
                className={`member ${
                  tab === "CHATROOM"
                    ? "bg-green-700 text-white hover:bg-green-900 transition-all ease-in-out duration-300 cursor-pointer p-3 text-lg"
                    : "hover:bg-slate-100 transition-all ease-in-out duration-300 cursor-pointer p-3 text-lg"
                }`}>
                Group Chat
              </li>
              {[...privateChats.keys()].map((name, index) => {
                if (name !== userData.username) {
                  return (
                    <li
                      onClick={() => {
                        setTab(name);
                      }}
                      className={`flex transition-all ease-in-out duration-300 cursor-pointer p-3 text-lg space-x-2 ${
                        tab === name
                          ? "bg-green-700 text-white hover:bg-green-900"
                          : "hover:bg-slate-100"
                      }`}
                      key={index}>
                      <div
                        className={`rounded-full h-7 w-7 text-center font-semibold ${
                          tab !== name
                            ? "bg-green-600 text-white"
                            : "bg-slate-300 text-black"
                        }`}>
                        {name.toUpperCase()[0]}
                      </div>
                      <div>{name}</div>
                    </li>
                  );
                }
              })}
            </ul>
          </div>
          {/* Group Chat Messages */}
          {tab === "CHATROOM" && (
            <div className='w-[85%] bg-gray-200'>
              <ul className='chat-messages'>
                {publicChats.map((chat, index) => (
                  <li
                    className={`flex p-4 ${
                      chat.senderName !== userData.username
                        ? "justify-start"
                        : "justify-end"
                    }`}
                    key={index}>
                    <div
                      className={`w-fit flex flex-col space-y-3 p-2 rounded-lg ${
                        chat.senderName === userData.username
                          ? "bg-green-700 text-white"
                          : "bg-slate-300"
                      }`}>
                      {chat.senderName !== userData.username && (
                        <div className='flex items-center space-x-2'>
                          <div
                            className={`rounded-full h-6 w-6 text-center font-semibold
                              bg-slate-700 text-white
                          }`}>
                            {chat.senderName.toUpperCase()[0]}
                          </div>
                          <div>{chat.senderName}</div>
                        </div>
                      )}
                      <div className='message-data'>{chat.message}</div>
                      <div
                        className={`text-xs ${
                          chat.senderName === userData.username
                            ? "text-right"
                            : "text-left"
                        }`}>
                        {chat.date}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Chat Room Message Input Box */}
              <div className='absolute bottom-0 right-0 left-0 space-x-4 p-3 bg-white'>
                <input
                  type='text'
                  className='p-3 border border-slate-400 rounded-md focus:outline-none w-[90%]'
                  placeholder='Your message...'
                  value={userData.message}
                  onChange={handleMessage}
                />
                <button
                  type='button'
                  className='bg-green-600 text-white p-3 rounded-md shadow-sm hover:bg-green-800 transition-all ease-in-out duration-200 w-[7%]'
                  onClick={sendValue}>
                  Send
                </button>
              </div>
            </div>
          )}
          {/* Private Chat Messages */}
          {tab !== "CHATROOM" && (
            <div className='w-[85%] bg-gray-200'>
              <ul className='chat-messages'>
                {[...privateChats.get(tab)].map((chat, index) => (
                  <li
                    className={`flex p-4 ${
                      chat.senderName !== userData.username
                        ? "justify-start"
                        : "justify-end"
                    }`}
                    key={index}>
                    <div
                      className={`w-fit flex flex-col space-y-3 p-2 rounded-lg ${
                        chat.senderName === userData.username
                          ? "bg-green-700 text-white"
                          : "bg-slate-300"
                      }`}>
                      <div className='message-data'>{chat.message}</div>
                      <div
                        className={`text-xs ${
                          chat.senderName === userData.username
                            ? "text-right"
                            : "text-left"
                        }`}>
                        {chat.date}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Private Message Box */}
              <div className='absolute bottom-0 right-0 left-0 space-x-4 p-3 bg-white'>
                <input
                  type='text'
                  className='p-3 border border-slate-400 rounded-md focus:outline-none w-[90%]'
                  placeholder='Your message...'
                  value={userData.message}
                  onChange={handleMessage}
                />
                <button
                  type='button'
                  className='bg-green-600 text-white p-3 rounded-md shadow-sm hover:bg-green-800 transition-all ease-in-out duration-200 w-[7%]'
                  onClick={sendPrivateValue}>
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Login Input Box
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-x-4'>
          <input
            id='user-name'
            placeholder='Enter your name'
            name='userName'
            value={userData.username}
            onChange={handleUsername}
            className='p-3 border border-slate-400 rounded-md focus:outline-none'
          />
          <button
            type='button'
            onClick={registerUser}
            className='bg-green-600 text-white p-3 rounded-md shadow-sm hover:bg-green-800 transition-all ease-in-out duration-200'>
            Let's Go
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
