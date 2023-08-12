import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const ChatRoom = ({ name }) => {
  const [message, setMessage] = useState("");
  const [greetings, setGreetings] = useState([]);
  const [client, setClient] = useState(null);

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

        stompClient.subscribe("/topic/greetings", (message) => {
          const response = JSON.parse(message.body);
          setGreetings(response);
        });
      },
      (err) => {
        console.error(err);
      }
    );
  }, [message]);

  const sendMessage = () => {
    if (client && client.connected && message.trim() !== "") {
      client.send(
        "/app/hello",
        {},
        JSON.stringify({
          message: message,
        })
      );
      setMessage("");
    }
  };

  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 space-y-10'>
      <h2 className='text-slate-400 font-bold text-3xl text-center'>
        Welcome {name}
      </h2>
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
        <tbody>
          {greetings.map((greeting, index) => (
            <tr key={index}>
              <td>{greeting.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
 
export default ChatRoom;
