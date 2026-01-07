<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const toaster = { position: 'top-right' }
</script>

<template>
  <UApp :toaster="toaster">
    <NuxtPage/>
  </UApp>
</template>
