export class Spell {
  constructor(
    public rank: number,
    public level: number,
    public duration: number,
    public manaCost: number,
    public minHeal: number,
    public maxHeal: number
  ) {}
}
