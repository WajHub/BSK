import "./App.css";
import { useState } from "react";

function App() {
  const [key_is_loaded, setKeyIsLoaded] = useState(false);
  const [pin, setPin] = useState("");

  const onSubmit = async () => {
    window.api.loadKey(pin).then((res) => {
      console.log(res);
      if (res != null && res != "" && res != undefined) {
        setKeyIsLoaded(true);
      }
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
      <p>
        {key_is_loaded ? "Private key is loaded" : "Private key is not loaded"}
      </p>
    </>
  );
}

export default App;
