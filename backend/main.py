from flask import Flask,render_template
from flask_restful import Api
from api_routes import summarize,chat,photo_gen,code_and_reasonining,Signin,Refill,Tokens,Register
from flask_cors import CORS


#initialize the app
app  = Flask(__name__)
CORS(app)
api = Api(app)



api.add_resource(chat,'/chat')
api.add_resource(photo_gen,'/img')
api.add_resource(summarize,'/summarize')
api.add_resource(code_and_reasonining,'/reasoning')
api.add_resource(Signin,'/signin')
api.add_resource(Refill,'/refill')
api.add_resource(Tokens,'/tokens')
api.add_resource(Register,'/register')


if __name__ == '__main__':
    app.run(debug= True,host='0.0.0.0', port = 5011)