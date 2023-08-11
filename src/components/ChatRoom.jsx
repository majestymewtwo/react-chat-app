import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const ChatRoom = () => {
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
  }, []);

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
    <>
      <div>
        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <table>
        <tbody>
          {greetings.map((greeting, index) => (
            <tr key={index}>
              <td>{greeting.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
 
export default ChatRoom;
