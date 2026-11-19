<script setup>
import { onMounted, useTemplateRef } from 'vue'
import AuthAlert from '../../Components/AuthAlert.vue'
import AuthField from '../../Components/AuthField.vue'
import AuthSubmitButton from '../../Components/AuthSubmitButton.vue'
import AuthLayout from '../../Layouts/AuthLayout.vue'
import { useAuthForm } from '../../composables/useAuthForm.js'
import fa from '../../lang/fa.js'
import { validateLogin } from '../../lib/authValidation.js'
import { Head, Link } from '../../lib/inertia.js'

defineOptions({ name: 'AuthLogin' })

const props = defineProps({
  submitUrl: { type: String, required: true },
  registerUrl: { type: String, default: '' },
  allowUsername: Boolean,
  notice: { type: String, default: '' },
})

const identifier = useTemplateRef('identifier')
const password = useTemplateRef('password')
const { form, focus, update, submit } = useAuthForm({ identifier: '', password: '' }, { identifier, password })

onMounted(() => focus('identifier'))

function submitLogin() {
  const transform = (data) => ({ ...data, identifier: data.identifier.trim() })
  submit(props.submitUrl, validateLogin(transform(form.data()), props.allowUsername), transform)
}

function dismissMessage() {
  form.clearErrors('form', 'credentials')
  focus('password')
}
</script>

<template>
  <Head :title="fa.auth.loginDocumentTitle" />

  <AuthLayout :heading="fa.auth.loginTitle" :notice="notice">
    <AuthAlert
      v-if="form.errors.credentials || form.errors.form"
      message-id="login-error"
      :message="form.errors.credentials || form.errors.form"
      @dismiss="dismissMessage"
    />

    <form class="grid gap-4" novalidate @submit.prevent="submitLogin">
      <AuthField
        ref="identifier"
        :model-value="form.identifier"
        name="identifier"
        :label="allowUsername ? fa.auth.emailOrUsername : fa.auth.email"
        :type="allowUsername ? 'text' : 'email'"
        :inputmode="allowUsername ? 'text' : 'email'"
        autocomplete="username"
        :error="form.errors.identifier"
        :described-by="form.errors.credentials ? 'login-error' : undefined"
        :disabled="form.processing"
        @update:model-value="update('identifier', $event)"
      />
      <AuthField
        ref="password"
        :model-value="form.password"
        name="password"
        type="password"
        :label="fa.auth.password"
        autocomplete="current-password"
        :error="form.errors.password"
        :described-by="form.errors.credentials ? 'login-error' : undefined"
        :disabled="form.processing"
        @update:model-value="update('password', $event)"
      />
      <AuthSubmitButton :label="fa.auth.login" :busy-label="fa.auth.signingIn" :busy="form.processing" />
    </form>

    <template v-if="registerUrl" #alternate>
      {{ fa.auth.noAccount }}
      <Link :href="registerUrl" class="ms-1 rounded-control font-bold text-accent hover:underline">{{ fa.auth.register }}</Link>
    </template>
  </AuthLayout>
</template>
