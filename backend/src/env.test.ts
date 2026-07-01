import { describe, expect, it } from "vitest";
import { parseBiChatSlugs, parseBooleanFlag } from "./env.js";

describe("parseBiChatSlugs", () => {
  it("divide por virgula e ignora vazios", () => {
    expect(parseBiChatSlugs("helena, helena-unificada ,")).toEqual(["helena", "helena-unificada"]);
  });

  it("retorna lista vazia para string vazia", () => {
    expect(parseBiChatSlugs("")).toEqual([]);
  });
});

describe("parseBooleanFlag", () => {
  it("trata 'false' como false (o bug do z.coerce.boolean)", () => {
    expect(parseBooleanFlag("false")).toBe(false);
    expect(parseBooleanFlag("0")).toBe(false);
  });

  it("trata 'true'/'1'/'on' como true", () => {
    expect(parseBooleanFlag("true")).toBe(true);
    expect(parseBooleanFlag("1")).toBe(true);
    expect(parseBooleanFlag("ON")).toBe(true);
  });

  it("undefined vira false", () => {
    expect(parseBooleanFlag(undefined)).toBe(false);
  });
});
