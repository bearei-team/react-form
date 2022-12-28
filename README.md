# react-form

Base form components that support React and React native

## Installation

> yarn add @bearei/react-form --save

## Parameters

#### Form

| Name | Type | Required | Description |
| :-- | --: | --: | :-- |
| form | `FormInstance` | ✘ | Form instance |
| initialValues | `Record<string, unknown>` | ✘ | Initializes the form value |
| items | `BaseFormItemProps` | ✘ | Form items |
| onFinish | `(options: OnFinishOptions) => void` | ✘ | This function is called when the form is completed |
| onFinishFailed | `(options: Errors) => void` | ✘ | This function is called when the form fails to complete |
| onValuesChange | `(changedValues: Record<string, unknown>, values: Record<string, unknown>) => void` | ✘ | This function is called when the form field value changes |
| renderMain | `(props: FormMainProps) => ReactNode` | ✔ | Render the form main |
| renderContainer | `(props: FormContainerProps) => ReactNode` | ✔ | Render the form container |

#### Form Item

| Name | Type | Required | Description |
| :-- | --: | --: | :-- |
| name | `string` | ✘ | Form item field name |
| label | `ReactNode` | ✘ | Form item label |
| noStyle | `ReactNode` | ✘ | Whether the form item is unstyled |
| initialValue | `unknown` | ✘ | The initial value of the form item |
| extra | `ReactNode` | ✘ | Additional content for the form item |
| required | `boolean` | ✘ | Whether the form entry is a required field |
| rules | `RuleItem[]` | ✘ | Validate rules -- [RuleItem](https://github.com/yiminghe/async-validator) |
| validateFirst | `boolean` | ✘ | When a rule fails, do you stop checking the rest of the rules |
| renderLabel | `(props: FormItemLabelProps) => ReactNode` | ✘ | Render the form item label |
| renderExtra | `(props: FormItemExtraProps) => ReactNode` | ✘ | Render the form item extra |
| renderMain | `(props: FormItemMainProps) => ReactNode` | ✔ | Render the form item main |
| renderContainer | `(props: FormItemContainerProps) => ReactNode` | ✔ | Render the form item container |

## Api

#### Form instance

| Name | Type | Description |
| :-- | --: | :-- |
| getFieldEntities | `(signOut?: boolean) => FieldEntity[]` | Gets the form field entities |
| getFieldEntitiesName | `(names?: string[], signOut?: boolean) => (string)[]` | Gets the form field entities name |
| signInField | `(entity: FieldEntity) => {signOut: () => void}` | Sign in form field |
| signOutField | `(name?: NamePath) => void` | Sign out form field |
| setFieldsValue | `(values?: Record<string, unknown>, options?: {validate?: boolean; response?: boolean}) => void` | Set the value of the form fields |
| getFieldValue | `(name?: NamePath): unknown` | Gets the value of the form field |
| setFieldError | `(error: Errors) => void` | Error setting form field |
| getFieldError | `(name?: NamePath): Errors ` | Gets the form field error |
| setInitialValues | `(values?: Record<string, unknown>, init?: boolean) => void` | Set the form initialization value |
| getInitialValues | `() => Record<string, unknown>` | Gets the form initialization value |
| setCallbacks | `(callbackValues: Callbacks) => void` | Sets the form callbacks |
| setFieldTouched | `(name?: string, touched?: boolean) => void` | Sets whether the form field is operated on |
| isFieldTouched | `(name?: NamePath) => boolean` | Check that the form fields have been manipulated |
| validateField | `(name?: NamePath): Promise<Errors>` | Validate form field |
| resetField | `(name?: NamePath) => void` | Reset the form field |
| submit | `(skipValidate?: boolean) => void` | Complete the form field submission |

## Use

```typescript
import React from 'React';
import ReactDOM from 'react-dom';
import form, { FormItem } from '@bearei/react-form';

const items = [
  { label: 'label1', name: 'name1' },
  { label: 'label2', name: 'name2' },
  { label: 'label3', name: 'name3' },
];

const form = (
  <Form
    items={items}
    renderMain={({ items }) =>
      items?.map((item, index) => (
        <Form.Item
          key={item.name}
          {...item}
          renderMain={({ value, onValueChange }) => (
            <input
              value={`${value}`}
              onChange={e => onValueChange?.(e.target.value)}
            />
          )}
          renderContainer={({ children }) => (
            <div tabIndex={index}>{children}</div>
          )}
        />
      ))
    }
    renderContainer={({ children }) => <div tabIndex={1}>{children}</div>}
  />
);

ReactDOM.render(form, container);
```
