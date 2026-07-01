import type { BiFilter, HelenaSourceClient, RawBiTurn } from "./helena-source.types.js";

export class FakeHelenaSource implements HelenaSourceClient {
  constructor(private readonly turns: RawBiTurn[]) {}

  async fetchNewBiTurns(params: { since: Date | null; filter: BiFilter; limit: number }): Promise<RawBiTurn[]> {
    const allowSlug = (slug: string | null) =>
      params.filter.chatSlugs.length > 0 && Boolean(slug && params.filter.chatSlugs.includes(slug));

    return this.turns
      .filter((turn) => (params.since ? turn.sourceCreatedAt.getTime() > params.since.getTime() : true))
      .filter((turn) => allowSlug(turn.chatSlug))
      .sort((first, second) => first.sourceCreatedAt.getTime() - second.sourceCreatedAt.getTime())
      .slice(0, params.limit);
  }

  async ping() {
    return true;
  }

  async close() {
    return undefined;
  }
}
