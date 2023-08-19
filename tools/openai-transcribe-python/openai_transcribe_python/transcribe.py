import openai

print("Hello World")
random_file_path = "C:\\repos\\sc2\\sc2iq\\tools\\opeanai-transcribe-typescript\\resources\\sample-6s.mp3"
sample_file_path = "C:/Users/mattm/Documents/Sound Recordings/Recording.m4a"
audio_file = open(sample_file_path, "rb")

transcript = openai.Audio.transcribe("whisper-1", audio_file)

print(transcript)
