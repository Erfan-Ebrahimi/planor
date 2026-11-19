import { nextTick } from 'vue'
import fa from '../lang/fa.js'
import { useForm } from '../lib/inertia.js'

export function useAuthForm(data, fields) {
  const form = useForm(data).dontRemember('password')

  async function focus(field) {
    await nextTick()
    fields[field]?.value?.focus()
  }

  function focusFirstError(errors) {
    const field = Object.keys(fields).find((name) => errors[name])
    return focus(field || 'password')
  }

  function update(field, value) {
    form[field] = value
    form.clearErrors(field, 'form', 'credentials')
  }

  function submit(url, errors, transform) {
    if (form.processing) return

    form.clearErrors()
    if (Object.keys(errors).length) {
      form.setError(errors)
      focusFirstError(errors)
      return
    }

    let errorFields
    form.transform(transform).post(url, {
      replace: true,
      onError(errors) {
        errorFields = errors
      },
      onNetworkError() {
        errorFields = { form: fa.auth.errors.submission }
        form.setError(errorFields)
        return false
      },
      onSuccess: () => form.reset('password'),
      onFinish() {
        if (!errorFields) return
        form.reset('password')
        focusFirstError(errorFields)
      },
    })
  }

  return { form, focus, update, submit }
}
