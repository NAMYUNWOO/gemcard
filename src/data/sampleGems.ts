/**
 * Arcane Gems - Sample Magic Gem Templates
 *
 * These templates are used for gem generation.
 * Each template contains the magical properties (name, power, rarity).
 * Visual properties (shape, color, etc.) are randomly generated.
 */

import type { Element, SampleGemTemplate } from '../types/gem';

export const SAMPLE_GEM_TEMPLATES: SampleGemTemplate[] = [
  {
    name: 'Veil of Forgotten Memories',
    magicPower: {
      title: 'Memory Shroud',
      description:
        'Holding this gem allows one to revisit a single forgotten memory, though it fades again once released.',
      element: 'mind' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Ember of the First Flame',
    magicPower: {
      title: 'Primordial Spark',
      description:
        "A fragment of the universe's first fire. It never extinguishes and warms the soul in the coldest despair.",
      element: 'fire' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Tear of the Moon Goddess',
    magicPower: {
      title: 'Lunar Blessing',
      description:
        'Shed in sorrow for a mortal lover, this gem glows softly at night and grants peaceful dreams.',
      element: 'light' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Whisper of the Abyss',
    magicPower: {
      title: 'Abyssal Echo',
      description:
        'Those who listen closely hear secrets from the deep—truths better left unknown.',
      element: 'darkness' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Seed of the World Tree',
    magicPower: {
      title: "Life's Origin",
      description:
        'A crystallized seed from Yggdrasil. Plants flourish in its presence, and wounds heal faster nearby.',
      element: 'earth' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Frozen Sigh of Winter',
    magicPower: {
      title: 'Eternal Frost',
      description:
        'The last breath of a dying winter spirit. It preserves anything it touches in perfect, timeless ice.',
      element: 'water' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Heartstone of the Golem King',
    magicPower: {
      title: 'Unyielding Will',
      description:
        'Grants the bearer unshakable determination. No mind control or fear can break their resolve.',
      element: 'earth' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Compass of Lost Souls',
    magicPower: {
      title: 'Spirit Guide',
      description:
        'Points toward those who have passed on, helping the living find closure—or the dead find rest.',
      element: 'spirit' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Shard of the Shattered Sun',
    magicPower: {
      title: 'Solar Fragment',
      description:
        'A piece of a sun that exploded eons ago. It radiates warmth and reveals hidden truths in its light.',
      element: 'light' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Echo of the Storm Titan',
    magicPower: {
      title: "Thunder's Voice",
      description:
        'When struck, it releases a thunderclap that can be heard across realms, summoning aid from allies.',
      element: 'wind' as Element,
    },
    rarity: 'common',
  },
  // --- FIRE: 내면의 불꽃과 의지의 연금술 ---
  {
    name: 'Cinder Heart',
    magicPower: {
      title: 'Dormant Ember',
      description: 'The stone pulses with a faint heat, keeping the fire of hope alive when all other lights go out.',
      element: 'fire' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Magma Tear',
    magicPower: {
      title: 'Molten Resolve',
      description: 'Touch this gem to transmute your hesitation into a burning, unstoppable flow of pure action.',
      element: 'fire' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Phoenix Eye',
    magicPower: {
      title: 'Ashen Rebirth',
      description: 'Staring into its core allows you to incinerate a failure of the past and rise from its charcoal.',
      element: 'fire' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Sun Core Shard',
    magicPower: {
      title: 'Solar Radiance',
      description: 'It grants the bearer an aura of a central star; others instinctively orbit around your brilliance.',
      element: 'fire' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Efreet Soul',
    magicPower: {
      title: 'Infernal Engine',
      description: 'The gem burns away the need for sleep, fueling your body with the restless energy of a desert storm.',
      element: 'fire' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Ruby Ember',
    magicPower: {
      title: 'Sanguine Warmth',
      description: 'It thaws the frozen hearts of strangers, turning cold indifference into a welcoming, vivid flame.',
      element: 'fire' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Volcano Tooth',
    magicPower: {
      title: 'Eruption Point',
      description: 'When held during a speech, your words carry the weight of falling ash and the heat of flowing lava.',
      element: 'fire' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Blaze Petal',
    magicPower: {
      title: 'Dancing Spark',
      description: 'It ignites the stagnant air of a room, filling the silence with the crackling electricity of creation.',
      element: 'fire' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Drake Breath',
    magicPower: {
      title: 'Searing Truth',
      description: 'Its glow intensifies when a lie is spoken, burning a small mark of heat onto the palm of the deceiver.',
      element: 'fire' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Star Forge',
    magicPower: {
      title: 'Cosmic Ignition',
      description: 'A fragment of the first spark. It allows you to forge your own destiny from the raw iron of fate.',
      element: 'fire' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Coal Spark',
    magicPower: {
      title: 'Humble Glow',
      description: 'A modest stone that radiates a sense of security, acting as a lighthouse in your private storms.',
      element: 'fire' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Lava Rose',
    magicPower: {
      title: 'Petrified Love',
      description: 'Its warmth never fades, serving as an eternal bridge to the passion of a moment long since passed.',
      element: 'fire' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Ifrit’s Claw',
    magicPower: {
      title: 'Scorched Path',
      description: 'It burns away the obstacles in your path, leaving only the blackened truth of the road ahead.',
      element: 'fire' as Element,
    },
    rarity: 'rare',
  },

  // --- WATER: 흐르는 시간과 기억의 정화 ---
  {
    name: 'Dew Drop',
    magicPower: {
      title: 'Liquid Clarity',
      description: 'Peer through this drop to see the world without the dust of bias, fresh as a morning forest.',
      element: 'water' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Ocean Eye',
    magicPower: {
      title: 'Abyssal Calm',
      description: 'Holding it sinks your anxiety into the crushing depths, leaving only a vast, silent peace.',
      element: 'water' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Coral Heart',
    magicPower: {
      title: 'Memory Tide',
      description: 'Like a shell, it echoes with the voices of everyone you have ever loved and lost to the sea of time.',
      element: 'water' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Kraken Ink',
    magicPower: {
      title: 'Void Dissolution',
      description: 'It can dissolve a single sorrow into a cloud of ink, hiding the pain until it eventually vanishes.',
      element: 'water' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Neptune Core',
    magicPower: {
      title: 'Tidal Sovereignty',
      description: 'You become the moon to your own life, commanding the rise and fall of every emotional wave.',
      element: 'water' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'River Pebble',
    magicPower: {
      title: 'Fluent Motion',
      description: 'It smooths the jagged edges of your daily routine, letting you flow through life like a mountain stream.',
      element: 'water' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Mist Pearl',
    magicPower: {
      title: 'Veil of Fog',
      description: 'It wraps your presence in a gentle mist, making you invisible to those who seek you with ill intent.',
      element: 'water' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Glacier Bone',
    magicPower: {
      title: 'Stilled Instant',
      description: 'The gem freezes a single perfect moment in time, allowing you to dwell within it whenever you wish.',
      element: 'water' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Siren Scale',
    magicPower: {
      title: 'Echoing Song',
      description: 'It captures the melody of the spheres, granting you a voice that can charm the very wind to listen.',
      element: 'water' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Tsunami Soul',
    magicPower: {
      title: 'Crushing Weight',
      description: 'Unleashes a surge of overwhelming presence that sweeps away the arguments of your enemies.',
      element: 'water' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Rain Stone',
    magicPower: {
      title: 'Petrichor Soul',
      description: 'The scent of rain follows you, washing away the urban grime from your spirit with every step.',
      element: 'water' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Frost Bit',
    magicPower: {
      title: 'Chilled Mirror',
      description: 'A surface that reflects not your face, but the cold, objective truth of your current situation.',
      element: 'water' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Whale Song',
    magicPower: {
      title: 'Deep Frequency',
      description: 'Connects your heartbeat to the rhythm of the tides, granting a longevity born of the deep.',
      element: 'water' as Element,
    },
    rarity: 'rare',
  },

  // --- EARTH: 존재의 뿌리와 대지의 축복 ---
  {
    name: 'Dust Grain',
    magicPower: {
      title: 'Grounded Path',
      description: 'You can never truly be lost as long as you carry this grain; the earth always knows your home.',
      element: 'earth' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Root Knot',
    magicPower: {
      title: 'Ancestral Grip',
      description: 'It channels the strength of ancient oaks into your bones, making you immovable in your beliefs.',
      element: 'earth' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Iron Vein',
    magicPower: {
      title: 'Metallic Hum',
      description: 'The gem vibrates when treasure is near—not just gold, but anything that enriches the soul.',
      element: 'earth' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Mountain Peak',
    magicPower: {
      title: 'Seismic Silence',
      description: 'It absorbs the tremors of a chaotic world, leaving the bearer in a state of tectonic stillness.',
      element: 'earth' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Gaia’s Heart',
    magicPower: {
      title: 'World Pulse',
      description: 'Listen to the stone to hear the heartbeat of the planet, granting you the wisdom of the eons.',
      element: 'earth' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Sand Shard',
    magicPower: {
      title: 'Desert Mirage',
      description: 'It can craft a small illusion of a place you once loved, briefly manifesting its scent and air.',
      element: 'earth' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Slate Slab',
    magicPower: {
      title: 'Etched Pact',
      description: 'A promise whispered into this stone can never be broken by time, tide, or mortal frailty.',
      element: 'earth' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Obsidian Claw',
    magicPower: {
      title: 'Glass Reflection',
      description: 'A dark mirror that shows you the version of yourself that has conquered every fear.',
      element: 'earth' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Gem Mine Soul',
    magicPower: {
      title: 'Crystal Growth',
      description: 'It allows your hidden potential to crystallize into a tangible skill with supernatural speed.',
      element: 'earth' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Titan Spine',
    magicPower: {
      title: 'Colossal Weight',
      description: 'Grants you the gravity of a titan; when you enter a room, the world tilts in your direction.',
      element: 'earth' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Mud Marble',
    magicPower: {
      title: 'Formless clay',
      description: 'It allows you to reshape your own personality slightly, adapting to any social mold required.',
      element: 'earth' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Amber Sap',
    magicPower: {
      title: 'Eternal Amber',
      description: 'It captures the essence of your youth, preserving your vitality in a golden, timeless stasis.',
      element: 'earth' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Quartz Peak',
    magicPower: {
      title: 'Prism Vision',
      description: 'Splits a single problem into its seven base elements, making the solution clear as crystal.',
      element: 'earth' as Element,
    },
    rarity: 'rare',
  },

  // --- WIND: 보이지 않는 실과 자유의 노래 ---
  {
    name: 'Breeze Wing',
    magicPower: {
      title: 'Whisper Catch',
      description: 'It catches the words meant for you from across the world, delivering them as a soft breeze.',
      element: 'wind' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Cloud Tuft',
    magicPower: {
      title: 'Weightless Soul',
      description: 'The gem strips away the gravity of your worries, allowing your spirit to float above the fray.',
      element: 'wind' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Storm Eye',
    magicPower: {
      title: 'Lightning Focus',
      description: 'It gathers the chaotic static of your mind and strikes down with a single, brilliant realization.',
      element: 'wind' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Gale Force',
    magicPower: {
      title: 'Zephyr Command',
      description: 'You become the conductor of the unseen air, directing the flow of conversation and intent.',
      element: 'wind' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Aeolus Breath',
    magicPower: {
      title: 'Skyborn Path',
      description: 'The wind itself acts as your guide, clearing the clouds of confusion from your life’s horizon.',
      element: 'wind' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Whistle Stone',
    magicPower: {
      title: 'Call of Birds',
      description: 'Allows you to speak in the language of the sky, summoning the freedom of the winged ones.',
      element: 'wind' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Sky Glass',
    magicPower: {
      title: 'Invisible Sight',
      description: 'Reveals the hidden strings of fate that connect people, shivering in the wind of coincidence.',
      element: 'wind' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Zephyr Tail',
    magicPower: {
      title: 'Swift Echo',
      description: 'It accelerates your thoughts to the speed of a storm, leaving the slow world far behind.',
      element: 'wind' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Thunder Clap',
    magicPower: {
      title: 'Sonic Decree',
      description: 'Your voice carries a resonance that can shatter the mental barriers of the most stubborn.',
      element: 'wind' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Vortex Soul',
    magicPower: {
      title: 'Eternal Spiral',
      description: 'A core that draws all opportunities toward you, creating a whirlwind of fortunate events.',
      element: 'wind' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Leaf Flute',
    magicPower: {
      title: 'Rustling Secret',
      description: 'Place it against a tree to hear the whispered history of the earth carried by the wind.',
      element: 'wind' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Feather Gem',
    magicPower: {
      title: 'Plume Grace',
      description: 'It grants you the elegance of a falling feather, ensuring you always land on your feet.',
      element: 'wind' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Echo Crystal',
    magicPower: {
      title: 'Sound Shiver',
      description: 'It traps the sound of your favorite laugh, replaying it in your heart whenever needed.',
      element: 'wind' as Element,
    },
    rarity: 'rare',
  },

  // --- LIGHT: 신성한 빛과 진실의 계시 ---
  {
    name: 'Glow Worm',
    magicPower: {
      title: 'Tiny Beacon',
      description: 'A companion that glows brighter the closer you get to your true purpose in life.',
      element: 'light' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Prism Cube',
    magicPower: {
      title: 'Rainbow Bridge',
      description: 'It harmonizes your conflicting emotions into a single, beautiful spectrum of peace.',
      element: 'light' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Halo Ring',
    magicPower: {
      title: 'Sanctified Aura',
      description: 'It creates a circle of light around your soul that no darkness or malice can cross.',
      element: 'light' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Sun Flare',
    magicPower: {
      title: 'Daylight Reveal',
      description: 'Forces all shadows to flee, exposing the hidden beauty in even the ugliest situations.',
      element: 'light' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Seraph Core',
    magicPower: {
      title: 'Angelic Witness',
      description: 'You become a vessel for divine light, capable of healing others with a single glance.',
      element: 'light' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Star Spark',
    magicPower: {
      title: 'Night Guide',
      description: 'Projects the constellation of your future onto the ceiling while you dream.',
      element: 'light' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Candle Gem',
    magicPower: {
      title: 'Flicker Hope',
      description: 'A light that cannot be blown out by the winds of despair; it burns on sheer will alone.',
      element: 'light' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Aurora Flake',
    magicPower: {
      title: 'Dancing Veil',
      description: 'It paints your life with the colors of the northern lights, making every day a miracle.',
      element: 'light' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Dawn Bringer',
    magicPower: {
      title: 'First Light',
      description: 'Ends the longest night of the soul, bringing the sun to your heart before it hits the sky.',
      element: 'light' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Lucent Soul',
    magicPower: {
      title: 'Absolute Truth',
      description: 'The gem resonates with the frequency of reality, making any falsehood physically painful.',
      element: 'light' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Lamp Stone',
    magicPower: {
      title: 'Insight Ray',
      description: 'It illuminates the path not taken, allowing you to see where it would have led.',
      element: 'light' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Mirror Shard',
    magicPower: {
      title: 'Divine Image',
      description: 'It reflects the godhood within you, showing a face you have forgotten you possess.',
      element: 'light' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Sparkle Dust',
    magicPower: {
      title: 'Glimmer Trail',
      description: 'Leaves a trail of stardust in your wake, ensuring you never truly leave a place behind.',
      element: 'light' as Element,
    },
    rarity: 'rare',
  },

  // --- DARKNESS: 심연의 지혜와 침묵의 권능 ---
  {
    name: 'Coal Eye',
    magicPower: {
      title: 'Shadow Insight',
      description: 'It allows you to see the true intentions of those who hide in the shadows of society.',
      element: 'darkness' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Shadow Silk',
    magicPower: {
      title: 'Silent Cloak',
      description: 'It muffles the scream of your ego, allowing your true self to walk in perfect silence.',
      element: 'darkness' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Void Pebble',
    magicPower: {
      title: 'Light Swallower',
      description: 'It drinks the chaos around you, leaving only the dark, fertile soil of potential.',
      element: 'darkness' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Nightmare Oil',
    magicPower: {
      title: 'Terror Tamer',
      description: 'It feeds on your nightmares, turning your greatest fears into your most loyal guardians.',
      element: 'darkness' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Eclipse Heart',
    magicPower: {
      title: 'Total Obscurity',
      description: 'It hides your life from the gaze of fate itself, making you a wild card in the cosmic deck.',
      element: 'darkness' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Ink Drop',
    magicPower: {
      title: 'Deep Writing',
      description: 'It allows you to rewrite a single dark chapter of your life into something meaningful.',
      element: 'darkness' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Grave Soil',
    magicPower: {
      title: 'Eternal Rest',
      description: 'Grant yourself the peace of a thousand years in a single hour of deep, dark meditation.',
      element: 'darkness' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Onyx Dagger',
    magicPower: {
      title: 'Severing Edge',
      description: 'It can cut the umbilical cord of a toxic attachment, freeing your soul with one stroke.',
      element: 'darkness' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Abyss Maw',
    magicPower: {
      title: 'Infinite Storage',
      description: 'A pocket of the void where you can store all the words you were too afraid to say.',
      element: 'darkness' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Null Core',
    magicPower: {
      title: 'Absolute Zero',
      description: 'The power to unmake an enemy’s influence by simply choosing to forget they exist.',
      element: 'darkness' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Dusk Bead',
    magicPower: {
      title: 'Twilight Calm',
      description: 'It holds the moment between day and night, where all contradictions are resolved.',
      element: 'darkness' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Raven Feather',
    magicPower: {
      title: 'Omen Flight',
      description: 'A messenger from the darkness that warns you when the light is becoming a blinding trap.',
      element: 'darkness' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Obscure Lens',
    magicPower: {
      title: 'Dark Revelation',
      description: 'Reveals the hidden beauty in the things the world has discarded and called ugly.',
      element: 'darkness' as Element,
    },
    rarity: 'rare',
  },

  // --- SPIRIT: 영혼의 공명과 초월적 인연 ---
  {
    name: 'Ghost Bell',
    magicPower: {
      title: 'Spectral Ring',
      description: 'It rings whenever a kindred soul is near, even if you haven’t met them in this life.',
      element: 'spirit' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Ecto Fragment',
    magicPower: {
      title: 'Soul Shiver',
      description: 'Allows you to briefly feel the heartbeat of another person as if it were your own.',
      element: 'spirit' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Ancestry Bone',
    magicPower: {
      title: 'Blood Echo',
      description: 'It carries the combined wisdom and mistakes of all who came before you in your line.',
      element: 'spirit' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Soul Lantern',
    magicPower: {
      title: 'Guiding Light',
      description: 'It illuminates the "Third Way" when you think you only have two impossible choices.',
      element: 'spirit' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Reaper’s Coin',
    magicPower: {
      title: 'Final Pact',
      description: 'It allows you to trade a piece of your luck today for a miracle tomorrow.',
      element: 'spirit' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Whisper Leaf',
    magicPower: {
      title: 'Spirit Talk',
      description: 'Allows you to hear the advice of your future self, whispering through the veil.',
      element: 'spirit' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Mist Veil',
    magicPower: {
      title: 'Ghost Walk',
      description: 'It turns you into a memory in the minds of others, letting you pass through unnoticed.',
      element: 'spirit' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Ethereal Knot',
    magicPower: {
      title: 'Karmic Tie',
      description: 'It binds your fate to a higher purpose, ensuring that no effort is ever truly wasted.',
      element: 'spirit' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Wraith Wing',
    magicPower: {
      title: 'Astral Flight',
      description: 'Your consciousness can leave your body and view your life from a cosmic perspective.',
      element: 'spirit' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Deity Breath',
    magicPower: {
      title: 'Divine Touch',
      description: 'For one second, you possess the power to change a single fundamental law of your life.',
      element: 'spirit' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Bone Whistle',
    magicPower: {
      title: 'Soul Summons',
      description: 'It calls to the parts of yourself you have lost, bringing them back into the fold.',
      element: 'spirit' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Spirit Ash',
    magicPower: {
      title: 'Legacy Burn',
      description: 'Every action you take while carrying this will be remembered for a thousand years.',
      element: 'spirit' as Element,
    },
    rarity: 'uncommon',
  },

  // --- MIND: 의식의 확장과 정신의 연금술 ---
  {
    name: 'Thought Bead',
    magicPower: {
      title: 'Idea Sprout',
      description: 'Plant a single thought in this bead; it will grow into a full-fledged vision overnight.',
      element: 'mind' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Focus Lens',
    magicPower: {
      title: 'Laser Intent',
      description: 'It narrows the universe down to a single point, making you the master of one thing.',
      element: 'mind' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Logic Stone',
    magicPower: {
      title: 'Silver Thread',
      description: 'It unravels the most complex lies, leaving the naked truth shivering on the floor.',
      element: 'mind' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Memory Bank',
    magicPower: {
      title: 'Total Archive',
      description: 'Holding it allows you to revisit a single forgotten memory, fading once released.',
      element: 'mind' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'God Mind',
    magicPower: {
      title: 'Omniscient Eye',
      description: 'You see the thousand consequences of every action before you even think to move.',
      element: 'mind' as Element,
    },
    rarity: 'legendary',
  },
  {
    name: 'Dream Sand',
    magicPower: {
      title: 'Lucid Web',
      description: 'It weaves your dreams into a tapestry you can control, shaping your own inner world.',
      element: 'mind' as Element,
    },
    rarity: 'common',
  },
  {
    name: 'Panic Button',
    magicPower: {
      title: 'Mental Reset',
      description: 'A cold shock to the consciousness that clears all emotional debris in an instant.',
      element: 'mind' as Element,
    },
    rarity: 'uncommon',
  },
  {
    name: 'Telepathy Gem',
    magicPower: {
      title: 'Silent Bridge',
      description: 'Connects your mind to another without words, heart to heart and thought to thought.',
      element: 'mind' as Element,
    },
    rarity: 'rare',
  },
  {
    name: 'Inception Gem',
    magicPower: {
      title: 'Seed of Change',
      description: 'Plant a thought in your own subconscious to slowly alter your character over time.',
      element: 'mind' as Element,
    },
    rarity: 'epic',
  },
  {
    name: 'Sage’s Brain',
    magicPower: {
      title: 'Infinite IQ',
      description: 'The gem accelerates your neural pathways until you can process time itself as a slow wave.',
      element: 'mind' as Element,
    },
    rarity: 'legendary',
  },
 
];

/**
 * Color palettes by element for random generation
 */
export const ELEMENT_COLORS: Record<Element, string[]> = {
  // Fire: 타오르는 불꽃에서 식어가는 불씨까지 (강렬한 레드 -> 황금빛 -> 검붉은색)
  fire: [
    '#FF2400', '#FF4500', '#FF8C00', '#FFD700', '#E25822', '#B22222', '#3D0C02'
  ],

  // Water: 얕은 산호초 바다에서 심해의 어둠까지 (청록색 -> 선명한 블루 -> 네이비)
  water: [
    '#E0FFFF', '#7FFFD4', '#00BFFF', '#1E90FF', '#4169E1', '#000080', '#081827'
  ],

  // Earth: 울창한 숲과 단단한 암석, 광물을 포함 (에메랄드 -> 갈색 -> 진흙 -> 골드)
  earth: [
    '#2E8B57', '#556B2F', '#8B4513', '#A0522D', '#D2691E', '#B8860B', '#3C2F2F'
  ],

  // Wind: 보이지 않는 공기, 태풍, 그리고 대기의 청명함 (화이트 -> 민트 -> 파스텔 블루 -> 그레이)
  wind: [
    '#FFFFFF', '#F5F5F5', '#AFEEEE', '#87CEEB', '#B0C4DE', '#708090', '#2F4F4F'
  ],

  // Light: 눈부신 광휘와 신성함 (순백 -> 은색 -> 샴페인 골드 -> 연한 노랑)
  light: [
    '#FFFFFF', '#FFFAF0', '#F0E68C', '#FFFACD', '#FFD700', '#E6E6FA', '#FAFAD2'
  ],

  // Darkness: 빛조차 삼키는 공허와 보랏빛 심연 (완전한 블랙 -> 다크 퍼플 -> 미드나잇 블루)
  darkness: [
    '#000000', '#0D0D1A', '#1C1C3D', '#2F1B41', '#4A235A', '#191970', '#2C3E50'
  ],

  // Spirit: 유령의 형광빛과 영혼의 신비로움 (형광 그린 -> 연보라 -> 투명한 블루)
  spirit: [
    '#ADFF2F', '#00FA9A', '#7FFFD4', '#E0B0FF', '#DA70D6', '#9370DB', '#483D8B'
  ],

  // Mind: 뇌의 뉴런 발광과 초능력, 지적인 집중 (사이언 -> 일렉트릭 블루 -> 딥 인디고)
  mind: [
    '#00FFFF', '#7DF9FF', '#120A8F', '#4B0082', '#6A5ACD', '#8A2BE2', '#E6E6FA'
  ],
};

/**
 * Get a random color based on element
 */
export function getElementColor(element?: Element): string {
  if (!element) {
    // Random color from all elements
    const allColors = Object.values(ELEMENT_COLORS).flat();
    return allColors[Math.floor(Math.random() * allColors.length)];
  }
  const colors = ELEMENT_COLORS[element];
  return colors[Math.floor(Math.random() * colors.length)];
}
