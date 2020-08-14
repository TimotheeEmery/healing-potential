export class Modifiers {
  constructor(
    public manaSpringTotem: boolean,
    public manaTideTotem: boolean,
    public arcaneIntelligence: boolean,
    public markOfTheWild: boolean,
    public improvedMarkOfTheWild: boolean,
    public rallyingCryOfTheDragonSlayer: boolean,
    public spiritOfZandalar: boolean,
    public intelWithoutModifiers: string,
    public direMaulSpellCrit: boolean,
    public warchiefBlessing: boolean,
    public songflower: boolean,
    public darkMoonFaire: boolean,
    public superiorManaPotion: boolean,
    public excellentManaPotion: boolean,
    public majorManaPotion: boolean,
    public lutjanSoup: boolean,
    public mageBloodPotion: boolean,
    public brillantOil: boolean,
    public cerebralCortexCompound: boolean,
    public jujuGuile: boolean
  ) {}
}

// Modifiers
// - Really easy -
// arcaneIntelligence: boolean; // 31 intel

// markOfTheWild: boolean; // 12 stats
// improvedMarkOfTheWild: boolean; // 12 stats * 35% = 16 stats (?)

// Potions: major, excellent, superior
// Using totem
// Mana wave totem up

// - World buff -
// Ony/Nef 10% crit.
// Zandalar spirit, 15% stats (after other modifiers?)
// HT spell crit. 3%
// Rend 10 mp5
// Songflower, 5% crit, 15 stats
// DarkMoonFaire: boolean; // Sombrelune, 9 intel

// - Quality consumables -
// Demonic/Dark rune
// Lutjan, 8 mp5
// Bloodmage potion, 12 mp5
// Brilliant oil, 12 mp5, +25 HP
// cerebralCortexCompound, 25 intel
// JujuGuile, 30 intel
