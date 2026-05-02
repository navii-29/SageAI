from api_components.scraper import Scraper
from prompts import data_summarizer
from openai import OpenAI
from dotenv import load_dotenv
import os
import sounddevice as sd
from scipy.io.wavfile import write


user_prompt_prefix , system_prompt  = data_summarizer()

# key 
load_dotenv(override=True)
key = os.getenv('GROQ_API_KEY')

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
groq = OpenAI(base_url=GROQ_BASE_URL, api_key= key)

def messages_for(website):
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt_prefix + str(website['data'])}
    ]

def summarize(url):
    scrap = Scraper(url)
    website = scrap.fetch_website_contents()
    response = groq.chat.completions.create(
        model = "openai/gpt-oss-20b",
        messages = messages_for(website)
    )
    return response.choices[0].message.content

def display_summary(url):
    summary = summarize(url)
    return summary


def audio_to_text():
    audio_file = open("/audio.mp3", "rb")

    response1 = groq.audio.transcriptions.create(
        model="whisper-large-v3-turbo",
        file=audio_file
    )
    return response1

def convert_to_audio():


    fs = 44100  # sample rate
    seconds = 10  # duration

    print("Recording...")
    recording = sd.rec(int(seconds * fs), samplerate=fs, channels=1)
    sd.wait()

    write("audio.mp3", fs, recording)
    print("Saved as audio.wav")


# print(display_summary('https://www.apple.com/in/'))
# print(key)