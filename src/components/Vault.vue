<!--./src/components/Vault.vue -->

<template>
  <div class="section m-4 text-center">
    Vault
  </div>
</template>

<script>
export default {
  name: "Community",
  methods: {
    goToURI: function (uri) {
      location.href = uri;
    },
  },
};
</script>
