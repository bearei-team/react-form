import Schema, {RuleItem} from 'async-validator';

/**
 * 验证规则
 */
export type ValidateRule = RuleItem;

/**
 * 验证规则选项
 */
export interface ValidateRuleOptions {
  /**
   * 字段名称
   */
  name: string;

  /**
   * 验证值
   */
  value: unknown;

  /**
   * 验证规则
   */
  rule: ValidateRule;
}

/**
 * 验证规则集合选项
 */
export interface ValidateRulesOptions {
  /**
   * 字段名称
   */
  name: string;

  /**
   * 验证值
   */
  value: unknown;

  /**
   * 验证规则集合
   */
  rules: ValidateRule[];

  /**
   * 是否只验证首个规则
   */
  validateFirst?: boolean;
}

const validateRule = ({name, value, rule}: ValidateRuleOptions) => {
  const type = rule.type;

  return new Schema({[name]: rule}).validate({
    [name]: type === 'number' ? Number(value) : value,
  });
};

const validateRules = async ({
  name,
  value,
  rules,
  validateFirst,
}: ValidateRulesOptions) => {
  let errors = [] as unknown[];

  for (const rule of rules) {
    const validateErrors = await validateRule({name, value, rule})
      .then(() => undefined)
      .catch(err => err.errors);

    if (validateErrors) {
      errors = [...errors, validateErrors];

      if (validateFirst) {
        break;
      }
    }
  }

  return errors.flat();
};

export default validateRules;
