import { AjvJsonSchemaValidator } from "@modelcontextprotocol/client/validators/ajv";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

export function createValidator(): AjvJsonSchemaValidator {
  // Match the SDK's JSON Schema policy, but implement Rust's declared numeric formats.
  const engine = new Ajv2020({
    strict: false,
    allErrors: true,
    validateFormats: true,
    validateSchema: true,
  });
  addFormats.default(engine);
  const safeUnsigned = (value: number) => Number.isSafeInteger(value) && value >= 0;
  engine.addFormat("uint32", {
    type: "number",
    validate: (value: number) => safeUnsigned(value) && value <= 4294967295,
  });
  engine.addFormat("uint", { type: "number", validate: safeUnsigned });
  engine.addFormat("uint64", { type: "number", validate: safeUnsigned });
  return new AjvJsonSchemaValidator(engine);
}
