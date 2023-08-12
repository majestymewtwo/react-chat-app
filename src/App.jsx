import { useState } from "react";
import ChatRoom from "./components/ChatRoom";
import Login from "./components/Login";

const App = () => {
  const [logged, setLogged] = useState(false);
  return (
    <section className='min-h-[100vh] bg-gradient-to-r from-slate-900 to-slate-700 relative overflow-y-scroll'>
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
