export function useApiAction() {
  const config = useRuntimeConfig()

  const request = <T>(url: string, options = {}) =>
    $fetch<T>(url, {
      baseURL: config.public.base_url,
      ...options,
      credentials: 'include',
    })

  return {
    post: <T>(url: string, body?: any) =>
      request<T>(url, { method: 'POST', body}),

    patch: <T>(url: string, body?: any) =>
      request<T>(url, { method: 'PATCH', body }),

    del: <T>(url: string) =>
      request<T>(url, { method: 'DELETE' }),
  }
}

