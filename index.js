const fs = require("node:fs");
const path = require("node:path");

const { Client, Collection, GatewayIntentBits } = require("discord.js");
const {token} = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandPaths = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandPaths).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandPaths, file);
    const command = require(filePath);
    if('data'in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[ERROR] ${filePath} does not have data and execute properties`);
    }
}

client.once("ready", () => {
    console.log("Ready!");
});

client.on("interactionCreate", async interaction => {
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) {
        console.error(`[ERROR] ${interaction.commandName} is not a valid command`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this command!" });
        } else {
            await interaction.reply({ content: "There was an error while executing this command!" });
        }
    }
});

client.login(token);