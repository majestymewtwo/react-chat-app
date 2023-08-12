import React, { useState } from "react";

const Login = ({ logIn }) => {
  const [name, setName] = useState("");
  return (
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3'>
      <div className='flex space-x-4'>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='focus:outline-none bg-inherit border border-slate-400 px-3 py-2 rounded-md text-slate-400 w-10/12'
        />
        <button
          onClick={() => {
            localStorage.setItem("name", name);
            logIn(name);
          }}
          className='border border-slate-400 px-3 py-2 rounded-md text-slate-400 hover:bg-slate-400 hover:text-inherit transition-all ease-in-out duration-300 w-fit mx-auto w-2/12'>
          Log in
        </button>
      </div>
    </div>
  );
};

export default Login;
