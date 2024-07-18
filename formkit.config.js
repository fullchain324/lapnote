import { defaultConfig } from '@formkit/vue'
import { generateClasses } from '@formkit/themes'

const textClassification = {
  input: `
  $reset
   input
   input-bordered
   w-full
   max-w-xs
   focus-within:input-info
   formkit-invalid:input-error
  `,
  label: 'font-bold text-sm formkit-invalid:text-red-500 mb-1 block'
}
const buttonClassification = {
  input: '$reset btn btn-info'
}

const theme = {
  // the global key will apply to all inputs
  global: {
    help: 'text-xs text-gray-500 m-1',
    message: '$reset text-error text-xs m-1',
    label: '$reset label-text m-1',
    outer: '$reset my-4'
  },
  button: buttonClassification,
  date: textClassification,
  'datetime-local': textClassification,
  checkbox: {
    input: '$reset checkbox checkbox-accent',
    inner: '$reset inline',
    label: '$reset ml-2 label-text',
    legend: '$reset font-bold px-1 mb-1',
    fieldset: '$reset',
    wrapper: '$reset cursor-pointer flex items-center justify-start max-w-fit'
  },
  email: textClassification,
  month: textClassification,
  number: textClassification,
  password: textClassification,
  radio: {
    input: '$reset radio radio-accent',
    inner: '$reset inline',
    label: '$reset ml-2 label-text',
    legend: '$reset font-bold px-1 mb-1 block',
    fieldset: '$reset',
    wrapper: '$reset cursor-pointer my-2 flex items-center justify-start max-w-fit'
  },
  range: {
    input: '$reset range range-secondary'
  },
  search: textClassification,
  select: textClassification,
  submit: buttonClassification,
  tel: textClassification,
  text: textClassification,
  textarea: {
    label: '$reset label-text m-1 font-bold block',
    input: `
    $reset
    textarea
    w-full
    input-bordered
    focus-within:input-info
    formkit-invalid:input-error
    `
  },
  time: textClassification,
  url: textClassification,
  week: textClassification
}

const focusPlugin = (node) => {
  if (node.type !== 'input') return

  node.on('created', () => {
    const focus = () => {
      const el = document.getElementById(node.props.id)
      if (el) {
        el.focus()
      }
    }

    node.context.fns.focus = focus
  })
}

export default defaultConfig({
  plugins: [focusPlugin],
  config: {
    classes: generateClasses(theme),

  }
})