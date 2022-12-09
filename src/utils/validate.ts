import Schema, {RuleItem, ValidateError, ValidateFieldsError, Values} from 'async-validator';

/**
 *  Validate rule options
 */
export interface ValidateOptions {
  /**
   * The name of the validation field
   */
  name: string;

  /**
   * Validation field values
   */
  value: unknown;

  /**
   * Validate rules
   */
  rules?: RuleItem[];

  /**
   * When a rule fails, do you stop checking the rest of the rules
   */
  validateFirst?: boolean;
}

const validate = ({name, value, rules = [], validateFirst}: ValidateOptions) =>
  new Schema({[name]: rules}).validate(
    {[name]: value},
    {first: validateFirst, suppressWarning: true},
  );

const validateRule = async (options: ValidateOptions) => {
  const {rules, name, value} = options;
  const handleErrors = (errors: ValidateError[] | null, fields: ValidateFieldsError | Values) =>
    fields[name] === value ? undefined : {errors: errors ?? [], rules};

  return validate(options)
    .then(() => undefined)
    .catch(error => {
      if (!error.errors) {
        throw error;
      }

      const {errors, fields} = error;

      return handleErrors(errors, fields);
    });
};

export default validateRule;
