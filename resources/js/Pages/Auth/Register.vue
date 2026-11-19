<script setup>
import { onMounted, useTemplateRef } from 'vue'
import AuthAlert from '../../Components/AuthAlert.vue'
import AuthField from '../../Components/AuthField.vue'
import AuthSubmitButton from '../../Components/AuthSubmitButton.vue'
import AuthLayout from '../../Layouts/AuthLayout.vue'
import { useAuthForm } from '../../composables/useAuthForm.js'
import fa from '../../lang/fa.js'
import { validateRegistration } from '../../lib/authValidation.js'
import { Head, Link } from '../../lib/inertia.js'

defineOptions({ name: 'AuthRegister' })

const props = defineProps({
  submitUrl: { type: String, required: true },
  loginUrl: { type: String, required: true },
  registrationEnabled: Boolean,
  minimumPasswordLength: { type: Number, default: 0 },
  notice: { type: String, default: '' },
})

const email = useTemplateRef('email')
const password = useTemplateRef('password')
const consent = useTemplateRef('consent')
const disabledMessage = useTemplateRef('disabledMessage')
const { form, focus, update, submit } = useAuthForm(
  { email: '', password: '', consent: false },
  { email, password, consent, disabledMessage },
)

onMounted(() => focus(props.registrationEnabled ? 'email' : 'disabledMessage'))

function submitRegistration() {
  if (!props.registrationEnabled) return
  const transform = (data) => ({ ...data, email: data.email.trim() })
  submit(props.submitUrl, validateRegistration(transform(form.data()), props.minimumPasswordLength), transform)
}

function dismissMessage() {
  form.clearErrors('form')
  focus('password')
}
</script>

<template>
  <Head :title="fa.auth.registerDocumentTitle" />

  <AuthLayout :heading="fa.auth.registerTitle" :notice="notice">
    <template v-if="registrationEnabled">
      <AuthAlert v-if="form.errors.form" :message="form.errors.form" @dismiss="dismissMessage" />
      <form class="grid gap-4" novalidate @submit.prevent="submitRegistration">
        <AuthField
          ref="email"
          :model-value="form.email"
          name="email"
          type="email"
          inputmode="email"
          :label="fa.auth.email"
          autocomplete="email"
          :error="form.errors.email"
          :disabled="form.processing"
          @update:model-value="update('email', $event)"
        />
        <AuthField
          ref="password"
          :model-value="form.password"
          name="password"
          type="password"
          :label="fa.auth.password"
          autocomplete="new-password"
          :error="form.errors.password"
          :disabled="form.processing"
          @update:model-value="update('password', $event)"
        />
        <div class="grid gap-1">
          <label for="consent" class="flex min-h-control items-center gap-2 text-secondary">
            <input
              id="consent"
              ref="consent"
              name="consent"
              type="checkbox"
              required
              :checked="form.consent"
              :disabled="form.processing"
              :aria-invalid="Boolean(form.errors.consent) || undefined"
              :aria-describedby="form.errors.consent ? 'consent-error' : undefined"
              class="size-4 shrink-0 accent-accent"
              @change="update('consent', $event.target.checked)"
            />
            {{ fa.auth.consent }}
          </label>
          <p v-if="form.errors.consent" id="consent-error" class="text-body text-auth-error">{{ form.errors.consent }}</p>
        </div>
        <AuthSubmitButton :label="fa.auth.register" :busy-label="fa.auth.creatingAccount" :busy="form.processing" />
      </form>
    </template>

    <p v-else ref="disabledMessage" tabindex="-1" class="rounded-control border border-subtle bg-input p-3 text-secondary" role="status">
      {{ fa.auth.registrationClosed }}
    </p>

    <template #alternate>
      <span v-if="registrationEnabled">{{ fa.auth.alreadyRegistered }}</span>
      <Link :href="loginUrl" class="ms-1 rounded-control font-bold text-accent hover:underline">
        {{ registrationEnabled ? fa.auth.login : fa.auth.backToLogin }}
      </Link>
    </template>
  </AuthLayout>
</template>
