import { useState, useEffect } from "react";

const FIELD_TYPES = ["string", "boolean", "number", "option", "list", "other"];

const EMPTY_FIELD = { name: "", type: "string", description: "", validValues: [] };

/**
 * Generates a user prompt template string from an extraction schema array.
 */
export function generatePromptFromSchema(schema) {
  if (!schema?.length) return "";

  const schemaLines = schema.map((field) => {
    let typeRepr;
    switch (field.type) {
      case "option":
        typeRepr =
          field.validValues?.length > 0
            ? field.validValues.map((v) => `"${v}"`).join(" | ") + " | null"
            : '"<option>" | null';
        break;
      case "string":
        typeRepr = '"<string>" | null';
        break;
      case "boolean":
        typeRepr = '"Yes" | "No" | null';
        break;
      case "number":
        typeRepr = "<number> | null";
        break;
      case "list":
        typeRepr = '["<item>", ...] | null';
        break;
      default:
        typeRepr = "<value> | null";
    }
    return `  "${field.name}": ${typeRepr}`;
  });

  const ruleLines = schema
    .filter((f) => f.description)
    .map((f) => `- ${f.name}: ${f.description}`);

  const schemaBlock = `{\n${schemaLines.join(",\n")}\n}`;
  const rulesBlock =
    ruleLines.length > 0 ? `\nField rules:\n${ruleLines.join("\n")}\n` : "";

  return `Extract values from the text below and return a JSON object that strictly conforms to this schema:\n\n${schemaBlock}\n${rulesBlock}\nText:\n"""\n{{text}}\n"""`;
}

/**
 * Single field row with its own local state for the validValues raw string.
 */
function FieldRow({ field, onUpdate, onRemove }) {
  const [rawValidValues, setRawValidValues] = useState(
    (field.validValues ?? []).join(", "),
  );

  // Keep raw string in sync when validValues change from outside (e.g. schema regeneration)
  useEffect(() => {
    setRawValidValues((field.validValues ?? []).join(", "));
  }, [JSON.stringify(field.validValues)]);

  function commitValidValues(raw) {
    onUpdate("validValues", raw.split(",").map((v) => v.trim()).filter(Boolean));
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex gap-2">
        <input
          placeholder="Field name"
          value={field.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-indigo-600"
        />
        <select
          value={field.type}
          onChange={(e) => onUpdate("type", e.target.value)}
          className="px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-indigo-600"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Remove field"
        >
          ✕
        </button>
      </div>

      <input
        placeholder="Description (optional)"
        value={field.description}
        onChange={(e) => onUpdate("description", e.target.value)}
        className="px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-indigo-600"
      />

      {field.type === "option" && (
        <input
          placeholder="Valid values, comma-separated (e.g. yes, no, maybe)"
          value={rawValidValues}
          onChange={(e) => setRawValidValues(e.target.value)}
          onBlur={(e) => commitValidValues(e.target.value)}
          className="px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-indigo-600"
        />
      )}
    </div>
  );
}

/**
 * Editor for an array of extraction schema fields.
 * Props:
 *   value    – array of field objects
 *   onChange – called with the new array whenever a change is made
 */
export function ExtractionSchemaEditor({ value = [], onChange }) {
  function addField() {
    onChange([...value, { ...EMPTY_FIELD }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Extraction Schema</span>
        <button
          type="button"
          onClick={addField}
          className="px-3 py-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg cursor-pointer transition-colors hover:bg-indigo-100"
        >
          + Add Field
        </button>
      </div>

      {value.length === 0 && (
        <p className="text-xs text-gray-400 italic">No fields defined yet.</p>
      )}

      {value.map((field, idx) => (
        <FieldRow
          key={idx}
          field={field}
          onUpdate={(key, val) =>
            onChange(value.map((f, i) => (i === idx ? { ...f, [key]: val } : f)))
          }
          onRemove={() => onChange(value.filter((_, i) => i !== idx))}
        />
      ))}
    </div>
  );
}

/**
 * Read-only table view of an extraction schema.
 * Props:
 *   schema – array of field objects (or null/undefined)
 */
export function ExtractionSchemaView({ schema }) {
  if (!schema?.length) return null;

  return (
    <div className="flex flex-col gap-2 mt-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        Extraction Schema
      </span>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <th className="text-left px-3 py-2 font-semibold border-b border-gray-200">Field</th>
              <th className="text-left px-3 py-2 font-semibold border-b border-gray-200">Type</th>
              <th className="text-left px-3 py-2 font-semibold border-b border-gray-200">
                Description
              </th>
              <th className="text-left px-3 py-2 font-semibold border-b border-gray-200">
                Valid Values
              </th>
            </tr>
          </thead>
          <tbody>
            {schema.map((field, idx) => (
              <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">{field.name}</td>
                <td className="px-3 py-2">
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-mono">
                    {field.type}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600">{field.description || "—"}</td>
                <td className="px-3 py-2 text-gray-600">
                  {field.validValues?.length > 0 ? field.validValues.join(", ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
