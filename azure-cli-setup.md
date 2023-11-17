# Azure CLI install and Login To Azure

1. **Open Terminal**: First, you need to open your terminal on your macOS.

2. **Install Homebrew (if not already installed)**: If you don't have Homebrew installed, you can install it by pasting the following command in your terminal:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   This command will download and run the Homebrew installation script.

3. **Update Homebrew**: It's a good practice to ensure Homebrew is up to date:
   ```bash
   brew update
   ```

4. **Install Azure CLI using Homebrew**: Now, you can install the Azure CLI with the following command:
   ```bash
   brew install azure-cli
   ```

5. **Verify Installation**: Once the installation is complete, you can verify it by checking the Azure CLI version:
   ```bash
   az --version
   ```
   This command will display the Azure CLI version along with some additional information.

6. **Login to Azure**: To start using the Azure CLI, you will need to log in to your Azure account. You can do this by running:
   ```bash
   az login
   ```
   This command will open a web page where you can enter your Azure credentials.

