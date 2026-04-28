import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Clock3,
  FileText,
  ImagePlus,
  Info,
  Loader2,
  Pencil,
  Pill,
  Plus,
  Sparkles,
  Trash2,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  createReminder,
  deleteReminder,
  getMyReminders,
  scanReminderImage,
  toggleReminderStatus,
  updateReminder,
  logDoseStatus,
} from "../api/reminderApi";
import { getApiOrigin } from "../config/apiBaseUrl";

const getTodayDate = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getFutureDate = (daysAhead = 7) => {
  const future = new Date();
  future.setDate(future.getDate() + daysAhead);
  const timezoneOffset = future.getTimezoneOffset() * 60000;
  return new Date(future.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const createInitialFormState = () => ({
  medicineName: "",
  dose: "",
  frequency: "",
  times: ["07:00"],
  startDate: getTodayDate(),
  endDate: getFutureDate(7),
  rawScanText: "",
  image: "",
});

const API_ROOT = getApiOrigin();
const FIXED_REMINDER_VISUAL = "/Respiratory.jpg";

const getImageUrl = (imagePath = "") => {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${API_ROOT}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const formatTime = (value) => {
  if (!value) return "N/A";

  const [hours, minutes] = String(value).split(":");
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);

  if (
    Number.isNaN(parsedHours) ||
    Number.isNaN(parsedMinutes) ||
    parsedHours < 0 ||
    parsedHours > 23 ||
    parsedMinutes < 0 ||
    parsedMinutes > 59
  ) {
    return value;
  }

  return new Date(2000, 0, 1, parsedHours, parsedMinutes).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getHistoryTimestamp = (entry = {}) => {
  try {
    const baseDate = new Date(entry.date);

    if (Number.isNaN(baseDate.getTime())) {
      return 0;
    }

    const [hours = "0", minutes = "0"] = String(entry.time || "00:00").split(":");
    baseDate.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
    return baseDate.getTime();
  } catch {
    return 0;
  }
};

const Reminder = ({ isDashboardView = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState(createInitialFormState);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    loadReminders();
  }, []);

  useEffect(() => {
    if (loadingReminders) return;

    const editReminderId = searchParams.get("edit");

    if (!editReminderId) return;

    const reminderToEdit = reminders.find((reminder) => reminder._id === editReminderId);

    if (!reminderToEdit) return;

    setEditingId(reminderToEdit._id);
    setSelectedFile(null);
    setForm({
      medicineName: reminderToEdit.medicineName || "",
      dose: reminderToEdit.dose || "",
      frequency: reminderToEdit.frequency || "",
      times: reminderToEdit.times?.length ? reminderToEdit.times : [""],
      startDate: reminderToEdit.startDate ? String(reminderToEdit.startDate).slice(0, 10) : getTodayDate(),
      endDate: reminderToEdit.endDate ? String(reminderToEdit.endDate).slice(0, 10) : getFutureDate(7),
      rawScanText: reminderToEdit.rawScanText || "",
      image: reminderToEdit.image || "",
    });

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("edit");
    setSearchParams(nextSearchParams, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadingReminders, reminders, searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(form.image ? getImageUrl(form.image) : "");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, form.image]);

  const loadReminders = async () => {
    try {
      setLoadingReminders(true);
      const { data } = await getMyReminders();
      setReminders(Array.isArray(data?.reminders) ? data.reminders : []);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load reminders");
      setReminders([]);
    } finally {
      setLoadingReminders(false);
    }
  };

  const resetForm = () => {
    setForm(createInitialFormState());
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingId("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleTimeChange = (index, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      times: currentForm.times.map((time, timeIndex) =>
        timeIndex === index ? value : time
      ),
    }));
  };

  const addTimeField = () => {
    setForm((currentForm) => ({
      ...currentForm,
      times: [...currentForm.times, ""],
    }));
  };

  const removeTimeField = (index) => {
    setForm((currentForm) => {
      const nextTimes = currentForm.times.filter((_, timeIndex) => timeIndex !== index);
      return {
        ...currentForm,
        times: nextTimes.length ? nextTimes : [""],
      };
    });
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);

    if (!nextFile) {
      setPreviewUrl(form.image ? getImageUrl(form.image) : "");
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      alert("Please upload a medicine image before scanning.");
      return;
    }

    try {
      setScanLoading(true);
      const { data } = await scanReminderImage(selectedFile);
      const parsedReminder = data?.parsedReminder || {};

      setForm((currentForm) => ({
        ...currentForm,
        medicineName: parsedReminder.medicineName || currentForm.medicineName,
        dose: parsedReminder.dose || currentForm.dose,
        frequency: parsedReminder.frequency || currentForm.frequency,
        times:
          parsedReminder.times?.length > 0
            ? parsedReminder.times
            : currentForm.times.length
              ? currentForm.times
              : [""],
        rawScanText: data?.rawScanText || currentForm.rawScanText,
        image: data?.image || currentForm.image,
      }));
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to scan medicine image");
    } finally {
      setScanLoading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const trimmedTimes = form.times.map((time) => time.trim()).filter(Boolean);

    if (!trimmedTimes.length) {
      alert("Please add at least one reminder time.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...form,
        times: trimmedTimes,
      };

      const { data } = editingId
        ? await updateReminder(editingId, payload)
        : await createReminder(payload);

      const nextReminder = data?.reminder;

      setReminders((currentReminders) => {
        if (!nextReminder) {
          return currentReminders;
        }

        if (editingId) {
          return currentReminders.map((reminder) =>
            reminder._id === nextReminder._id ? nextReminder : reminder
          );
        }

        return [nextReminder, ...currentReminders];
      });

      resetForm();
      alert(data?.message || "Reminder saved successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save reminder");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder._id);
    setSelectedFile(null);
    setForm({
      medicineName: reminder.medicineName || "",
      dose: reminder.dose || "",
      frequency: reminder.frequency || "",
      times: reminder.times?.length ? reminder.times : [""],
      startDate: reminder.startDate ? String(reminder.startDate).slice(0, 10) : getTodayDate(),
      endDate: reminder.endDate ? String(reminder.endDate).slice(0, 10) : getFutureDate(7),
      rawScanText: reminder.rawScanText || "",
      image: reminder.image || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (reminderId) => {
    const confirmed = window.confirm("Delete this reminder?");
    if (!confirmed) return;

    try {
      setActionId(reminderId);
      const { data } = await deleteReminder(reminderId);
      setReminders((currentReminders) =>
        currentReminders.filter((reminder) => reminder._id !== reminderId)
      );

      if (editingId === reminderId) {
        resetForm();
      }

      alert(data?.message || "Reminder deleted successfully");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete reminder");
    } finally {
      setActionId("");
    }
  };

  const handleToggle = async (reminderId) => {
    try {
      setActionId(reminderId);
      const { data } = await toggleReminderStatus(reminderId);
      const nextReminder = data?.reminder;

      setReminders((currentReminders) =>
        currentReminders.map((reminder) =>
          reminder._id === reminderId ? nextReminder || reminder : reminder
        )
      );
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update reminder");
    } finally {
      setActionId("");
    }
  };

  const handleLogStatus = async (reminderId, time, status) => {
    try {
      setActionId(`${reminderId}-${time}`);
      const payload = {
        date: getTodayDate(),
        time,
        status,
      };

      const { data } = await logDoseStatus(reminderId, payload);
      const nextReminder = data?.reminder;

      setReminders((currentReminders) =>
        currentReminders.map((reminder) =>
          reminder._id === reminderId ? nextReminder || reminder : reminder
        )
      );
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to log dose status");
    } finally {
      setActionId("");
    }
  };

  const getDoseStatus = (reminder, time) => {
    if (!reminder.history) return null;
    const today = getTodayDate();
    const entry = reminder.history.find((item) => {
      try {
        const d = new Date(item.date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const itemDate = `${yyyy}-${mm}-${dd}`;
        return itemDate === today && item.time === time;
      } catch (e) {
        return false;
      }
    });
    return entry?.status;
  };

  const historyEntries = reminders
    .flatMap((reminder) =>
      (reminder.history || []).map((entry) => ({
        ...entry,
        medicineName: reminder.medicineName,
        reminderId: reminder._id,
      }))
    )
    .sort((leftEntry, rightEntry) => getHistoryTimestamp(rightEntry) - getHistoryTimestamp(leftEntry));

  const activeReminderCount = reminders.filter((reminder) => reminder.isActive).length;
  const today = getTodayDate();

  return (
    <div className={isDashboardView ? "" : "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.35),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(253,224,71,0.2),_transparent_24%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_45%,#f8fafc_100%)] py-3 sm:py-4"}>
      <div className={isDashboardView ? "" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"}>
        <div className={`overflow-hidden ${isDashboardView ? "" : "rounded-[24px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur"}`}>
          {!isDashboardView && (
            <div className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_30%,#0ea5e9_100%)] px-5 py-6 text-white sm:px-6 sm:py-8">
              <div className="absolute inset-y-0 right-[-10%] w-[280px] rounded-full bg-white/10 blur-3xl" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                    <Bell size={14} />
                    Smart Reminder Care
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                    Medicine reminders with OCR auto scan
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                    Upload a strip, box, or prescription image, let Tesseract pull out the details,
                    fine-tune anything manually, and keep daily reminder emails running on time.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: ImagePlus, label: "Upload & preview" },
                    { icon: Sparkles, label: "OCR auto-fill" },
                    { icon: Clock3, label: "Email schedule" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm text-white/90"
                      >
                        <Icon size={18} className="text-sky-200" />
                        <p className="mt-3 font-semibold">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
            <form
              onSubmit={handleSave}
              className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_15px_40px_rgba(15,23,42,0.05)] sm:p-5"
            >
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                    Reminder Form
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {editingId ? "Edit reminder" : "Create new reminder"}
                  </h2>
                </div>

                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <X size={16} />
                    Cancel edit
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4">
                <div className="rounded-[20px] border border-dashed border-sky-200 bg-sky-50/70 p-4 sm:p-4">
                  <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Upload medicine strip, box, or prescription image
                      </label>
                      <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50">
                        <ImagePlus size={18} className="text-sky-500" />
                        <span>{selectedFile ? selectedFile.name : "Choose image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleScan}
                        disabled={scanLoading || !selectedFile}
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {scanLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        {scanLoading ? "Scanning medicine..." : "Scan Medicine"}
                      </button>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-3">
                      <div className="flex h-full min-h-[200px] items-center justify-center overflow-hidden rounded-[20px] bg-slate-100">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Medicine preview"
                            className="h-full max-h-[240px] w-full object-cover"
                          />
                        ) : (
                          <div className="px-4 text-center text-sm text-slate-500">
                            Image preview appears here
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Pill size={16} className="text-sky-500" />
                      Medicine name
                    </span>
                    <input
                      type="text"
                      name="medicineName"
                      value={form.medicineName}
                      onChange={handleInputChange}
                      placeholder="Example: Paracetamol"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Dose</span>
                    <input
                      type="text"
                      name="dose"
                      value={form.dose}
                      onChange={handleInputChange}
                      placeholder="Example: 500 mg / 1 tablet"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Frequency</span>
                    <input
                      type="text"
                      name="frequency"
                      value={form.frequency}
                      onChange={handleInputChange}
                      placeholder="OD / BD / TDS / HS"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
                      required
                    />
                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      OD = once daily, BD = twice daily, TDS = three times daily, HS = at bedtime
                    </p>
                  </label>

                  <div>
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Clock3 size={16} className="text-sky-500" />
                      Reminder times
                    </span>
                    <div className="space-y-3">
                      {form.times.map((time, index) => (
                        <div key={`${index}-${time}`} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={time}
                            onChange={(event) => handleTimeChange(index, event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeTimeField(index)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-500"
                            aria-label="Remove time"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addTimeField}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Plus size={16} />
                        Add time
                      </button>
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CalendarDays size={16} className="text-sky-500" />
                      Start date
                    </span>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">End date</span>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
                      required
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText size={16} className="text-sky-500" />
                    Raw OCR text
                  </span>
                  <textarea
                    name="rawScanText"
                    value={form.rawScanText}
                    onChange={handleInputChange}
                    rows="7"
                    placeholder="Scanned text appears here after OCR. You can still edit everything manually."
                    className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white"
                  />
                </label>

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Suggestions from OCR are editable before you save the reminder.
                  </p>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Bell size={18} />}
                    {saving ? "Saving..." : editingId ? "Update reminder" : "Save reminder"}
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_15px_40px_rgba(15,23,42,0.05)] sm:p-5">
                <div className="mb-6 rounded-[24px] border border-sky-100 bg-[linear-gradient(180deg,#f8fdff_0%,#eef8ff_100%)] p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                      <Info size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                        Dose Guide
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-slate-900">
                        What OD / BD / TDS / HS means
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        If OCR or a doctor note shows short forms, users can understand them here.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="flex items-start gap-3">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          OD
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">Once Daily</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Take the medicine <strong>once a day</strong>.
                            Suggested time: <strong>07:00 AM</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="flex items-start gap-3">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          BD
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">Twice Daily</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Take the medicine <strong>two times a day</strong>.
                            Suggested times: <strong>07:00 AM</strong> and <strong>07:00 PM</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="flex items-start gap-3">
                        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                          TDS
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">Three Times Daily</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Take the medicine <strong>three times a day</strong>.
                            Suggested times: <strong>07:00 AM</strong>, <strong>12:00 PM</strong>, and <strong>07:00 PM</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div className="flex items-start gap-3">
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                          HS
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">At Bedtime</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Take the medicine <strong>before going to bed</strong>.
                            Suggested time: <strong>10:00 PM</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800">
                    Note: If the doctor has not written an exact time, the app can auto-fill suggested reminder times based on these abbreviations.
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_15px_40px_rgba(15,23,42,0.05)]">
                <div className="relative bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-5">
                  <div className="absolute left-5 top-5 h-16 w-16 rounded-full bg-sky-100/70 blur-2xl" />
                  <div className="absolute bottom-5 right-5 h-20 w-20 rounded-full bg-amber-100/80 blur-2xl" />

                  <div className="relative flex min-h-[280px] items-center justify-center">
                    <img
                      src={FIXED_REMINDER_VISUAL}
                      alt="Pharmacy product reference"
                      className="max-h-[260px] w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_15px_40px_rgba(15,23,42,0.05)] sm:p-5">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                      Saved Reminders
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                      Log today&apos;s doses from here
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      Total: {reminders.length}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                      Active: {activeReminderCount}
                    </span>
                  </div>
                </div>

                {loadingReminders ? (
                  <div className="py-8 text-center text-sm text-slate-500">Loading reminders...</div>
                ) : !reminders.length ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No reminders saved yet. Create one from the form to start tracking doses.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {reminders.map((reminder) => {
                      const isWithinSchedule =
                        today >= String(reminder.startDate || "").slice(0, 10) &&
                        today <= String(reminder.endDate || "").slice(0, 10);

                      return (
                        <div
                          key={reminder._id}
                          className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-lg font-bold text-slate-900">
                                    {reminder.medicineName}
                                  </h4>
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                      reminder.isActive
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-200 text-slate-700"
                                    }`}
                                  >
                                    {reminder.isActive ? "Active" : "Paused"}
                                  </span>
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                      isWithinSchedule
                                        ? "bg-sky-100 text-sky-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {isWithinSchedule ? "In schedule" : "Outside schedule"}
                                  </span>
                                </div>

                                <p className="mt-2 text-sm text-slate-600">
                                  {reminder.dose || "Dose not added"} - {reminder.frequency || "Frequency not added"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDate(reminder.startDate)} to {formatDate(reminder.endDate)}
                                </p>
                              </div>

                              {reminder.image ? (
                                <img
                                  src={getImageUrl(reminder.image)}
                                  alt={reminder.medicineName}
                                  className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                                />
                              ) : null}
                            </div>

                            <div className="space-y-3">
                              {(reminder.times || []).map((time) => {
                                const doseStatus = getDoseStatus(reminder, time);
                                const actionKey = `${reminder._id}-${time}`;

                                return (
                                  <div
                                    key={`${reminder._id}-${time}`}
                                    className="rounded-2xl border border-slate-200 bg-white p-3"
                                  >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                          Dose time: {formatTime(time)}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                          Today&apos;s status: {doseStatus ? doseStatus : "Not logged yet"}
                                        </p>
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleLogStatus(reminder._id, time, "taken")}
                                          disabled={actionId === actionKey}
                                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                            doseStatus === "taken"
                                              ? "bg-emerald-600 text-white"
                                              : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                          } disabled:cursor-not-allowed disabled:opacity-70`}
                                        >
                                          {actionId === actionKey ? (
                                            <Loader2 size={16} className="animate-spin" />
                                          ) : (
                                            <CheckCircle size={16} />
                                          )}
                                          Taken
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleLogStatus(reminder._id, time, "skipped")}
                                          disabled={actionId === actionKey}
                                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                            doseStatus === "skipped"
                                              ? "bg-rose-600 text-white"
                                              : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                          } disabled:cursor-not-allowed disabled:opacity-70`}
                                        >
                                          {actionId === actionKey ? (
                                            <Loader2 size={16} className="animate-spin" />
                                          ) : (
                                            <XCircle size={16} />
                                          )}
                                          Skipped
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                              <button
                                type="button"
                                onClick={() => handleEdit(reminder)}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                <Pencil size={16} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggle(reminder._id)}
                                disabled={actionId === reminder._id}
                                className="inline-flex items-center gap-2 rounded-full border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <Bell size={16} />
                                {reminder.isActive ? "Pause" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(reminder._id)}
                                disabled={actionId === reminder._id}
                                className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {isDashboardView ? (
                <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_15px_40px_rgba(15,23,42,0.05)] sm:p-5">
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                        Reminder History
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-slate-900">
                        Recent dose activity
                      </h3>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Logged doses: {historyEntries.length}
                    </span>
                  </div>

                  {!historyEntries.length ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                      No dose history logged yet. Use the Taken or Skipped buttons above to add entries.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {historyEntries.slice(0, 12).map((entry, index) => (
                        <div
                          key={`${entry.reminderId}-${entry.time}-${entry.date}-${index}`}
                          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{entry.medicineName}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {formatDate(entry.date)} at {formatTime(entry.time)}
                            </p>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                              entry.status === "taken"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {entry.status === "taken" ? "Taken" : "Skipped"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminder;
