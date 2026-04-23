const FALLBACK_TIMES_BY_FREQUENCY = {
    OD: ["07:00"],
    BD: ["07:00", "19:00"],
    TDS: ["07:00", "12:00", "19:00"],
    HS: ["22:00"],
};

const MEDICINE_LINE_STOPWORDS = [
    "prescription",
    "doctor",
    "patient",
    "name",
    "date",
    "take",
    "tablet",
    "capsule",
    "syrup",
    "dosage",
    "directions",
    "before food",
    "after food",
    "morning",
    "night",
    "rx",
    "use",
    "instructions",
];

const FREQUENCY_PATTERNS = [
    { regex: /\b(od|once daily|once a day|daily)\b/i, value: "OD" },
    { regex: /\b(bd|bid|twice daily|twice a day|2 times daily|two times daily)\b/i, value: "BD" },
    { regex: /\b(tds|tid|thrice daily|three times daily|3 times daily)\b/i, value: "TDS" },
    { regex: /\b(hs|bedtime|at bedtime|every night)\b/i, value: "HS" },
];

const normalizeWhitespace = (value = "") =>
    String(value)
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{2,}/g, "\n")
        .trim();

const uniqueTimes = (times = []) =>
    [...new Set(times.filter(Boolean))].sort((left, right) => left.localeCompare(right));

const to24HourTime = (hours, minutes = "00", meridiem = "") => {
    let normalizedHours = Number(hours);
    const normalizedMinutes = String(minutes || "00").padStart(2, "0");
    const normalizedMeridiem = String(meridiem || "").toLowerCase();

    if (normalizedMeridiem === "pm" && normalizedHours < 12) {
        normalizedHours += 12;
    }

    if (normalizedMeridiem === "am" && normalizedHours === 12) {
        normalizedHours = 0;
    }

    if (!normalizedMeridiem && normalizedHours > 23) {
        return "";
    }

    if (normalizedHours < 0 || normalizedHours > 23) {
        return "";
    }

    return `${String(normalizedHours).padStart(2, "0")}:${normalizedMinutes}`;
};

const extractExplicitTimes = (text = "") => {
    const matches = [];

    const twelveHourRegex = /\b(\d{1,2})(?::|\.| )?(\d{2})?\s*(am|pm)\b/gi;
    const twentyFourHourRegex = /\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/g;

    let match = twelveHourRegex.exec(text);
    while (match) {
        const convertedTime = to24HourTime(match[1], match[2] || "00", match[3]);
        if (convertedTime) {
            matches.push(convertedTime);
        }
        match = twelveHourRegex.exec(text);
    }

    match = twentyFourHourRegex.exec(text);
    while (match) {
        const convertedTime = to24HourTime(match[1], match[2] || "00");
        if (convertedTime) {
            matches.push(convertedTime);
        }
        match = twentyFourHourRegex.exec(text);
    }

    return uniqueTimes(matches);
};

const inferFrequencyFromTimes = (times = []) => {
    if (times.length === 1) {
        return "OD";
    }

    if (times.length === 2) {
        return "BD";
    }

    if (times.length === 3) {
        return "TDS";
    }

    return "";
};

const extractFrequency = (text = "") => {
    const matchingPattern = FREQUENCY_PATTERNS.find(({ regex }) => regex.test(text));
    return matchingPattern?.value || "";
};

const extractDose = (text = "") => {
    const dosePatterns = [
        /\b\d+(?:\.\d+)?\s?(?:mg|mcg|g|gm|ml|iu)\b/i,
        /\b\d+\s?(?:tablet|tab|capsule|cap|drops|drop|puff|puffs|sachet|teaspoon|tsp)\b/i,
        /\b(?:half|quarter|one|two)\s?(?:tablet|tab|capsule|cap|teaspoon|tsp)\b/i,
    ];

    for (const pattern of dosePatterns) {
        const match = text.match(pattern);
        if (match?.[0]) {
            return match[0].replace(/\s+/g, " ").trim();
        }
    }

    return "";
};

const cleanMedicineName = (value = "") =>
    String(value)
        .replace(/[^a-zA-Z0-9+\-()./ ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const looksLikeMedicineLine = (line = "") => {
    const normalizedLine = line.toLowerCase();

    if (!/[a-z]/i.test(normalizedLine)) {
        return false;
    }

    if (normalizedLine.length < 3 || normalizedLine.length > 60) {
        return false;
    }

    return !MEDICINE_LINE_STOPWORDS.some((word) => normalizedLine.includes(word));
};

const extractMedicineName = (text = "", dose = "") => {
    const lines = normalizeWhitespace(text)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    const doseMatcher = dose ? new RegExp(`\\s*${dose.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i") : null;

    for (const line of lines) {
        const dosePrefixMatch = line.match(/^([A-Za-z][A-Za-z0-9()+\-./ ]{2,40})\s+\d+(?:\.\d+)?\s?(?:mg|mcg|g|gm|ml|iu)\b/i);
        if (dosePrefixMatch?.[1]) {
            return cleanMedicineName(dosePrefixMatch[1]);
        }

        if (!looksLikeMedicineLine(line)) {
            continue;
        }

        if (doseMatcher) {
            const candidate = cleanMedicineName(line.replace(doseMatcher, ""));
            if (candidate) {
                return candidate;
            }
        }

        const candidate = cleanMedicineName(line);
        if (candidate) {
            return candidate;
        }
    }

    return "";
};

export const parseReminderText = (rawText = "") => {
    const normalizedText = normalizeWhitespace(rawText);
    const explicitTimes = extractExplicitTimes(normalizedText);
    const frequency = extractFrequency(normalizedText) || inferFrequencyFromTimes(explicitTimes);
    const times =
        explicitTimes.length > 0
            ? explicitTimes
            : uniqueTimes(FALLBACK_TIMES_BY_FREQUENCY[frequency] || []);
    const dose = extractDose(normalizedText);
    const medicineName = extractMedicineName(normalizedText, dose);

    return {
        medicineName,
        dose,
        frequency,
        times,
        rawScanText: normalizedText,
    };
};

export default parseReminderText;
