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

const toast = useToast()
const api = useApiAction()
const schema = z.object({
  username: z.string('Username is required').min(5, 'Must be at least 5 characters'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
})

const errorMessage = ref()
const loading = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  errorMessage.value = null
  loading.value = true
  try {
    await api.post('auth/sign-up', {
      username: payload.data.username,
      password: payload.data.password
    })
    navigateTo('/sign-in')
    toast.add({
      title: 'Successfully created',
      description: 'You can now sign in with your new account.',
      icon: 'lucide:badge-check'
    })
  } catch (error: any) {
    if(error.data.message) {
      if(Array.isArray(error.data.message)) {
        errorMessage.value = error.data.message.join(' ')
      } else {
        errorMessage.value = error.data.message
      }
    } else {
      errorMessage.value = 'An unknown error occurred.'
    }
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
        title="Sign-up here!"
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
        :submit="{
          label: 'Create',
          loading
        }"
      >
        <template #description>
          Do you have an account? <ULink to="/sign-in" class="text-primary font-medium">Sign in</ULink>.
        </template>
        <template #validation>
          <UAlert v-if="errorMessage" color="error" icon="i-lucide-info" :title="errorMessage" :ui="{title: 'text-white', icon: 'text-white'}"/>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>

<style scoped>

</style>
