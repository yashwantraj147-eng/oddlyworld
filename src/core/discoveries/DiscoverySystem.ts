export interface Discovery {
  id: string;
  title: string;
  category: 'physics' | 'creature' | 'environmental' | 'chaos' | 'architect';
  description: string;
  lore: string;
  rewardText: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: number | null;
  evidence: string | null;
}

export const ALL_DISCOVERIES: Discovery[] = [
  {
    id: 'FIRST_KINETIC_ROLL',
    title: 'The Great Roll',
    category: 'physics',
    description: 'Release a marble onto a ramp and watch Newtonian motion unfold.',
    lore: 'The first marble to roll through ODDLYWORLD carved a groove of endless curiosity.',
    rewardText: 'Unlocked: Glass & Rubber Marble materials',
    icon: 'CircleDot',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'BELL_CHIME_MASTER',
    title: 'Resonant Gong',
    category: 'physics',
    description: 'Successfully strike a target bell with a rolling or launched marble.',
    lore: 'The chime echoed across the toybox, waking ancient dormant wonders.',
    rewardText: 'Unlocked: Golden Chime Target',
    icon: 'Bell',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'SPRING_ACROBAT',
    title: 'Stratosphere Leap',
    category: 'physics',
    description: 'Propel a marble or creature high into the air using a trampoline spring.',
    lore: 'For three glorious seconds, the tiny voyager beheld the curvature of their terrarium.',
    rewardText: 'Unlocked: High-Tension Super Spring',
    icon: 'ArrowUpCircle',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'WORMHOLE_NAVIGATOR',
    title: 'Quantum Fold',
    category: 'physics',
    description: 'Teleport an object through a linked portal entry and exit.',
    lore: 'Space folded like origami, dropping the marble right into tomorrow.',
    rewardText: 'Unlocked: Quantum Portal Gates',
    icon: 'Compass',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'SIGNAL_CHAIN',
    title: 'Clockwork Synapse',
    category: 'architect',
    description: 'Connect a pressure switch to a launcher with a signal wire and trigger it.',
    lore: 'Cause and effect shook hands, laying the blueprint for absurd machinery.',
    rewardText: 'Unlocked: Signal Pulse Delay Relay',
    icon: 'GitFork',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'FIRST_BOND',
    title: 'First Greeting',
    category: 'creature',
    description: 'Witness two autonomous creatures meet, chirp, and become friends.',
    lore: 'A gentle bob of the head, a curious wiggle, and a friendship was born.',
    rewardText: 'Unlocked: Emote Heart Aura',
    icon: 'Heart',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'PLAYFUL_PURSUIT',
    title: 'The Sphere Chaser',
    category: 'creature',
    description: 'Watch a playful creature pursue and bump a rolling marble.',
    lore: 'To a creature of the toybox, a shiny rolling sphere is the pinnacle of high sport.',
    rewardText: 'Unlocked: Creature Toy Curiosity Boost',
    icon: 'Smile',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'SNOOZE_HARMONY',
    title: 'Sweet Miniature Dreams',
    category: 'creature',
    description: 'Observe an exhausted creature curl up and doze off under a mushroom.',
    lore: 'Even tiny gods of little universes need restful naps.',
    rewardText: 'Unlocked: Sleeping Cap Accessory',
    icon: 'Moon',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'THRIVING_COMMUNITY',
    title: 'Bustling Terrarium',
    category: 'creature',
    description: 'Cultivate an ecosystem containing at least 5 thriving creatures simultaneously.',
    lore: 'The miniature valleys hummed with chatter, pattering paws, and cheerful squeaks.',
    rewardText: 'Unlocked: Multi-Species Habitat Badge',
    icon: 'Users',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'CHAOS_ALCHEMIST',
    title: 'Laws of Whimsy',
    category: 'chaos',
    description: 'Activate any modifier in the Chaos Engine to bend reality.',
    lore: 'With a playful turn of the dial, gravity giggled and surfaces became trampolines.',
    rewardText: 'Unlocked: Chaos Intensity Level 5',
    icon: 'Sparkles',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'METEOR_CATCHER',
    title: 'Starlight Collector',
    category: 'chaos',
    description: 'Witness a toy meteor fall from a cosmic shower and roll across the landscape.',
    lore: 'Falling stars in ODDLYWORLD are made of solid starlight candy.',
    rewardText: 'Unlocked: Starlight Meteor Theme Modifier',
    icon: 'Zap',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'MIDNIGHT_WONDER',
    title: 'Midnight Bioluminescence',
    category: 'environmental',
    description: 'Observe the world as the day/night cycle progresses into deep starry midnight.',
    lore: 'When the golden sun dips, the flora shines like tiny constellations.',
    rewardText: 'Unlocked: Bioluminescent Spore Shader',
    icon: 'SunDim',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  },
  {
    id: 'ARCHITECT_MAJESTY',
    title: 'Grand Contraption',
    category: 'architect',
    description: 'Construct a machine containing 8 or more functional parts in a single world.',
    lore: 'An intricate sculpture of ramps, springs, and gears humming with potential.',
    rewardText: 'Unlocked: Blueprint Library Auto-Export',
    icon: 'Cpu',
    unlocked: false,
    unlockedAt: null,
    evidence: null
  }
];

export class DiscoverySystem {
  private discoveries: Map<string, Discovery> = new Map();
  public onDiscoveryUnlocked?: (discovery: Discovery) => void;

  constructor(initialData?: Discovery[]) {
    const list = initialData || ALL_DISCOVERIES;
    list.forEach(d => {
      this.discoveries.set(d.id, { ...d });
    });
  }

  public trigger(id: string, evidenceText: string): boolean {
    const disc = this.discoveries.get(id);
    if (!disc) return false;
    if (disc.unlocked) return false; // already unlocked

    disc.unlocked = true;
    disc.unlockedAt = Date.now();
    disc.evidence = evidenceText;

    this.onDiscoveryUnlocked?.(disc);
    return true;
  }

  public getDiscovery(id: string): Discovery | undefined {
    return this.discoveries.get(id);
  }

  public getAll(): Discovery[] {
    return Array.from(this.discoveries.values());
  }

  public getUnlockedCount(): number {
    return Array.from(this.discoveries.values()).filter(d => d.unlocked).length;
  }

  public getTotalCount(): number {
    return this.discoveries.size;
  }

  public exportState(): Discovery[] {
    return this.getAll();
  }

  public importState(data: Discovery[]): void {
    data.forEach(d => {
      if (this.discoveries.has(d.id)) {
        this.discoveries.set(d.id, { ...d });
      }
    });
  }
}
