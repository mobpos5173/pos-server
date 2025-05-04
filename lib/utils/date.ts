import { TZDate } from "@date-fns/tz";
import { enUS } from "date-fns/locale";
import { format } from "date-fns";

export const PH_TIMEZONE = "Asia/Manila";

export function formatDateToPH(
    date: string | Date,
    formatStr: string = "MMM dd, yyyy HH:mm"
): string {
    const tzDate = new TZDate(new Date(date), PH_TIMEZONE);
    return format(tzDate, formatStr, {
        locale: enUS,
    });
}

export function getCurrentPHDateTime(): string {
    const tzDate = new TZDate(new Date(), PH_TIMEZONE);
    return format(tzDate, "yyyy-MM-dd HH:mm:ss", {
        locale: enUS,
    });
}
