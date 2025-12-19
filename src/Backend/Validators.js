import localization from '../Constants/localization';

export const VALIDATE = {
  EMAIL:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  ALPHABET_ONLY: /^[a-zA-Z \s]*$/,
  NUMBER: /[0-9]$/,
  MOBILE: /^\+?[0-9\-()]{1,20}$/,
  PASSWORD: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
  URL: /^(((http|https):\/\/)?(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}(:[0-9]{1,5})?(\/[^\s]*)?)$/,
  OTP: /^[0,1,2,3,4,5,6,7,8,9]*$/,
  CLEANED: (/\s/g, ''),
};
const hasWhitespace = value => /\s/.test(value);

export const validators = {
  checkPassword: (name, value) => {
    if (!value) {
      return `${name} ${localization?.validation?.isRequired}`;
    }

    if (hasWhitespace(value)) {
      return `${name} ${localization?.validation?.cant}`;
    }

    if (value?.length < 3) {
      return `${name} ${localization?.validation?.must}`;
    }

    return null;
  },

  checkRequire: (name, value) => {
    if (!value) {
      return `${name} ${localization?.validation?.isRequired}`;
    }

    if (hasWhitespace(value)) {
      return `${name} ${localization?.validation?.cant}`;
    }

    return null;
  },
  checkOnlyRequire: (name, value) => {
    if (!value) {
      return `${name} ${localization?.validation?.isRequired}`;
    }

    return null;
  },
  checkRequireAndTrim: (name, value) => {
    // Remove leading/trailing spaces
    const trimmed = value ? value.trim() : '';

    // Check if required after trim
    if (!trimmed) {
      return `${name} ${localization?.validation?.isRequired}`;
    }

    return null;
  },

  checkNumber: (name, value) => {
    if (!value) {
      return `${name} ${localization?.validation?.isRequired}`;
    }

    if (hasWhitespace(value)) {
      return `${name} ${localization?.validation?.cant}`;
    }

    const onlyNumbers = /^\d{10}$/;
    if (!onlyNumbers.test(value)) {
      return `${name} ${localization?.validation?.mustBe}`;
    }

    return null;
  },

  checkOtp: (name, value) => {
    if (value) {
      if (!VALIDATE.OTP.test(value)) {
        return `${name} ${localization?.validation?.shouldContain}`;
      } else if (value?.length < 4) {
        return `${name} ${localization?.validation?.digits}`;
      }
      return null;
    } else {
      return `${name} ${localization?.validation?.isRequired}`;
    }
  },
  checkMatch: (name, value, name2, value2) => {
    if (value2) {
      if (value === value2) {
        return '';
      } else {
        return `${name} ${localization?.validation?.and} ${name2} ${localization?.validation?.notMatch}`;
      }
    } else {
      return `${name2} ${localization?.validation?.isRequired}`;
    }
  },
  checkEmail: (name, value) => {
    if (value) {
      if (!VALIDATE.EMAIL.test(value)) {
        return `${name} ${localization?.validation?.invalid}`;
      } else {
        return null;
      }
    } else {
      return `${name} ${localization?.validation?.isRequired}`;
    }
  },

  checkNoEdgeSpaces: (name, value) => {
    if (!value || !value.trim()) {
      return `${name} ${localization?.validation?.isRequired}`;
    }

    const noLeadingOrTrailingSpaces = /^(?! )[A-Za-z0-9 ]*(?<! )$/;

    if (!noLeadingOrTrailingSpaces.test(value)) {
      return `${name} ${localization?.validation?.start}`;
    }

    if (value.trim().length < 3) {
      return `${name} ${localization?.validation?.atleast}`;
      // added to check the  min length 3
    }

    return null;
  },
};
