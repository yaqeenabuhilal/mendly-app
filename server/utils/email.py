import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

# استخدمي نفس الأسماء اللي عندك بالـ .env
SMTP_USER = os.getenv("EMAIL", "")
SMTP_PASS = os.getenv("EMAILPASSWORD", "").replace(" ", "")

def send_email(to_email: str, subject: str, body: str) -> None:
    if not SMTP_USER or not SMTP_PASS:
        print("[email] EMAIL/EMAILPASSWORD missing. Skipping send.")
        return

    msg = MIMEMultipart()
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
