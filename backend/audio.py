import sounddevice as sd
from scipy.io.wavfile import write

fs = 44100  # sample rate
seconds = 10  # duration

print("Recording...")
recording = sd.rec(int(seconds * fs), samplerate=fs, channels=1)
sd.wait()

write("audio.mp3", fs, recording)
print("Saved as audio.wav")