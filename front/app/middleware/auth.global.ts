export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ['/sign-in', '/sign-up']

  if (publicRoutes.includes(to.path)) {
    return
  }


  const config = useRuntimeConfig()

  try {
    await $fetch(`${config.public.base_url}/auth/me`, {
      credentials: 'include',
    })
  } catch (e) {
    return navigateTo('/sign-in')
  }
})

