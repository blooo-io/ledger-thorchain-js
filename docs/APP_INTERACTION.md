# Interact with the THORChain App

## Introduction 

In this section, we will guide you through the creation of a web application. This application will connect to your Nano and will allow you to use the THORChain Embedded App. 
 
Web USB and Web HID applications are implemented with `@ledgerhq/hw-transport-webusb` and `@ledgerhq/hw-transport-webhid`  respectively.

## Use case

You will be able to do the following actions:

- Get information about the THORChain Embedded App installed on your Nano device
- Get information about the public key and the public address
- Sign an example of transaction with your Ledger Nano device

## Tutorial prerequisites

- Ensure you have gone through the [prerequisites](https://developers.ledger.com/docs/connectivity/ledgerJS/integration-walkthrough).
- Install or update your THORChain Embedded app to the last version.

## Installation

First, open a terminal and create a new folder in your usual working directory. For this tutorial, the folder will be named “use-thorchain-webapp”.

Run:
```bash copy
mkdir use-thorchain-webapp
cd use-thorchain-webapp
```

Clone the repo (master branch) and go to the repo folder:
```bash copy
git clone https://github.com/blooo-io/ledger-thorchain-js.git
cd ledger-thorchain-js
```

Run:
```bash copy
yarn install 
npm install -g @vue/cli 
npm install -g @vue/cli-plugin-typescript
npm install vue-template-compiler
npm install --save-dev webpack
```


## Usage

Now, that all the needed packages are installed, you can launch the webapp by runnig:
```bash copy
npm run serve
```

The application is up and running. Open the browser and go to `http://localhost:8080`, it will display:

- Make sure to select the **WebUSB** option (as the U2F option is deprecated). 

- Connect your Nano to the USB port, unlock it and run the THORChain application. You’re now able to interact with the THORChain application.

- Click on **Get Version**

You’re able to retrieve the app version installed on your Ledger Nano device and some other information using the `getVersion()` function.

- Click on **AppInfo**

You’re able to retrieve the app version but also the app name and some other information using the `appInfo()` function.

- Click on **Get pubkey only**

You can retrieve the data contained in the public key and some other information using the `getPublicKey()` function.

- Click on **Get Address and Pubkey**

You can retrieve the public address, the data contained in the public key and some other information using the `getAddress()` and `getPublicKey()` functions.

- Click on **Show Address and Pubkey**:

	As in the previous step, you can retrieve the public address, the data contained in the public key and some other information, but here you can preview the public address on your Nano. The address you see on the Nano is the same as what you can have on your web app. In this case, the `showAddressAndPubKey()` function is used.

	- Press the right button to do the review

	- Verify that the correct address is showing on your Nano. Then, you can press the right button to approve or reject.

	- You can confirm by pressing both buttons.

	- You can also reject.

	After approving the review, the webapp will display to you the public address, the data of the public key and some other information.

- Click on **Sign Example TX**: 

Here, it provides you with an example of a transaction to sign on your Ledger Nano device using the `signExampleTx()` function. You’ll have to review the Chain ID, the Account, the Sequence, the Type, the Amount, the Delegator, the Validator, the Memo, the Fees and the Gas. Then you can approve or decline the transaction. 

If approved, your transaction is signed and the webapp will display it along with the type of transaction (here, a signature) and some other information.