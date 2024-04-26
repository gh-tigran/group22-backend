import _ from "lodash";
import HttpErrors from "http-errors";


const validate = (schema) => (req, res, next) => {
  try {
    const errors = {};
    _.forEach(schema, (s, path) => {
      const validate = s.validate(req[path], {
        abortEarly: false
      });
      if (validate.error) {
        validate.error.details.map(e => {
          const message = e.message.replace(/^".*?"/, 'This field')
          _.set(errors, e.path, message)
        })
      } else {
        req[path] = validate.value;
      }
    });
    if (!_.isEmpty(errors)) {
      throw HttpErrors(422, { errors })
    }
    next();
  } catch (e) {
    next(e)
  }
}

export default validate;
