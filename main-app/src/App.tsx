import "./App.css";
import { useState } from "react";

function App() {
  const [message, setMessage] = useState("Key is not loaded");
  const [pin, setPin] = useState("");

  const onSubmit = async () => {
    await window.api.loadKey(pin).then((res) => {
      console.log(res);
      setMessage(res.message);
    });
  };

  return (
    <>
      <h1>BSK</h1>
      <div className="card">
        <input
          type="password"
          placeholder="Enter pin"
          onChange={(e) => {
            setPin(e.target.value);
            console.log(pin);
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          Load RSA key
        </button>

        <p></p>
      </div>
      <p>{message}</p>
    </>
  );
}

export default App;
