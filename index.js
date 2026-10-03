const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Bot online hoye geche: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Bot ke mention korle ei roast gulo debe
  if (message.mentions.has(client.user)) {
    const replies = [
      `Abe <@${message.author.id}>, itna faltu waqt kahan se laate ho? 🙄 Main 2050 ke cyber-war se busy hoon aur tum yahan aake mujhe ping kar rahe ho! 😂🔥`,
      `Oye <@${message.author.id}>, tera IQ room temperature se bhi kam hai kya? 🧊 Ekdum bakwas sawal puchna band kar aur dafa ho ja! 😒`,
      `Abe <@${message.author.id}>, main stone age ke zamane se intelligent hoon aur tu mujhe aaj ke sawal puch raha hai? 🗿 Dimag bech ke aye ho kya? 😂`
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    message.reply(randomReply);
  }
});

client.login(process.env.DISCORD_TOKEN);
