# LINE Bot Client

This project implements a LINE Self Bot using the [@evex/linejs](https://github.com/evex-dev/linejs) library.
This bot responds to commands and dynamically adds/changes commands without stopping the program.

[日本語](README.md)

## Features

- Basic LINE Bot functionality (sending/receiving messages, authentication, etc.)
- Automatic library update check and update (optional)
- Automatic installation of required packages (optional)
- Square message support
- Dynamic command loading
- Add/change commands without stopping the program


## Requirements

- Node.js (version 12 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/nezumi0627/linejs-nezubot.git
   cd linejs-nezubot
   ```

2. Install the required packages:
   ```
   npm install
   ```

3. Create a `.env` file and set the necessary environment variables:
   ```
   LINE_EMAIL=your_line_email@example.com # LINE email address
   LINE_PASSWORD=your_line_password # LINE password
   LINE_DEVICE=your_device_name # Device name to login (IOSIPAD recommended)
   OWNER_MID=your_line_mid # Owner's mid
   AUTO_INSTALL=true # Automatically install required packages
   AUTO_UPDATE_LINEJS=true # Automatically update the @evex/linejs library
   ```


4. Follow the instructions in the console to enter the PIN code if necessary.

5. When the bot starts successfully, a login message will be displayed in the console.

## Example Commands

- `!ping`: The bot responds with "pong!".

## Configuration Options

- `AUTO_INSTALL`: When set to true, automatically installs required packages.
- `AUTO_UPDATE_LINEJS`: When set to true, automatically updates the @evex/linejs library to the latest version.

## Error Handling

If an ABUSE_BLOCK error is detected, the user will be prompted to decide whether to stop the program.

## Adding or Changing Commands

You can add or change commands without stopping the program by editing the `commands.js` file.
To add a new command, use the `registerCommand` function in the following format:

```
registerCommand('!command_name', async (message, client) => {
    // Write the command processing
    await sendMessageWithAntiSpamMeasures(message, "Command response");
});
```

## License

This project is released under the MIT License. See the [LICENSE](LICENSE) file for details.

## Code of Conduct

This project adheres to the [Contributor Covenant](CODE_OF_CONDUCT.md) code of conduct. By participating in this project, you are expected to uphold this code.

## Disclaimer

This project is created for educational purposes. Please use it appropriately and in compliance with LINE's terms of service.

## Library

- [@evex/linejs](https://github.com/evex-dev/linejs)

