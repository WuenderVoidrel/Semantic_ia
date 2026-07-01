import { describe, expect, it } from "vitest";
import { parseBiChatSlugs } from "./env.js";

describe("parseBiChatSlugs", () => {
  it("divide por virgula e ignora vazios", () => {
    expect(parseBiChatSlugs("helena, helena-unificada ,")).toEqual(["helena", "helena-unificada"]);
  });

  it("retorna lista vazia para string vazia", () => {
    expect(parseBiChatSlugs("")).toEqual([]);
  });
});
