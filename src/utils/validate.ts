import Schema, {RuleItem, ValidateError, ValidateFieldsError, Values} from 'async-validator';

/**
 * 校验规则选项
 */
export interface ValidateOptions {
  /**
   * 字段名称
   */
  name: string;

  /**
   * 校验值
   */
  value: unknown;

  /**
   * 校验规则集合
   */
  rules?: RuleItem[];

  /**
   * 当某一规则校验不通过时，是否停止剩下的规则的校验
   */
  validateFirst?: boolean;
}

const validate = ({name, value, rules = [], validateFirst}: ValidateOptions) =>
  new Schema({[name]: rules}).validate(
    {[name]: value},
    {first: validateFirst, suppressWarning: true},
  );

export const validateRule = async ({rules, name, value, ...args}: ValidateOptions) => {
  const handleErrors = (errors: ValidateError[] | null, fields: ValidateFieldsError | Values) =>
    fields[name] === value ? undefined : {errors: errors ?? [], rules};

  return validate({rules, name, value, ...args})
    .then(() => undefined)
    .catch(error => {
      if (!error.errors) {
        throw error;
      }

      const {errors, fields} = error;

      return handleErrors(errors, fields);
    });
};
