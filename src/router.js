/* ./src/router.css */

import { createRouter, createWebHistory } from "vue-router";
import Vault from "./components/Vault.vue";
import Wallet from "./components/Wallet.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Wallet,
    },
    {
      path: "/vault",
      component: Vault,
    },
  ],
});
