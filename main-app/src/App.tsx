import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useState } from "react";

function App() {
  const [key_is_loaded, setKeyIsLoaded] = useState(false);
  const loadKey = async () => {
    window.api.loadKey().then((res) => {
      console.log(res);
      if (res != "") {
        setKeyIsLoaded(true);
      }
    });
  };

  return (
    <>
      <h1>BSK</h1>
      <div className="card">
        <button onClick={() => loadKey()}>Load RSA key</button>
        <p></p>
      </div>
      <p>
        {key_is_loaded ? "Private key is loaded" : "Private key is not loaded"}
      </p>
    </>
  );
}

export default App;
