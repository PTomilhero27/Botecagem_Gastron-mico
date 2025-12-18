import { Vendor } from "@/lib/types";

export function renderMessageTemplate(template: string, vendor: Vendor) {
  return template.replace(/\{([\w.]+)\}/g, (_, key: string) => {
    const value = (vendor as any)[key];
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  });
}
