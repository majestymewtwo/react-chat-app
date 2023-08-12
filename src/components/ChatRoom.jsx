import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const ChatRoom = ({ name }) => {
  const [message, setMessage] = useState("");
  const [greetings, setGreetings] = useState([]);
  const [client, setClient] = useState(null);
  const [receiver, setReceiver] = useState("");

  useEffect(() => {
    const sock = new SockJS("http://localhost:8080/gs-guide-websocket");
    const stompClient = Stomp.over(sock);

    sock.onopen = () => {
      console.log("Connected");
    };

    stompClient.connect(
      {},
      (_frame) => {
        console.log("Connected to WebSocket");
        setClient(stompClient);

        stompClient.subscribe(
          "/user/" + name.toLowerCase() + "/private",
          onMessageReceived
        );
      },
      (err) => {
        console.error(err);
      }
    );
  }, []);

  const onMessageReceived = (message) => {
    const response = JSON.parse(message.body);
    setGreetings((prevGreetings) => [...prevGreetings, response]);
  };

  const sendMessage = () => {
    if (client && client.connected && message.trim() !== "") {
      const newMessage = {
        message: message,
        receiver: receiver.toLowerCase(),
        sender: name,
        date: new Date().toLocaleString(),
      };
      client.send("/app/user-message", {}, JSON.stringify(newMessage));
      greetings.push(newMessage);
      setGreetings(greetings);
      setMessage("");
    }
  };

  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 space-y-10'>
      <h2 className='text-slate-400 font-bold text-3xl text-center'>
        Welcome {name}
      </h2>
      <input
        type='text'
        placeholder='Receiver Name'
        value={receiver}
        className='focus:outline-none bg-inherit border border-slate-400 px-3 py-2 rounded-md text-slate-400 w-full'
        onChange={(e) => setReceiver(e.target.value)}
      />
      <div className='flex space-x-4'>
        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className='focus:outline-none bg-inherit border border-slate-400 px-3 py-2 rounded-md text-slate-400 w-10/12'
        />
        <button
          onClick={sendMessage}
          className='border border-slate-400 px-3 py-2 rounded-md text-slate-400 hover:bg-slate-400 hover:text-inherit transition-all ease-in-out duration-300 w-fit mx-auto w-2/12'>
          Send Message
        </button>
      </div>
      <table className='text-slate-400'>
        <tbody className='space-y-6 pb-10'>
          {greetings.map((greeting, index) => (
            <tr key={index} className='flex flex-col space-y-3'>
              <td className='flex space-x-2 text-xs'>
                <h2>{greeting.sender}</h2>
                <h2>{greeting.date}</h2>
              </td>
              <td className='text-lg'>{greeting.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChatRoom;
