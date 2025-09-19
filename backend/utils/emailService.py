import smtplib
import random
import string
from email.mime.text import MIMEText

def generate_verification_code():
    code = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(6))
    return code

def email_notice(email, password, email_sent, code):

    try:
        subject = '[AIFurture] Verification code'
        session = smtplib.SMTP('smtp.gmail.com', 587)
        session.starttls()
        session.login(email, password)
        
        body = f"""
        <html>
        <body>
            <h1>Hello there !</h1>
            <p>Your verification code is: <b>{code}</b></p>
            <br>
            <br>
            <p>Thanks,</p>
            <p>The AIFurture Team</p>
        </body>
        </html>
        """
        html_message = MIMEText(body, 'html')
        html_message['Subject'] = subject
        html_message['From'] = "AIFurtureTeam@gmail.com"
        html_message['To'] = email_sent

        session.sendmail(email, email_sent, html_message.as_string())
    except Exception:
       return False