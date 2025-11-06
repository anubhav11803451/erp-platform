/**
 * Prisma → Zod v4 Generator
 * Generates per-model Zod schemas + enums in /common/src/schemas
 *
 * Compatible with:
 * - Prisma v6+
 * - Zod v4
 * - pnpm workspaces (via "bin" + provider = "@erp/prisma-zod-v4")
 */

const { generatorHandler } = require("@prisma/generator-helper");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
import type { GeneratorOptions, DMMF } from "@prisma/generator-helper";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

async function format(code: string) {
  try {
    const config = (await prettier.resolveConfig(process.cwd())) ?? {
      semi: true,
      singleQuote: true,
      printWidth: 100,
      tabWidth: 4,
      trailingComma: "es5",
    };

    return prettier.format(code, {
      ...config,
      parser: "typescript",
    });
  } catch (err) {
    console.warn("⚠️  Prettier format failed:", (err as Error).message);
    return code;
  }
}

function toCamelCase(name: string) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function toKebabCase(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function mapScalarToZod(type: string) {
  switch (type) {
    case "String":
      return "z.string()";
    case "Int":
      return "z.int()";
    case "BigInt":
      return "z.bigint()";
    case "Float":
    case "Decimal":
      return "z.number()";
    case "Boolean":
      return "z.boolean()";
    case "DateTime":
      return "z.date()";
    case "Json":
      return "z.any()";
    default:
      return null;
  }
}

function fieldToZodEntry(f: any) {
  if (["password", "created_at", "updated_at"].includes(f.name)) return null;

  // Handle ID field
  if (f.name === "id" || f.name.endsWith("Id")) {
    return `${f.name}: z.uuid().optional(),`;
  }

  // Handle email + phone (custom rules)
  if (f.name === "email") {
    const expr = f.isRequired ? `z.email()` : "z.email().optional()";
    return `${f.name}: ${expr},`;
  }
  if (f.name === "phone") {
    return `${f.name}: z.string().regex(/^([+]?\\d{1,2}[-\\s]?|)\\d{3}[-\\s]?\\d{3}[-\\s]?\\d{4}$/).optional(),`;
  }

  // Relations
  if (f.kind === "object") {
    const relatedSchema = `${toCamelCase(f.type)}Schema`;
    const base = `z.lazy(() => ${relatedSchema})`;
    const expr = f.isList ? `z.array(${base})` : base;
    return `${f.name}: ${expr}.optional(),`;
  }

  // Enums
  if (f.kind === "enum") {
    const expr = `z.enum(${toCamelCase(f.type)})`;
    const final = f.isList ? `z.array(${expr})` : expr;
    return `${f.name}: ${final}${f.isRequired ? "" : ".optional()"},`;
  }

  // Scalars
  const scalar = mapScalarToZod(f.type);
  if (scalar) {
    const expr = f.isList ? `z.array(${scalar})` : scalar;
    return `${f.name}: ${expr}${f.isRequired ? "" : ".optional()"},`;
  }

  // Fallback
  return `${f.name}: z.any()${f.isRequired ? "" : ".optional()"},`;
}

// -------------------------------------------------------
// Generator Implementation
// -------------------------------------------------------
const DefaultOutputPath = "../common/src/generated/schemas";
generatorHandler({
  onManifest() {
    return {
      prettyName: "Prisma → Zod v4 Generator",
      defaultOutput: DefaultOutputPath,
    };
  },

  async onGenerate(options: GeneratorOptions) {
    const datamodel = options.dmmf.datamodel;
    const models = datamodel.models;
    const enums = datamodel.enums;

    const rawOut = options.generator.output?.value || DefaultOutputPath;
    const outDir = path.resolve(process.cwd(), rawOut);

    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });

    // ---------------------------------------------------
    // 1️⃣ Generate enums.ts
    // ---------------------------------------------------
    const enumsCode = enums
      .map((enm: DMMF.DatamodelEnum) => {
        const values = enm.values.map((v) => `"${v.name}"`).join(", ");
        return `export const ${toCamelCase(enm.name)} = [${values}] as const;
                export const ${enm.name}Enum = z.enum(${toCamelCase(enm.name)});
                export const ${enm.name} =${enm.name}Enum.enum;
                export type ${enm.name}Type = z.infer<typeof ${enm.name}Enum>;
                `;
      })
      .join("\n");

    fs.writeFileSync(
      path.join(outDir, "enums.ts"),
      await format(`import { z } from "zod";\n${enumsCode}`)
    );

    // ---------------------------------------------------
    // 2️⃣ Generate per-model schemas
    // ---------------------------------------------------
    let indexExports = ``;

    for (const model of models) {
      const modelName = model.name;
      const fileName = `${toKebabCase(modelName)}.ts`;
      const schemaName = `${toCamelCase(modelName)}Schema`;
      const dtoName = `${modelName}Input`;

      const usedEnums = new Set<string>();
      const usedModels = new Set<string>();
      const fields: string[] = [];

      for (const f of model.fields) {
        if (["password", "created_at", "updated_at"].includes(f.name)) continue;
        if (f.kind === "enum") usedEnums.add(toCamelCase(f.type));
        if (f.kind === "object") usedModels.add(f.type);
        const entry = fieldToZodEntry(f);
        if (entry) fields.push(entry);
      }

      // ---- imports
      let imports = `import { z } from "zod";\n`;
      imports += `import { createZodDto } from "nestjs-zod/dto";\n`;

      if (usedEnums.size > 0)
        imports += `import { ${[...usedEnums]
          .map((e) => `${e}`)
          .join(", ")} } from "./enums";\n`;

      for (const m of usedModels) {
        const importFile = toKebabCase(m);
        const importSchema = `${toCamelCase(m)}Schema`;
        imports += `import { ${importSchema} } from "./${importFile}";\n`;
      }

      // ---- schema code
      const schemaCode = `
                        ${imports}

                        export const ${schemaName} = z.object({
                        ${fields.join("\n")}
                        });

                        export class ${dtoName} extends createZodDto(${schemaName}) {}

                        // Used in forms on frontend
                        export type ${modelName}FormValues = z.infer<typeof ${schemaName}>;`;

      fs.writeFileSync(path.join(outDir, fileName), await format(schemaCode));
      indexExports += `export * from './${fileName.replace(".ts", "")}';\n`;
    }
    // indexExports += "export * from '../schemas';\n";

    // ---------------------------------------------------
    // 3️⃣ index.ts
    // ---------------------------------------------------
    fs.writeFileSync(path.join(outDir, "index.ts"), await format(indexExports));
  },
});
