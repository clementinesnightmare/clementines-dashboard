<!--./src/components/Wallet.vue -->

<template>
  <div class="section text-center m-4">
    <p class="text-red-500 mb-2" v-if="hasError()">{{ errorMessage }}</p>
    <p class="text-blue-500 mb-2" v-if="hasNotice()">
      {{ noticeMessage }}
    </p>
    <div v-if="hasActiveAccount()">Wallet</div>
  </div>
</template>

<script>
import Web3 from "web3/dist/web3.min.js";
import Decimal from "decimal.js";
import { each, map, reverse } from "lodash";
import { BigNumber } from "bignumber.js";

const web3js = new Web3();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Debugging helpers.
window.web3js = web3js;
window.Web3NoMeta = Web3;

export default {
  name: "clementines-dashboard",
  data: function () {
    return {
      accounts: [],
      activeAccount: "",
      attemptedRegistration: false,
      bindingRetries: 0,
      bindingsAdded: false,
      connected: null,
      errorMessage: "",
      noticeMessage: "",
      pendingConnection: null,
      stopRequests: false,
      timer: null,
    };
  },
  components: {},
  created: async function () {},
  mounted: async function () {
    this.checkState();
  },
  unmounted: function () {},
  methods: {
    addBindings: function () {
      if (!this.backendAvailable() || this.bindingsAdded) {
        this.bindingRetries += 1;
        return;
      }

      if (window.ethereum.isMetaMask) {
        window.ethereum.on("accountsChanged", (chainId) => {
          this.resetConnection();
          this.updateAccount();
        });

        window.ethereum.on("chainChanged", (chainId) => {
          this.resetConnection();
          this.checkState();
        });
      }

      this.bindingsAdded = true;
    },
    resetNotices: function () {
      this.errorMessage = "";
      this.noticeMessage = "";
    },
    setNotice: function (text) {
      this.noticeMessage = text;
      this.noticeDate = Date.now();
    },
    setError: function (text) {
      this.errorMessage = text;
      this.errorDate = Date.now();
    },
    resetConnection: function () {
      this.connected = false;
      this.pendingConnection = false;
      this.stopRequests = false;
    },
    backendAvailable: function () {
      return typeof window.ethereum !== "undefined";
    },
    validNetwork: function () {
      return window.ethereum.chainId === "0x1";
    },
    hasAccounts: function () {
      return this.accounts.length > 0;
    },
    hasActiveAccount: function () {
      return this.activeAccount !== "";
    },
    hasError: function () {
      return this.errorMessage !== "";
    },
    hasNotice: function () {
      return this.noticeMessage !== "";
    },
    unavailable: function () {
      return !(this.backendAvailable() && this.validNetwork());
    },
    shouldAttemptConnection: function () {
      if (this.stopRequests) {
        return false;
      }

      if (this.pendingConnection) {
        return false;
      }

      return true;
    },
    handleConnected: function () {
      // Fresh connections clear the notifications.
      if (this.connected !== true) {
        this.resetNotices();
      }

      this.connected = true;
      this.pendingConnection = false;

      // Notifications must persist for at least 3 seconds.
      if (Date.now() - this.noticeDate > 3000) {
        this.noticeMessage = "";
        this.noticeDate = 0;
      }

      // Errors must persist for at least 3 seconds.
      if (Date.now() - this.errorDate > 3000) {
        this.errorMessage = "";
        this.errorDate = 0;
      }
    },
    formatError: function (err) {},
    handleConnectionFailed: function (error) {
      this.noticeMessage = "";
      this.connected = false;
      this.pendingConnection = false;
      this.stopRequests = true;

      const errorPrefix = "Error " + error.code + ": ";

      if (error.code === 4001) {
        this.setError(errorPrefix + "Access to accounts denied.");
      } else {
        this.setError(errorPrefix + error.message);
      }
    },
    updateAccount: async function () {
      if (this.shouldAttemptConnection()) {
        this.pendingConnection = true;

        try {
          this.accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          this.handleConnected();

          if (this.accounts.length > 0) {
            this.activeAccount = this.accounts[0];
            // Update NFT list.
          }
        } catch (error) {
          this.handleConnectionFailed(error);
        }
      }
    },
    attemptMetaMaskProviderRegistration: async function () {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }],
        });
        return true;
      } catch (switchError) {
        return false;
      }
    },
    checkState: async function () {
      this.addBindings();

      if (this.unavailable()) {
        let success = false;

        if (!this.attemptedRegistration) {
          this.attemptedRegistration = true;
          success = await this.attemptMetaMaskProviderRegistration();
        }

        if (success) {
          return;
        }

        this.resetData();
        if (!this.backendAvailable()) {
          this.setError("Please install MetaMask to get started!");
        } else {
          this.setError(
            "Please login to MetaMask and connect to the Ethereum network!"
          );
        }

        if (this.bindingRetries < 15) {
          await delay(250);
          this.checkState();
        }

        return;
      }

      this.updateAccount();
    },
    resetData: function () {
      this.accounts = [];
      this.activeAccount = "";
      this.connected = null;
      this.errorMessage = "";
      this.pendingConnection = null;
      this.stopRequests = false;
    },
  },
};
</script>
