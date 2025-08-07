import { EquipmentSlot, ItemLockMode } from "@minecraft/server";
import { MinecraftPotionLiquidTypes } from "../lib/index";
export const customDataList = {
    custom_name: String,
    lore: Array,
    enchantments: Object,
    can_place_on: Array,
    can_destroy: Array,
    keep_on_death: Boolean,
    item_lock: String,
};
export const slotMap = {
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
export const lockModeMap = {
    "lock_in_inventory": ItemLockMode.inventory,
    "lock_in_slot": ItemLockMode.slot,
    "none": ItemLockMode.none,
};
export const potionLiquidMap = {
    "minecraft:potion": MinecraftPotionLiquidTypes.Regular,
    "minecraft:splash_potion": MinecraftPotionLiquidTypes.Splash,
    "minecraft:lingering_potion": MinecraftPotionLiquidTypes.Lingering
};
