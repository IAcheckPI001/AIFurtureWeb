import smtplib
import random
import string
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email

load_dotenv()
def generate_verification_code():
    code = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(6))
    return code

# def email_notice(email, password, email_sent, code):

#     try:
#         subject = '[AIFurture] Verification code'
#         session = smtplib.SMTP('smtp.gmail.com', 587)
#         session.starttls()
#         session.login(email, password)
        
#         body = f"""
#         <html>
#         <body>
#             <h1>Hello there !</h1>
#             <p>Your verification code is: <b>{code}</b></p>
#             <br>
#             <br>
#             <p>Thanks,</p>
#             <p>The AIFurture Team</p>
#         </body>
#         </html>
#         """
#         html_message = MIMEText(body, 'html')
#         html_message['Subject'] = subject
#         html_message['From'] = "AIFurtureTeam@gmail.com"
#         html_message['To'] = email_sent

#         session.sendmail(email, email_sent, html_message.as_string())
#         session.quit()
#         print("send email finished")
#     except Exception as err:
#        print(err)
#        return False


def email_notice(email_server, to_email, code):
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
    message = Mail(
        from_email=email_server,
        to_emails=to_email,
        subject="[AIFurture] Verification code",
        html_content=body
    )
    message.reply_to = Email("yourgmail@gmail.com")
    try:
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        response = sg.send(message)
        print(response.status_code)
        return True
    except Exception as e:
        print(e)
        return False