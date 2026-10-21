import { ToyboxWorld } from '../world/WorldModel';
import { CreatureEntity } from '../creatures/CreatureModel';
import { ContraptionPart } from '../physics/ContraptionModel';
import { ChaosEngine } from '../chaos/ChaosEngine';

export interface Challenge {
  id: string;
  title: string;
  category: 'marble_run' | 'creature_nurture' | 'chaos_lab' | 'signal_mechanic';
  difficulty: 'Apprentice' | 'Artisan' | 'Alchemist';
  description: string;
  objective: string;
  hint: string;
  isCompleted: boolean;
  completedAt: number | null;
  progressPercent: number;
}

export const STARTER_CHALLENGES: Challenge[] = [
  {
    id: 'CHALLENGE_BELL_CHIME',
    title: 'The Gilded Chime',
    category: 'marble_run',
    difficulty: 'Apprentice',
    description: 'Construct a marble track using ramps and a bouncy spring that rings the target bell.',
    objective: 'Strike the target bell at least 1 time with a physics marble.',
    hint: 'Place a ramp, tilt it slightly, drop a marble at the top, and position the bell at the bottom.',
    isCompleted: false,
    completedAt: null,
    progressPercent: 0,
  },
  {
    id: 'CHALLENGE_THRIVING_HABITAT',
    title: 'Joyful Gathering',
    category: 'creature_nurture',
    difficulty: 'Apprentice',
    description: 'Bring delight to your tiny creatures through play, socializing, and comfortable resting.',
    objective: 'Have 3 or more creatures with Fun level above 70 simultaneously.',
    hint: 'Creatures love chasing rolling marbles and bouncing on trampolines!',
    isCompleted: false,
    completedAt: null,
    progressPercent: 0,
  },
  {
    id: 'CHALLENGE_PORTAL_RUN',
    title: 'Wormhole Express',
    category: 'signal_mechanic',
    difficulty: 'Artisan',
    description: 'Build a portal transfer line where a marble enters a portal and shoots onto a conveyor or platform.',
    objective: 'Teleport a marble through a linked portal entry.',
    hint: 'Place both a Portal Entry and a Portal Exit, link them in the inspector, and launch a marble into the entry.',
    isCompleted: false,
    completedAt: null,
    progressPercent: 0,
  },
  {
    id: 'CHALLENGE_CHAOS_SYMPHONY',
    title: 'Absurd Physics Lab',
    category: 'chaos_lab',
    difficulty: 'Artisan',
    description: 'Tinker with the fundamental constants of reality in the Chaos Engine.',
    objective: 'Activate Super Bouncy and observe the resulting chaos.',
    hint: 'Open the Chaos Engine panel from the toolbar (Ctrl+K) and dial up Super Bouncy.',
    isCompleted: false,
    completedAt: null,
    progressPercent: 0,
  },
  {
    id: 'CHALLENGE_MEGA_CONTRAPTION',
    title: 'Master Clocksmith',
    category: 'marble_run',
    difficulty: 'Alchemist',
    description: 'Design an elaborate contraption system with diverse mechanisms.',
    objective: 'Have at least 6 different contraption parts placed in the toybox simultaneously.',
    hint: 'Mix ramps, spinners, fans, springs, dominoes, and bells into a grand kinetic sculpture.',
    isCompleted: false,
    completedAt: null,
    progressPercent: 0,
  }
];

export class ChallengeEngine {
  private challenges: Map<string, Challenge> = new Map();
  public onChallengeCompleted?: (challenge: Challenge) => void;

  constructor(initialChallenges?: Challenge[]) {
    const list = initialChallenges || STARTER_CHALLENGES;
    list.forEach(c => {
      this.challenges.set(c.id, { ...c });
    });
  }

  public getAll(): Challenge[] {
    return Array.from(this.challenges.values());
  }

  public evaluateConditions(
    world: ToyboxWorld,
    creatures: CreatureEntity[],
    contraptions: ContraptionPart[],
    chaosEngine: ChaosEngine
  ): void {
    // 1. Evaluate Gilded Chime
    const bellChallenge = this.challenges.get('CHALLENGE_BELL_CHIME');
    if (bellChallenge && !bellChallenge.isCompleted) {
      const bell = contraptions.find(p => p.type === 'target_bell');
      if (bell && (bell.bellProperties?.hitCount || 0) > 0) {
        this.complete(bellChallenge);
      }
    }

    // 2. Evaluate Joyful Gathering
    const habitatChallenge = this.challenges.get('CHALLENGE_THRIVING_HABITAT');
    if (habitatChallenge && !habitatChallenge.isCompleted) {
      const happyCount = creatures.filter(c => c.needs.fun >= 70).length;
      habitatChallenge.progressPercent = Math.min(100, Math.round((happyCount / 3) * 100));
      if (happyCount >= 3) {
        this.complete(habitatChallenge);
      }
    }

    // 3. Evaluate Chaos Symphony
    const chaosChallenge = this.challenges.get('CHALLENGE_CHAOS_SYMPHONY');
    if (chaosChallenge && !chaosChallenge.isCompleted) {
      if (chaosEngine.isEffectActive('super_bouncy')) {
        this.complete(chaosChallenge);
      }
    }

    // 4. Evaluate Mega Contraption
    const megaChallenge = this.challenges.get('CHALLENGE_MEGA_CONTRAPTION');
    if (megaChallenge && !megaChallenge.isCompleted) {
      const uniqueTypes = new Set(contraptions.map(p => p.type));
      megaChallenge.progressPercent = Math.min(100, Math.round((uniqueTypes.size / 6) * 100));
      if (uniqueTypes.size >= 6) {
        this.complete(megaChallenge);
      }
    }
  }

  public notifyPortalTeleport(): void {
    const portalChallenge = this.challenges.get('CHALLENGE_PORTAL_RUN');
    if (portalChallenge && !portalChallenge.isCompleted) {
      this.complete(portalChallenge);
    }
  }

  private complete(challenge: Challenge): void {
    challenge.isCompleted = true;
    challenge.completedAt = Date.now();
    challenge.progressPercent = 100;
    this.onChallengeCompleted?.(challenge);
  }
}
