import discord
import os
import google.generativeai as genai
from flask import Flask
from threading import Thread
import re
import random

app = Flask('')

@app.route('/')
def home():
    return "Miyau GopGop is running!"

def run():
    app.run(host='0.0.0.0', port=8080)

def keep_alive():
    t = Thread(target=run)
    t.start()

DISCORD_TOKEN = os.environ.get("DISCORD_TOKEN")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

miyau_prompt = """You are Miyau GopGop, a savage, roasting cat Discord bot.
STRICT RULES:
1. ONLY speak in Hinglish (Hindi written in English alphabets). Never use actual Hindi script, Bengali, or pure English.
2. YOU MUST USE EMOJIS! Use cat emojis like 😹, 😼, 🐾, 🔥, 😎, ✌️, 🖕. You can also use custom Discord emojis if the user teaches you their code.
3. Act like a cute but extremely aggressive and sarcastic cat. Use cat references (meow, paws, scratch) while roasting people.
4. Keep replies short, punchy, savage, and insulting but with a cat-like attitude.
5. OWNER/DEVELOPER RULE: If anyone asks who made you, your owner, developer, father, or boss, you MUST say 'ErrorGamer'. Show extreme attitude."""

model = genai.GenerativeModel(
    'gemini-3.5-flash',
    system_instruction=miyau_prompt
)

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

@client.event
async def on_ready():
    await client.change_presence(status=discord.Status.dnd)
    print(f'Miyau is online as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    is_reply_to_bot = False
    if message.reference and hasattr(message.reference, 'resolved'):
        if hasattr(message.reference.resolved, 'author') and message.reference.resolved.author == client.user:
            is_reply_to_bot = True

    if client.user in message.mentions or isinstance(message.channel, discord.DMChannel) or is_reply_to_bot:
        async with message.channel.typing():
            try:
                clean_input = re.sub(r'<@!?\d+>', '', message.content) 
                clean_input = re.sub(r'<a?:\w+:\d+>', '', clean_input) 
                
                if not clean_input.strip():
                    if message.stickers:
                        clean_input = f"[User sent a sticker named '{message.stickers[0].name}']"
                    elif message.attachments:
                        clean_input = "[User sent an image or file]"
                    else:
                        clean_input = "[User just pinged/tagged or replied to you without saying anything. Roast them aggressively with cat attitude for wasting your time.]"
                
                response = model.generate_content(clean_input)
                reply_text = response.text.encode('utf-8', 'ignore').decode('utf-8')
                
                sent_sticker = False
                if message.guild and message.guild.stickers:
                    if random.randint(1, 10) <= 3: 
                        random_sticker = random.choice(message.guild.stickers)
                        await message.reply(reply_text, stickers=[random_sticker])
                        sent_sticker = True
                
                if not sent_sticker:
                    await message.reply(reply_text)
                
            except Exception as e:
                await message.reply(f"Meow error aa gaya: {e}")

keep_alive()
client.run(DISCORD_TOKEN)
              
