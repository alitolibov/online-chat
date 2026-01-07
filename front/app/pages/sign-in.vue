<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import {useApiAction} from "~/composables/api";

type Schema = z.output<typeof schema>

const fields: AuthFormField[] = [{
  name: 'username',
  type: 'text',
  label: 'Username',
  placeholder: 'Enter your username',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}]

const api = useApiAction()
const schema = z.object({
  username: z.string('Username is required').min(1, 'Username is required'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
})

const error = ref(false)
const loading = ref(false)


async function onSubmit(payload: FormSubmitEvent<Schema>) {
  error.value = false
  loading.value = true
  try {
    const data = await api.post('auth/sign-in', {
      username: payload.data.username,
      password: payload.data.password
    })

    navigateTo('/')
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center h-screen container mx-auto">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Welcome back!"
        icon="i-lucide-lock"
        :fields="fields"
        @submit="onSubmit"
        :submit="{
          label: 'Sign in'
        }"
      >
        <template #description>
          Don't have an account? <ULink to="/sign-up" class="text-primary font-medium">Sign up</ULink>.
        </template>
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
        </template>
        <template #validation>
          <UAlert v-if="error" color="error" icon="i-lucide-info" title="Error signing in" :ui="{title: 'text-white', icon: 'text-white'}"/>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

<style scoped>

</style>
