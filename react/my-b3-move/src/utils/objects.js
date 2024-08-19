export function sanitizeObjectKeys(obj) {
  const sanitizedObject = {};

  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const sanitizedKey = key
      .replace(/[~*/[\]~.,\\\s]/g, "_")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      sanitizedObject[sanitizedKey] = sanitizeObjectKeys(obj[key]);
    } else {
      sanitizedObject[sanitizedKey] = obj[key];
    }
  }

  return sanitizedObject;
}
