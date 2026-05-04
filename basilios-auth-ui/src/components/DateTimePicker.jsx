import { useMemo } from "react";
import Flatpickr from "react-flatpickr";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import "flatpickr/dist/flatpickr.min.css";
import "../styles/flatpickr-basilios.css";

function parseValue(value, withTime) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const safe = String(value).replace(" ", "T");
  const [datePart, timePart = ""] = safe.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  if (!withTime) {
    return new Date(year, month - 1, day, 0, 0);
  }

  const [hour = "0", minute = "0"] = timePart.split(":");
  const hh = Number(hour) || 0;
  const mm = Number(minute) || 0;
  return new Date(year, month - 1, day, hh, mm);
}

function formatValue(date, withTime) {
  if (!(date instanceof Date)) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  if (!withTime) {
    return `${y}-${m}-${d}`;
  }

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export default function DateTimePicker({
  value,
  onChange,
  minDate,
  maxDate,
  enableTime = false,
  disabled = false,
  placeholder = "Selecione a data",
  inputClassName = "",
  calendarClassName = "basilios-flatpickr",
}) {
  const selectedDate = useMemo(() => parseValue(value, enableTime), [value, enableTime]);
  const minDateValue = useMemo(() => parseValue(minDate, enableTime), [minDate, enableTime]);
  const maxDateValue = useMemo(() => parseValue(maxDate, enableTime), [maxDate, enableTime]);

  const options = useMemo(
    () => ({
      enableTime,
      time_24hr: true,
      dateFormat: enableTime ? "d/m/Y H:i" : "d/m/Y",
      locale: Portuguese,
      allowInput: true,
      minDate: minDateValue || undefined,
      maxDate: maxDateValue || undefined,
      altInput: true,
      altFormat: enableTime ? "d/m/Y H:i" : "d/m/Y",
      onReady: (_, __, instance) => {
        instance?.calendarContainer?.classList.add(calendarClassName);
      },
      onOpen: (_, __, instance) => {
        instance?.calendarContainer?.classList.add(calendarClassName);
      },
    }),
    [enableTime, minDateValue, maxDateValue, calendarClassName],
  );

  const handleChange = (dates) => {
    const date = Array.isArray(dates) ? dates[0] : dates;
    const nextValue = date ? formatValue(date, enableTime) : "";
    onChange?.(nextValue);
  };

  return (
    <Flatpickr
      value={selectedDate}
      onChange={handleChange}
      options={options}
      className={inputClassName}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}
