function sanitizeString(value) {
  return value.replace(/[&<>"'`]/g, (char) => {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#96;',
    };

    return escapeMap[char];
  });
}

function checkValue(checking, Design) {
  const outcome = {};

  for (const Token in Design) {
    const setting = Design[Token];
    let point = checking[Token];

    if (point === undefined || point === null || point === "") {
      if (setting.required) throw new Error(`This field is required: ${Token}`);
      point =
        setting.default ??
        (setting.type === "number" ? 0 : setting.type === "array" ? [] : "");
    }

    if (setting.type === "number") {
      point = Number(point);
      if (isNaN(point)) throw new Error(`${Token} must be a number`);
      if (setting.min !== undefined && point < setting.min)
        throw new Error(`${Token} has to be >= ${setting.min}`);
      if (setting.max !== undefined && point > setting.max)
        throw new Error(`${Token} has to be <= ${setting.max}`);
    } else if (setting.type === "string") {
      point = String(point);

      if (setting.required && point.trim() === "")
        throw new Error(`This field is required: ${Token}`);

      if (setting.maxLength !== undefined && point.length > setting.maxLength)
        point = point.slice(0, setting.maxLength);
      if (setting.pattern && !setting.pattern.test(point))
        throw new Error(`${Token} is invalid`);

      point = sanitizeString(point);
    } else if (setting.type === "array") {
      if (!Array.isArray(point)) throw new Error(`${Token} has to be an array`);
      if (setting.minLength !== undefined && point.length < setting.minLength)
        throw new Error(
          `${Token} must include at least ${setting.minLength} items`
        );
      if (setting.maxLength !== undefined && point.length > setting.maxLength)
        throw new Error(
          `${Token} must include at most ${setting.maxLength} items`
        );
      if (setting.items && typeof setting.items === "object") {
        point = point.map((item, index) => {
          try {
            return checkValue(item, setting.items);
          } catch (err) {
            throw new Error(`${Token}[${index}] → ${err.message}`);
          }
        });
      }
    }

    outcome[Token] = point;
  }

  return outcome;
}

module.exports = checkValue;
