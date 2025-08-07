//@ts-check

import { MinecraftPotionEffectTypes, MinecraftPotionModifierTypes } from "../lib/index";

export const potionData = [
    {
        effect: MinecraftPotionEffectTypes.None,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.None,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.None,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.None,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.None,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.NightVision,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.NightVision,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Invisibility,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Invisibility,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Leaping,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Leaping,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Leaping,
        modifier: MinecraftPotionModifierTypes.Strong
    },
    {
        effect: MinecraftPotionEffectTypes.FireResistance,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.FireResistance,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Swiftness,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Swiftness,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Swiftness,
        modifier: MinecraftPotionModifierTypes.Strong
    },
    {
        effect: MinecraftPotionEffectTypes.Slowing,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Slowing,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.WaterBreath,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.WaterBreath,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Healing,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Healing,
        modifier: MinecraftPotionModifierTypes.Strong
    },
    {
        effect: MinecraftPotionEffectTypes.Harming,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Harming,
        modifier: MinecraftPotionModifierTypes.Strong
    },
    {
        effect: MinecraftPotionEffectTypes.Poison,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Poison,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Poison,
        modifier: MinecraftPotionModifierTypes.Strong
    },
    {
        effect: "Regeneration",
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: "Regeneration",
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: "Regeneration",
        modifier: MinecraftPotionModifierTypes.Strong
    },
    {
        effect: MinecraftPotionEffectTypes.Strength,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Strength,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Strength,
        modifier: MinecraftPotionModifierTypes.Strong
    },
    {
        effect: MinecraftPotionEffectTypes.Weakness,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Weakness,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Wither,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.TurtleMaster,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.TurtleMaster,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.TurtleMaster,
        modifier: MinecraftPotionModifierTypes.Strong
    },
    {
        effect: MinecraftPotionEffectTypes.SlowFalling,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.SlowFalling,
        modifier: MinecraftPotionModifierTypes.Long
    },
    {
        effect: MinecraftPotionEffectTypes.Slowing,
        modifier: MinecraftPotionModifierTypes.Strong
    },
    {
        effect: MinecraftPotionEffectTypes.WindCharged,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Weaving,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Oozing,
        modifier: MinecraftPotionModifierTypes.Normal
    },
    {
        effect: MinecraftPotionEffectTypes.Infested,
        modifier: MinecraftPotionModifierTypes.Normal
    },
];

export const potionKeyMap: Record<string, string> = {
    NightVision: "nightVision",
    Invisibility: "invisibility",
    Leaping: "jump",
    FireResistance: "fireResistance",
    Swiftness: "moveSpeed",
    Slowing: "moveSlowdown",
    WaterBreath: "waterBreathing",
    Healing: "heal",
    Harming: "harm",
    Poison: "poison",
    Regeneration: "regeneration",
    Strength: "damageBoost",
    Weakness: "weakness",
    Wither: "wither",
    TurtleMaster: "turtleMaster",
    SlowFalling: "slowFalling",
    WindCharged: "windCharged",
    Weaving: "weaving",
    Oozing: "oozing",
    Infested: "infested",
    None: "emptyPotion",
};

// 型安全のため、potionKeyMapのキーをユニオン型で限定したい場合
export type PotionKey =
    | "NightVision"
    | "Invisibility"
    | "Leaping"
    | "FireResistance"
    | "Swiftness"
    | "Slowing"
    | "WaterBreath"
    | "Healing"
    | "Harming"
    | "Poison"
    | "Regeneration"
    | "Strength"
    | "Weakness"
    | "Wither"
    | "TurtleMaster"
    | "SlowFalling"
    | "WindCharged"
    | "Weaving"
    | "Oozing"
    | "Infested"
    | "None";