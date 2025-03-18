import "./App.css";
import { useState } from "react";

function App() {
  const [message, setMessage] = useState<Message>({
    data: "",
    message: "Key is not loaded",
    state: "",
  });
  const [pin, setPin] = useState("");
  const [file, setFile] = useState<FileReader | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosen_file = e.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(chosen_file);
      setFile(fileReader);
      console.log(fileReader);
    }
  };

  const onSubmit = async () => {
    await window.api.loadKey(pin).then((res) => {
      setPin("");
      console.log(res);
      setMessage(res);
    });
  };

  const onSign = async () => {
    console.log(file);
    await window.api.signFile(file.result).then((res) => {
      console.log(res);
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

        <p>{message.message}</p>
        {message.state === "success" && (
          <div>
            <label>Select a file:</label>
            <input
              type="file"
              name="myfile"
              accept=".pdf"
              onChange={handleFileChange}
            ></input>
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log("File selected");
                onSign();
              }}
            >
              Sign File
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
