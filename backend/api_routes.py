from flask import request,jsonify
import requests
from flask_restful import Resource
from dotenv import load_dotenv
import os
from openai import OpenAI
from prompts import data,photo_data
import base64
from io import BytesIO
from pymongo import MongoClient
from IPython.display import display
from diffusers import AutoPipelineForText2Image
import torch
# from PIL import Image
from flask import Response
import time


# helper functions imports
from helper_function import display_summary
from helper_function import audio_to_text,convert_to_audio
from Checker import exist_user,count_tokens,verify_credentials,check_password,generate_json,verifypw
import bcrypt


groq_base_url = "https://api.groq.com/openai/v1"
load_dotenv(override=True)
key = os.getenv("GROQ_API_KEY_MULTI")


# hf_key = os.getenv('HF_TOKEN')

# from huggingface_hub import login
# login(hf_key, add_to_git_credential=True)

# Mongo DB collection setup

load_dotenv(override=True)
mongo_key = os.getenv('MONGO_URI')
client = MongoClient(mongo_key)

#collection setup
db = client.MultiModal
users = db['Users']

# nvidia key setup
# invoke_url = "https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium"
load_dotenv(override=True)
key_nvidia = os.getenv('Nvidia')
conversation_history2 = []

#Register route
class Register(Resource):
    def post(self):
        posted_data = request.get_json()

        Username = posted_data["username"]
        Password = posted_data["password"]
        # Tokens = posted_data["tokens"]

        if exist_user(Username,users):
            return generate_json(500,'User already Exist')
        
        flag ,  mssg = check_password(Password)
        if not flag:
            return generate_json(301,f'{mssg} password should match rules!')
        

        hashpw = bcrypt.hashpw(Password.encode('utf8'),salt=bcrypt.gensalt())

        users.insert_one({
            "Username" : Username,
            "Password" : hashpw,
            "Token" : 5
            })

        return generate_json(200,"You have successfully registered!")
   

class audio_text(Resource):
    def post(self):
        convert_to_audio()
        text = audio_to_text()
        return jsonify({"reply": text})
        

class chat(Resource):
    # global or session-based
    def post(self):
        global conversation_history2
        groq = OpenAI(base_url=groq_base_url, api_key=key)

        posted_data = request.get_json()
        _,system_prompt = data()
        user_prompt = posted_data["prompt"]
        # Password = ["Password"]
        Username = posted_data["Username"]




        conversation_history2.append({"role": "user", "content": user_prompt})

        messages = [
            {"role": "system", "content": system_prompt}
        ] + conversation_history2

        token_left = count_tokens(Username,users)


        # print("the value of token left is ",token_left)

        if token_left <= 0:
            users.update_one({"Username": Username}, {"$set": {"Token": 0}})
            return jsonify({"status_code":303, "content": "Not enough tokens! Please refill"})

        # ✅ Atomic decrement — only decrements if Token is still > 0
        
        def generate():
            stream = groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                stream=True
            )

            full_response = ""

            for chunk in stream:
                content = chunk.choices[0].delta.content or ""
                full_response += content
                time.sleep(0.05)
                yield content   # 🔥 send chunk to frontend

            # save memory AFTER streaming ends
            conversation_history2.append({
                "role": "assistant",
                "content": full_response
            })
            # print(conversation_history2)
        
        try:
            users.update_one(
            {"Username": Username, "Token": {"$gt": 0}},
              {"$inc": {"Token": -1}}
        )
            return Response(generate(), mimetype='text/plain')
        except Exception as e:
            # ✅ Refund the token if summarization fails
            users.update_one({"Username": Username}, {"$inc": {"Token": 1}})
            return jsonify({"role": "BOT",
            "content": "Application is facing some downtime please come back later!"})


class summarize(Resource):
    def post(self):
        posted_data = request.get_json()

        url = posted_data['prompt']

        Username = posted_data["Username"]
        # Password = posted_data["Password"]

        # default_user_prompt , system_prompt = data()

        # groq = OpenAI(base_url = groq_base_url,api_key= key)

        # system_prompt = str(system_prompt)

        # messages = [{"role": "system", "content": system_prompt},
        #         {"role": "user", "content": default_user_prompt}
        #     ]

        # response = groq.chat.completions.create(model = "llama-3.3-70b-versatile",
        # messages = messages)
        # result = response.choices[0].message.content

        token_left = count_tokens(Username,users)

        if token_left <= 0:
            users.update_one({"Username": Username}, {"$set": {"Token": 0}})
            return jsonify({"status_code":303,"content":"Not enough tokens! Please refill"})
        try:
            result = display_summary(url)

            users.update_one({"Username":Username,"Token": {"$gt":0}},{"$inc": {"Token": -1}})
            return jsonify({"reply":result})

        except Exception as e:
            # ✅ Refund the token if summarization fails
            users.update_one({"Username": Username}, {"$inc": {"Token": 1}})
            print("Summary error:", e)
            return jsonify({'content':"Invalid website URL"})


class can_generate_image_with_powerful_system(Resource):
    def post(self):
        posted_data = request.get_json()

        # system_prompt = photo_data()


        prompt = posted_data["prompt"]
        pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
        pipe
        prompt = "generate image of goku super saiyan 3"
        image = pipe(prompt=prompt, num_inference_steps=4, guidance_scale=0.0).images[0]
        display(image)

        # Convert image to base64
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        return jsonify({"image": img_str})


class photo_gen(Resource):
    def post(self):

        posted_data = request.get_json()

        user_prompt = posted_data["prompt"]
        Username = posted_data["Username"]

        invoke_url = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell"
        
        system_prompt = photo_data()

        headers = {
            "Authorization": f"Bearer {key_nvidia}",
            "Accept": "application/json",
        }
        payload = {
            "prompt": f"A whimsical and highly detailed {user_prompt}, rendered in a vibrant digital art style. Featuring\
                   dramatic cinematic lighting, surreal pops of color, and an energetic composition. Elements of high-fantasy aesthetics\
                   mixed with a playful, modern twist. 8k resolution, intricate textures, masterpiece quality, trending on ArtStation.",
            "width": 1024,
            "height": 1024,
            "seed": 0,
            "steps": 4
        }

        token_left = count_tokens(Username,users)
        print("the value of token left is ",token_left)

        print(token_left)
        if token_left <= 0:
            users.update_one({"Username": Username}, {"$set": {"Token": 0}})
            return jsonify({"status_code":303, "content" : "Not enough tokens! Please refill"})

        response = requests.post(invoke_url, headers=headers, json=payload)
        response.raise_for_status()


        response_body = response.json()

        # 1. Extract the base64 string
        image_base64 = response_body.get("image") or response_body["artifacts"][0]["base64"]

        # 2. Clean the string (remove prefix if it already exists to avoid duplication)
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        # 3. DO NOT decode to bytes. Return the string so JSON can serialize it.
        # We return the string exactly as the frontend expects it.

        try:


            users.update_one({"Username":Username,"Token": {"$gt":0}},{"$inc": {"Token": -2}})
            return {"image": image_base64}

        except Exception as e:
            # ✅ Refund the token if summarization fails
            users.update_one({"Username": Username}, {"$inc": {"Token": 2}})
            # print("Summary error:", e)
            return jsonify("Invalid website URL")
        
conversation_history2 = []

class code_and_reasonining(Resource):
    def post(self):


        # global conversation_history2
        # groq = OpenAI(base_url=groq_base_url, api_key=key)

        # posted_data = request.get_json()
        # _,system_prompt = data()
        # user_prompt = posted_data["prompt"]
        # # Password = ["Password"]
        # Username = posted_data["Username"]




        # conversation_history2.append({"role": "user", "content": user_prompt})

        # messages = [{"role": "system", "content": system_prompt}] + conversation_history2

        # token_left = count_tokens(Username,users)


        # # print("the value of token left is ",token_left)

        # if token_left <= 0:
        #     users.update_one({"Username": Username}, {"$set": {"Token": 0}})
        #     return jsonify({"status_code":303, "content": "Not enough tokens! Please refill"})

        # # ✅ Atomic decrement — only decrements if Token is still > 0
        
        # def generate():
        #     stream = groq.chat.completions.create(
        #         model="openai/gpt-oss-120b",
        #         messages=messages,
        #         stream=True
        #     )

        #     full_response = ""

        #     for chunk in stream:
        #         content = chunk.choices[0].delta.content or ""
        #         full_response += content
        #         time.sleep(0.05)
        #         yield content   # 🔥 send chunk to frontend

        #     # save memory AFTER streaming ends
        #     conversation_history2.append({
        #         "role": "assistant",
        #         "content": full_response
        #     })
        #     # print(conversation_history2)
        
        # try:
        #     users.update_one(
        #     {"Username": Username, "Token": {"$gt": 0}},
        #       {"$inc": {"Token": -1}}
        # )
        #     return Response(generate(), mimetype='text/plain')
        
        # except Exception as e:
        #     # ✅ Refund the token if summarization fails
        #     users.update_one({"Username": Username}, {"$inc": {"Token": 1}})
        #     return jsonify({"role": "BOT",
        #     "content": "Application is facing some downtime please come back later!"})
        groq = OpenAI(
            base_url=groq_base_url,
            api_key=key
        )

        posted_data = request.get_json()

        _, system_prompt = data()

        user_prompt = posted_data["prompt"]
        Username = posted_data["Username"]

        token_left = count_tokens(Username, users)

        if token_left <= 0:
            users.update_one(
                {"Username": Username},
                {"$set": {"Token": 0}}
            )

            return jsonify({
                "status_code": 303,
                "content": "Not enough tokens! Please refill"
            })

        conversation_history2.append({
            "role": "user",
            "content": user_prompt
        })

        messages = [
            {
                "role": "system",
                "content": system_prompt
            }
        ] + conversation_history2

        try:

            stream = groq.chat.completions.create(

                model="openai/gpt-oss-120b",
                messages=messages,
                stream=True
            )

            full_response = []

            for chunk in stream:

                if not getattr(chunk, "choices", None):
                    continue

                content = chunk.choices[0].delta.content

                if content is not None:
                    full_response.append(content)

            final_response = "".join(full_response)

            conversation_history2.append({
                "role": "assistant",
                "content": final_response
            })

            users.update_one(
                {
                    "Username": Username,
                    "Token": {"$gt": 0}
                },
                {
                    "$inc": {"Token": -1}
                }
            )

            return jsonify({
                "content": final_response
            })

        except Exception as e:

            users.update_one(
                {"Username": Username},
                {"$inc": {"Token": 1}}
            )

            return jsonify({
                "role": "BOT",
                "content": "Application is facing some downtime please come back later!"
            })
                      


class Refill(Resource):

    def post(self):

        posted_data = request.get_json()
        username = posted_data["Username"]
        password1 = "Hello@1234"
        # if posted_data["amount"]:
        #     amount = posted_data["amount"]
        # else:
        amount = 10
        
        password = posted_data["Password"]


        load_dotenv(override=True)
        admin_pw = os.getenv("ADMIN_PASSWORD")

        if not exist_user(username,users):
            return jsonify({'status':301, 'content':'Invalid Username'})
        
        if not verifypw(username,password,users):
            return jsonify({'status':301, 'content':'Invalid Password'})

        # if password1 != admin_pw:
        #     return jsonify({'status': 302, 'content':'Incorrect admin password'})

        users.update_one(
         {"Username": username},
        {"$set": {"Token": amount}}
        )
        print('refilled')
        return jsonify({'status':200, 'content':'Refilled'})
        # posted_data = request.get_json()
        # username = posted_data["Username"]
        # password = posted_data["Password"]
        # amount = 10

        # if not exist_user(username, users):
        #     return jsonify({'status':301, 'content':'Invalid Username'}), 301
        
        # if not verifypw(username, password, users):
        #     return jsonify({'status':301, 'content':'Invalid Password'}), 301

        # users.update_one(
        #     {"Username": username},
        #     {"$set": {"Token": amount}}
        # )

        # return jsonify({'status':200, 'content':'Refilled'}), 200



class Signin(Resource):
    def post(self):
        posted_data = request.get_json()

        username = posted_data["Username"]
        password = posted_data["Password"]
        print(username,password)

        retJson, error = verify_credentials(username, password,users)
        print(retJson,error)

        if error:
            return retJson

        return generate_json(200, "Sign in successful!")
    


class Tokens(Resource):
    def post(self):
        posted_data = request.get_json()
        username = posted_data["Username"]
        # password = posted_data["Password"]

        # retJson, error = verify_credentials(username, password,users)
        # if error:
        #     return jsonify(retJson)

        return jsonify({"status_code":200, "content":count_tokens(username,users)})













#  code and reasoning old        
# posted_data = request.get_json()
#         code = posted_data['prompt']
#         Username = posted_data['Username']

#         client = OpenAI(
#         base_url = "https://integrate.api.nvidia.com/v1",
#         api_key = key_nvidia
#         )

#         token_left = count_tokens(Username,users)

#         if token_left <= 0:
#             users.update_one({"Username": Username}, {"$set": {"Token": 0}})
#             return jsonify({"status_code":303,"content":"Not enough tokens! Please refill"})
        
#         completion = client.chat.completions.create(
#         model="minimaxai/minimax-m2.7",
#         messages=[{
#   "role": "user",
#   "content": f"Task: {[code]}\n\(\nConstraints:\\)n- Start output immediately with the first functional character.\n- No markdown code blocks (no ```).\n- No preamble, greetings, or conversational filler.\n- No trailing whitespace or empty lines.\n- Provide raw text only."
# }
# ],
#         temperature=1,
#         top_p=0.95,
#         max_tokens=8192,
#         stream=True,)
        
#         full_response = []

#         for chunk in completion:
#             if not getattr(chunk, "choices", None):
#                 continue
#             if chunk.choices[0].delta.content is not None:
#                 content = chunk.choices[0].delta.content
#                 full_response.append(content)
#                 # print(chunk.choices[0].delta.content, end="")
#         try:
#             users.update_one({"Username":Username,"Token": {"$gt":0}},{"$inc": {"Token": -1}})
#             return jsonify({"reply":full_response})

#         except Exception as e:
#             # ✅ Refund the token if summarization fails
#             users.update_one({"Username": Username}, {"$inc": {"Token": 1}})
#             # print("Summary error:", e)
#             return jsonify({"reply":"Not Responding please come back later!"})