## @file main.py
# @brief Główny moduł aplikacji
# @author Adam Jakubowski 193352
# @date 26.03.2025
import gui

class AuxiliaryApp:
    def __init__(self):
        self.gui = gui.AppGUI()

if __name__ == "__main__":
    app = AuxiliaryApp()
    app.gui.run()