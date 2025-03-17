import os
from tkinter import *
from tkinter import ttk, messagebox
from utils import generate_rsa_keys, encrypt_private_key
import base64
os.makedirs("keys", exist_ok=True)

class KeyGenApp:
    def __init__(self):
        self.root = Tk()
        self.root.title('Key Generator')
        self.root.geometry('400x150')
        self.root.resizable(False, False)

        
        main_frame = ttk.Frame(self.root, padding=20)
        main_frame.pack(fill=BOTH, expand=True)

        input_frame = ttk.Frame(main_frame)
        input_frame.grid(row=0, column=0, sticky='nsew', pady=10)
        
        pin_label = ttk.Label(input_frame, text="Enter 4-digit PIN:")
        pin_label.pack(side=LEFT, padx=(0, 10))
        
        self.pin_entry = ttk.Entry(input_frame, width=15, show="*")
        self.pin_entry.pack(side=LEFT)

        
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=1, column=0, sticky='se', pady=(10, 0))

       
        generate_button = ttk.Button(
            button_frame, 
            text="Generate Key", 
            command=self.generate_keys
        )
        generate_button.pack(side=RIGHT)
        
        cancel_button = ttk.Button(
            button_frame, 
            text="Cancel", 
            command=self.root.destroy
        )
        cancel_button.pack(side=RIGHT, padx=(5, 0))  

        main_frame.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)

    def validate_pin(self, pin):
        """Check if PIN is exactly 4 numeric digits"""
        if len(pin) != 4:
            return False, "PIN must be exactly 4 digits"
        if not pin.isdigit():
            return False, "PIN must contain only numbers"
        return True, ""

    def generate_keys(self):
        pin = self.pin_entry.get()
        
        # Validate PIN
        is_valid, error_msg = self.validate_pin(pin)
        if not is_valid:
            messagebox.showerror("Invalid PIN", error_msg)
            return
        
        
        private_key, public_key = generate_rsa_keys()
        encrypted_private_key = encrypt_private_key(private_key, pin)

        with open("keys/private.pem", "wb") as f:
            f.write(encrypted_private_key.encode('utf-8'))
        
        with open("keys/public.pem", "wb") as f:
            f.write(public_key)

        messagebox.showinfo("Success", "Keys generated successfully!")
        self.pin_entry.delete(0, END)
        

    def run(self):
        self.root.mainloop()

if __name__ == '__main__':
    app = KeyGenApp()
    app.run()