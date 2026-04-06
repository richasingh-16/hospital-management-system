import prisma from "../../config/prisma";

const DEFAULTS: Record<string, string> = {
  currency:   "INR",
  dateFormat: "DD/MM/YYYY",
};

/** Return all settings as a plain object (fills in defaults for missing keys) */
export const getSettings = async (): Promise<Record<string, string>> => {
  const rows = await prisma.hospitalSetting.findMany();
  const result: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
};

/** Upsert one or more settings keys */
export const updateSettings = async (
  data: Record<string, string>
): Promise<Record<string, string>> => {
  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      prisma.hospitalSetting.upsert({
        where:  { key },
        update: { value },
        create: { key, value },
      })
    )
  );
  return getSettings();
};
