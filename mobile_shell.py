# mobile_shell.py
import sys
from PyQt6.QtWidgets import QApplication
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEnginePage
from PyQt6.QtCore import QUrl

APP_URL = "http://localhost:5173/"


def main():
    print("[mobile_shell] starting PyQt6 application...")
    app = QApplication(sys.argv)

    view = QWebEngineView()
    view.setWindowTitle("Mendly")

    # Get page and hook geolocation permission
    page = view.page()

    def on_feature_permission_requested(origin, feature):
        print("[Geo] featurePermissionRequested:", origin.toString(), feature)
        if feature == QWebEnginePage.Feature.Geolocation:
            print("[Geo] Granting geolocation permission")
            page.setFeaturePermission(
                origin,
                feature,
                QWebEnginePage.PermissionPolicy.PermissionGrantedByUser,
            )

    page.featurePermissionRequested.connect(on_feature_permission_requested)

    # Phone-like window size
    view.resize(390, 750)
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
