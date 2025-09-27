import re
import html

def cleanText(string: str) -> str:
    return re.sub(r'[^a-zA-Z\s]', '', string)

def isvalidEmail(email):
    pattern = "^\S+@\S+\.\S+$"
    email_form = html.escape(email)
    objs = re.search(pattern, email_form)
    try:
        if objs.string == email_form:
            return True
    except:
        return False
    
def isNicknameKey(nickname: str) -> bool:
    pattern = r"^[a-zA-Z0-9._]+$"
    user_nickname = nickname.strip()

    return re.fullmatch(pattern, user_nickname) is not None