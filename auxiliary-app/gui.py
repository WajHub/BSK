## @file gui.py
# @brief Moduł odpowiedzialny za renderowanie interfejsu użytkownika
# @author Adam Jakubowski 193352
# @date 26.03.2025

import os
import psutil
from tkinter import *
from tkinter import ttk, messagebox
from util import generate_private_key
import platform

class AppGUI:
    def __init__(self):
        self.root = Tk()
        self.root.title('Auxiliary App')
        self.root.geometry('400x150')
        self.root.resizable(False, False)

        self.selected_usb_path = None
        self.usb_listbox = None

        self.setup_ui()

    def setup_ui(self):
        """!
        @brief Funkcja generuje główne okno aplikacji składające się z następujących elementów:
        - pole do wprowadzenia 4-cyfrowego PINu
        - przycisk do wyboru urządzenia USB
        - etykieta z wybranym urządzeniem USB
        - przycisk do generowania klucza
        - przycisk do anulowania
        @return None
        """

        # Main frame
        main_frame = ttk.Frame(self.root, padding=20)
        main_frame.pack(fill=BOTH, expand=True)

        # Pin input frame
        input_frame = ttk.Frame(main_frame)
        input_frame.grid(row=0, column=0, sticky='nsew', pady=(0, 5))
        pin_label = ttk.Label(input_frame, text="Enter 4-digit PIN:")
        pin_label.pack(side=LEFT, padx=(0, 10))
        self.pin_entry = ttk.Entry(input_frame, width=15, show="*")
        self.pin_entry.pack(side=LEFT)

        # USB selection frame
        usb_frame = ttk.Frame(main_frame)
        usb_frame.grid(row=1, column=0, sticky='nsew', pady=(0, 10))
        ttk.Button(usb_frame, text="Select USB", command=self.show_usb_selection_window).pack(side=LEFT)
        self.usb_label = ttk.Label(usb_frame, text="No USB selected")
        self.usb_label.pack(side=LEFT, padx=(0, 10))
        
        # Buttons frame
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=2, column=0, sticky='e')
        
        generate_button = ttk.Button(
            button_frame, 
            text="Generate Key", 
            command=self.save_key_to_usb
        )
        generate_button.pack(side=RIGHT)
        
        cancel_button = ttk.Button(
            button_frame, 
            text="Cancel", 
            command=self.root.destroy
        )
        cancel_button.pack(side=RIGHT, padx=(5, 0))  

        main_frame.rowconfigure(0, weight=0)
        main_frame.rowconfigure(1, weight=0)
        main_frame.rowconfigure(2, weight=1)
        main_frame.columnconfigure(0, weight=1)

    def show_usb_selection_window(self):
        """!"
        @brief Funkcja wyświetla okno dialogowe z listą dostępnych urządzeń USB
        @return None
        """
        self.usb_win = Toplevel()
        self.usb_win.title("Select USB")
        self.usb_win.geometry('300x250')
        
        ttk.Label(self.usb_win, text="Select your USB:").pack(padx=20, pady=5)
        self.usb_listbox = Listbox(self.usb_win)
        self.usb_listbox.pack(padx=20, pady=10, fill=BOTH, expand=True)

        self.usb_devices = self.get_usb_devices()
        for device in self.usb_devices:
            self.usb_listbox.insert(END, device)

        select_button = ttk.Button(self.usb_win, text="Select", command=self.select_usb_device)
        select_button.pack(pady=5)

    def get_usb_devices(self):
        """!"
        @brief Funkcja zwraca listę dostępnych urządzeń USB
        @return Lista urządzeń USB
        """
        usb_devices = []

        if platform.system() == "Darwin":
            volumes_path = "/Volumes"
            if os.path.exists(volumes_path):
                usb_devices = [os.path.join(volumes_path, d) for d in os.listdir(volumes_path)]
        else:  
            for partition in psutil.disk_partitions():
                print(partition)
                if 'removable' in partition.opts:
                    usb_devices.append(partition.mountpoint)

        print("Available USB devices:")
        for usb in usb_devices:
            print(usb)
        return usb_devices
    
    def select_usb_device(self):
        """!"
        @brief Funkcja zapisuje wybrane urządzenie USB do zmiennej selected_usb_path
        @note W przypadku braku wybranego urządzenia, wyświetla komunikat o błędzie
        @note W przypadku wybrania urządzenia, wyświetla komunikat o sukcesie
        @return None
        """
        selected_device = self.usb_listbox.get(self.usb_listbox.curselection())
        self.usb_label.config(text=selected_device)
        self.selected_usb_path = selected_device
        if self.selected_usb_path:
            messagebox.showinfo("Success", f"USB device {self.selected_usb_path} selected.")
        else:
            messagebox.showerror("Error", "Please select a USB device first.")
        self.usb_win.destroy()

    def save_key_to_usb(self):
        """!"
        @brief Funkcja generuje i zapisuje klucze do wybranego urządzenia USB
        @note W przypadku braku wybranego urządzenia, wyświetla komunikat o błędzie
        @note W przypadku wygenerowania kluczy, wyświetla komunikat o sukcesie
        @return None
        """
        if not self.selected_usb_path:
            messagebox.showerror("Error", "Please select a USB device first.")
            return

        keys_folder = os.path.join(self.selected_usb_path, 'keys')
        os.makedirs(keys_folder, exist_ok=True)

        public_key_path = os.path.join(keys_folder, 'public_key.pem')
        with open(public_key_path, 'wb') as public_key_file:
            pem_public_key, encrypted_private_key = generate_private_key(self.pin_entry.get())
            public_key_file.write(pem_public_key)

        private_key_path = os.path.join(keys_folder, 'private_key.pem')
        with open(private_key_path, 'w') as private_key_file:
            private_key_file.write(encrypted_private_key)

        messagebox.showinfo("Success", f"Keys saved successfully in {keys_folder}")

    def run(self):
        """!"
        @brief Funkcja uruchamia główną pętlę aplikacji
        @return None
        """
        self.root.mainloop()