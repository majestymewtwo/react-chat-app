import { useState } from "react";
import ChatRoom from "./components/ChatRoom";
import Login from "./components/Login";

const App = () => {
  const [logged, setLogged] = useState(false);
  return (
    <section className='min-h-screen bg-gradient-to-r from-slate-900 to-slate-700 relative'>
      {logged ? (
        <ChatRoom name={localStorage.getItem("name")} />
      ) : (
        <Login
          logIn={(val) => {
            if (val) {
              setLogged(true);
            }
          }}
        />
      )}
    </section>
  );
};
export default App;
