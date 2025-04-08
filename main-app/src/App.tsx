import React from "react";
import "./App.css";
import { useState } from "react";

/**
 * Typ dla komunikatu o stanie operacji.
 * @typedef {Object} Message
 * @property {string} data - Dodatkowe dane (zazwyczaj puste).
 * @property {string} message - Główna wiadomość.
 * @property {string} state - Stan operacji, np. "success" lub "error".
 */
type Message = {
  data: string;
  message: string;
  state: string;
};

/**
 * Główny komponent aplikacji.
 * Zarządza stanem aplikacji oraz obsługą interakcji użytkownika
 * w zakresie ładowania klucza RSA, podpisywania i weryfikowania plików PDF.
 * @returns {JSX.Element} Komponent renderujący UI aplikacji.
 */
function App() {
  const [message, setMessage] = useState<Message>({
    data: "",
    message: "Key is not loaded",
    state: "",
  });

  const [verificationMessage, setVerificationMessage] = useState<Message>({
    data: "",
    message: "File has not been chosen",
    state: "",
  });

  const [pin, setPin] = useState("");

  const [fileToSign, setFileToSign] = useState<FileReader | null>(null);
  const [fileToVerify, setFileToVerify] = useState<FileReader | null>(null);

  /**
   * Funkcja obsługująca zmianę wybranego pliku do podpisania.
   * Wczytuje plik i zapisuje go do stanu.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Zdarzenie zmiany pliku.
   */
  const handleFileToSignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosen_file = e.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(chosen_file);
      setFileToSign(fileReader);
      console.log(fileReader);
    }
  };

  /**
   * Funkcja obsługująca zmianę wybranego pliku do weryfikacji.
   * Wczytuje plik i zapisuje go do stanu.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Zdarzenie zmiany pliku.
   */
  const handleFileToVerifyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosen_file = e.target.files[0];
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(chosen_file);
      setFileToVerify(fileReader);
      console.log(fileReader);
    }
  };

  /**
   * Funkcja do ładowania klucza RSA na podstawie wprowadzonego PIN-u.
   * @returns {Promise<void>} Zwraca obietnicę po zakończeniu ładowania klucza.
   */
  const onSubmit = async () => {
    await window.api.loadKey(pin).then((res) => {
      setPin("");
      console.log(res);
      setMessage(res);
    });
  };

  /**
   * Funkcja do podpisywania wybranego pliku.
   * @returns {Promise<void>} Zwraca obietnicę po zakończeniu podpisywania.
   */
  const onSign = async () => {
    console.log(fileToSign);
    await window.api.signFile(fileToSign?.result).then((res) => {
      console.log(res);
      setMessage(res);
    });
  };

  /**
   * Funkcja do weryfikacji podpisu wybranego pliku.
   * @returns {Promise<void>} Zwraca obietnicę po zakończeniu weryfikacji.
   */
  const onVerify = async () => {
    console.log(fileToVerify);
    await window.api.verifyFile(fileToVerify?.result).then((res) => {
      console.log(res);
      setVerificationMessage(res);
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
        <p>{verificationMessage.message}</p>
      </div>
    </>
  );
}

export default App;
