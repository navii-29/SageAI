from flask import jsonify
import bcrypt
import re

def count_tokens(Username,Table):
     if exist_user(Username,Table):
        count = Table.find_one({"Username": Username})["Token"] 
        return count
   

def verify_credentials(Username, Password,Table):
    if not exist_user(Username,Table):
        return generate_json(301, "Invalid Username"), True

    correct_pw = verifypw(Username, Password,Table)

    if not correct_pw:
        return generate_json(302, "Incorrect Password"), True

    return None, False

def check_password(Password):
    pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'

    if re.match(pattern, Password):
        return True, 'valid password'
    else:
        return False, 'invalid password'

def exist_user(Username,Table):
     
    if Table.count_documents({"Username" : Username}) == 0:
        return False
    else:
        return True
    
def verifypw(Username,Password,Table):
    if not exist_user(Username,Table):
        return False

    hashed_pw = Table.find_one({
        "Username":Username
    })["Password"]

    if bcrypt.checkpw(Password.encode('utf8'), hashed_pw):
        return True
    else:
        return False

def generate_json(code, mssg):
    return jsonify({"Status_Code": code, "Message": mssg})