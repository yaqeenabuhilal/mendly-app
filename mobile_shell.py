# mobile_shell.py
import sys
from PyQt6.QtWidgets import QApplication
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtCore import QUrl

APP_URL = "http://localhost:5173/"

def main():
    print("[mobile_shell] starting PyQt application...")
    app = QApplication(sys.argv)

    view = QWebEngineView()
    view.setWindowTitle("Mendly")

    # Phone-like window size
    view.resize(390, 620)
    view.setMinimumSize(300, 500)

    print(f"[mobile_shell] loading URL: {APP_URL}")
    view.load(QUrl(APP_URL))

    # Bring window to front
    view.show()
    view.raise_()
    view.activateWindow()

    print("[mobile_shell] window shown. UI should now be visible.")
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
