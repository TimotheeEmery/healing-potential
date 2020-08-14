export class Result {
  constructor(
    public maxHeal: number,
    public highIterationSelected: number,
    public firstTooHighRank: number,
    public lowIterationSelected: number
  ) {}
}
