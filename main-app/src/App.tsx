import "./App.css";
import { useState } from "react";

function App() {
  const [message, setMessage] = useState<Message>({
    data: "",
    message: "Key is not loaded",
    state: "",
  });
  const [verificationMessage, setVerificationMessage] = useState<string>(
    "File has not been chosen"
  );

  const [pin, setPin] = useState("");

  const [fileToSign, setFileToSign] = useState<FileReader | null>(null);
  const [fileToVerify, setFileToVerify] = useState<FileReader | null>(null);

  const handleFileToSignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosen_file = e.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(chosen_file);
      setFileToSign(fileReader);
      console.log(fileReader);
    }
  };

  const handleFileToVerifyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosen_file = e.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(chosen_file);
      setFileToVerify(fileReader);
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
    console.log(fileToSign);
    await window.api.signFile(fileToSign?.result).then((res) => {
      console.log(res);
      setMessage(res);
    });
  };

  const onVerify = async () => {
    console.log(fileToVerify);
    await window.api.verifyFile(fileToVerify?.result).then((res) => {
      console.log(res);
      setVerificationMessage(res.message);
    });
  };

  return (
    <>
      <h1>BSK</h1>
      <div className="card">
        <input
          type="password"
          placeholder="Enter pin"
          className="input input-accent"
          style={{ margin: "10px" }}
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
            <label>Select a file to sign:</label>
            <input
              type="file"
              name="myfile"
              accept=".pdf"
              onChange={handleFileToSignChange}
            ></input>
            <button
              onClick={(e) => {
                e.preventDefault();
                console.log("File to sign selected");
                onSign();
              }}
            >
              Sign File
            </button>
          </div>
        )}
      </div>
      <hr></hr>
      <div>
        <label>Select a file to verify:</label>
        <input
          type="file"
          name="myfile2"
          accept=".pdf"
          onChange={handleFileToVerifyChange}
        ></input>
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log("File To verify selected");
            onVerify();
          }}
        >
          Verify File
        </button>
        <p>{verificationMessage}</p>
      </div>
    </>
  );
}

export default App;
