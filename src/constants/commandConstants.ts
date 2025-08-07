import { CustomCommandOrigin, CustomCommandStatus, EquipmentSlot, ItemLockMode, ItemType, Player } from "@minecraft/server";
import { MinecraftPotionLiquidTypes } from "../lib/index";

// コマンド関数の型定義
export type SuperGiveCommand = (
    origin: CustomCommandOrigin,
    players: Player[],
    itemType: ItemType,
    amount?: number,
    data?: number,
    customData?: string
) => { status: CustomCommandStatus; message?: string };

export type SuperReplaceItemEntityCommand = (
    origin: CustomCommandOrigin,
    players: Player[],
    slot: EntityEquipmentSlot,
    slotId: number,
    itemType: ItemType,
    amount?: number,
    data?: number,
    customData?: string
) => { status: CustomCommandStatus; message?: string };

export type SuperReplaceItemBlockCommand = (
    origin: CustomCommandOrigin,
    position: { x: number; y: number; z: number },
    slot: string,
    slotId: number,
    itemType: ItemType,
    amount?: number,
    data?: number,
    customData?: string
) => { status: CustomCommandStatus; message?: string };

export interface CustomData {
    custom_name?: string;
    lore?: string[];
    enchantments?: { [key: string]: number };
    can_place_on?: string[];
    can_destroy?: string[];
    keep_on_death?: boolean;
    item_lock?: string;
    [key: string]: any;
}

export const customDataList: Record<string, any> = {
    custom_name: String,
    lore: Array,
    enchantments: Object,
    can_place_on: Array,
    can_destroy: Array,
    keep_on_death: Boolean,
    item_lock: String,
};

// EntityEquipmentSlot型を明示的に限定
export type EntityEquipmentSlot =
    | "slot.armor.body"
    | "slot.armor.chest"
    | "slot.armor.feet"
    | "slot.armor.head"
    | "slot.armor.legs"
    | "slot.chest"
    | "slot.enderchest"
    | "slot.equippable"
    | "slot.hotbar"
    | "slot.inventory"
    | "slot.saddle"
    | "slot.weapon.mainhand"
    | "slot.weapon.offhand";

export const slotMap: Record<EntityEquipmentSlot, EquipmentSlot | undefined> = {
    "slot.armor.head": EquipmentSlot.Head,
    "slot.armor.body": EquipmentSlot.Chest,
    "slot.armor.chest": EquipmentSlot.Chest,
    "slot.armor.legs": EquipmentSlot.Legs,
    "slot.armor.feet": EquipmentSlot.Feet,
    "slot.weapon.mainhand": EquipmentSlot.Mainhand,
    "slot.weapon.offhand": EquipmentSlot.Offhand,
    "slot.chest": undefined,
    "slot.enderchest": undefined,
    "slot.equippable": undefined,
    "slot.hotbar": undefined,
    "slot.inventory": undefined,
    "slot.saddle": undefined,
};

export const lockModeMap: Record<string, ItemLockMode> = {
    "lock_in_inventory": ItemLockMode.inventory,
    "lock_in_slot": ItemLockMode.slot,
    "none": ItemLockMode.none,
};

export const potionLiquidMap: Record<string, MinecraftPotionLiquidTypes> = {
    "minecraft:potion": MinecraftPotionLiquidTypes.Regular,
    "minecraft:splash_potion": MinecraftPotionLiquidTypes.Splash,
    "minecraft:lingering_potion": MinecraftPotionLiquidTypes.Lingering
};