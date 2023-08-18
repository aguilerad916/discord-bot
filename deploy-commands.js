const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const folderPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    if("data" in command || "execute" in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[ERROR] ${filePath} does not have data and execute properties`);
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();