import {
    BlockComponentTypes,
    Container,
    CustomCommandOrigin,
    CustomCommandStatus,
    EnchantmentType,
    EntityComponentTypes,
    EntityEquippableComponent,
    EquipmentSlot,
    ItemComponentTypes,
    ItemDurabilityComponent,
    ItemEnchantableComponent,
    ItemStack,
    Player,
    Potions,
    system,
    world,
} from "@minecraft/server";
import { convertCustomDataToJson } from "../utils";
import {
    CustomData,
    EntityEquipmentSlot,
    lockModeMap,
    slotMap,
    SuperGiveCommand,
    SuperReplaceItemBlockCommand,
    SuperReplaceItemEntityCommand,
} from "../constants/commandConstants";

type CommandResult = { status: CustomCommandStatus; message?: string };

type SetItemOptions = {
    container?: Container;
    slotId?: number;
    equippable?: EntityEquippableComponent;
    equipSlot?: EquipmentSlot;
};

const INVALID_POTION_DATA_MESSAGE = "Invalid command syantax: no such potion exists with that data value";

export class Commands {
    private origin!: CustomCommandOrigin;
    private amount!: number;
    private data!: number;
    private itemStack!: ItemStack;
    private customDataToJson: CustomData | string | undefined;
    private invalidCustomDataMessage: string | undefined;

    private constructor() {}

    // Commandsを生成し、初期化時点で発生したエラーがあればCommandResultとして返す
    public static create(
        origin: CustomCommandOrigin,
        itemId: string,
        amount: number,
        data: number,
        customData?: string
    ): Commands | CommandResult {
        const itemStack = Commands.resolveItemStack(itemId, amount, data);
        if (!(itemStack instanceof ItemStack)) return itemStack;
        const commands = new Commands();
        commands.origin = origin;
        commands.amount = amount;
        commands.data = data;
        commands.itemStack = itemStack;
        commands.customDataToJson = customData ? convertCustomDataToJson(customData) : undefined;

        if (typeof commands.customDataToJson === "string") {
            commands.invalidCustomDataMessage = commands.customDataToJson;
        }

        return commands;
    }

    // 通常アイテムはそのまま返し、ポーションならdata値を反映したItemStackへ変換する
    private static resolveItemStack(itemId: string, amount: number, data: number): ItemStack | CommandResult {
        const itemStack = new ItemStack(itemId, amount);
        if (!itemStack.getComponent(ItemComponentTypes.Potion)) return itemStack;

        const potionEffectType = Potions.getAllEffectTypes()[data];
        if (!potionEffectType) return { status: CustomCommandStatus.Failure, message: INVALID_POTION_DATA_MESSAGE };

        const deliveryType = Potions.getAllDeliveryTypes()[Commands.getPotionDeliveryTypeIndex(itemStack.typeId)];
        const resolvedPotion = Potions.resolve(potionEffectType, deliveryType);
        resolvedPotion.amount = amount;
        return resolvedPotion;
    }

    // ポーションのitemIdから通常・スプラッシュ・残留のdelivery type indexを決める
    private static getPotionDeliveryTypeIndex(typeId: string): number {
        switch (typeId) {
            case "minecraft:splash_potion":
                return 1;
            case "minecraft:lingering_potion":
                return 2;
            default:
                return 0;
        }
    }

    // コマンド結果メッセージ用のローカライズキーを取得する
    public getItemLocalizationKey(): string {
        return this.itemStack.localizationKey.startsWith("%") ? this.itemStack.localizationKey : `%${this.itemStack.localizationKey}`;
    }

    // localizationKeyにコマンド表示用の%接頭辞を補う
    // customDataで指定された名前・説明・設置/破壊可能ブロックなどをItemStackへ適用する
    private applyCustomData(data: number, customData?: CustomData): void {
        this.applyComponents(this.itemStack, data, customData);

        if (!customData) return;

        if (customData.custom_name) this.itemStack.nameTag = customData.custom_name;
        if (customData.lore) this.itemStack.setLore(customData.lore);
        if (typeof customData.keep_on_death === "boolean") this.itemStack.keepOnDeath = customData.keep_on_death;
        if (customData.can_place_on) this.itemStack.setCanPlaceOn(customData.can_place_on);
        if (customData.can_destroy) this.itemStack.setCanDestroy(customData.can_destroy);
        if (customData.item_lock) this.itemStack.lockMode = lockModeMap[customData.item_lock];
    }

    // 耐久値やエンチャントなど、ItemStackコンポーネント経由で設定する項目を適用する
    private applyComponents(itemStack: ItemStack, data: number, customData?: CustomData): void {
        for (const component of itemStack.getComponents()) {
            if (component instanceof ItemDurabilityComponent && data) {
                component.damage = Math.min(data, component.maxDurability);
            }

            if (component instanceof ItemEnchantableComponent && customData?.enchantments) {
                this.applyEnchantments(component, customData.enchantments);
            }
        }
    }

    // customDataのenchantmentsをItemEnchantableComponentへ追加する
    private applyEnchantments(component: ItemEnchantableComponent, enchantments: Record<string, number>): void {
        for (const [enchantType, level] of Object.entries(enchantments)) {
            const enchantment = { type: new EnchantmentType(enchantType), level };
            if (component.canAddEnchantment(enchantment)) component.addEnchantment(enchantment);
        }
    }

    // replaceitem用に、ItemStackへ実際にセット可能な数量を反映する
    private setItemAmount(): void {
        if (!this.itemStack.isStackable) {
            this.itemStack.amount = 1;
            return;
        }

        this.itemStack.amount = Math.min(this.amount, this.itemStack.maxAmount);
    }

    // give用に既存スタックへ優先して追加し、入りきらない分はドロップする
    private giveItem(player: Player, itemStack: ItemStack): void {
        const container = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!container) return;

        let remainingAmount = this.amount;

        if (!itemStack.isStackable) {
            itemStack.amount = 1;

            while (remainingAmount > 0) {
                const overflowingItem = container.addItem(itemStack);
                remainingAmount--;
                if (overflowingItem) player.dimension.spawnItem(overflowingItem, player.location);
            }

            return;
        }

        for (let slot = 0; slot < container.size && remainingAmount > 0; slot++) {
            const slotItemStack = container.getItem(slot);

            if (!slotItemStack) continue;
            if (!slotItemStack.isStackableWith(itemStack)) continue;
            if (slotItemStack.maxAmount === slotItemStack.amount) continue;

            const amountToAdd = Math.min(remainingAmount, slotItemStack.maxAmount - slotItemStack.amount);
            slotItemStack.amount += amountToAdd;
            remainingAmount -= amountToAdd;
            container.setItem(slot, slotItemStack);
        }

        while (remainingAmount > 0) {
            itemStack.amount = Math.min(remainingAmount, itemStack.maxAmount);
            const overflowingItemStack = container.addItem(itemStack);

            if (overflowingItemStack) break;
            remainingAmount -= itemStack.amount;
        }

        while (remainingAmount > 0) {
            itemStack.amount = Math.min(remainingAmount, itemStack.maxAmount);
            player.dimension.spawnItem(itemStack, player.location);
            remainingAmount -= itemStack.amount;
        }
    }

    // customDataを適用したItemStackを、装備・コンテナ・giveのいずれかへ反映する
    private setItem({ container, slotId, equippable, equipSlot }: SetItemOptions, player?: Player): void {
        system.run(() => {
            if (typeof this.customDataToJson !== "string") {
                this.applyCustomData(this.data, this.customDataToJson);
            }

            if (equippable && equipSlot !== undefined) {
                this.setItemAmount();
                equippable.setEquipment(equipSlot, this.itemStack);
                return;
            }

            if (container && typeof slotId === "number") {
                this.setItemAmount();
                container.setItem(slotId, this.itemStack);
                return;
            }

            if (player) this.giveItem(player, this.itemStack);
        });
    }

    // /give相当の処理を実行する
    public give(player: Player): CommandResult {
        if (this.invalidCustomDataMessage) return { status: CustomCommandStatus.Failure, message: this.invalidCustomDataMessage };

        const container = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!container) return { status: CustomCommandStatus.Failure, message: "Player inventory not found." };

        this.setItem({ container }, player);
        return { status: CustomCommandStatus.Success };
    }

    // /replaceitem entity相当の処理を実行する
    public replaceitem_player(player: Player, slot: EntityEquipmentSlot, slotId: number): CommandResult {
        if (this.invalidCustomDataMessage) return { status: CustomCommandStatus.Failure, message: this.invalidCustomDataMessage };

        if (slot.startsWith("slot.armor") || slot.startsWith("slot.weapon")) {
            const equippable = player.getComponent(EntityComponentTypes.Equippable);
            this.setItem({ equippable, equipSlot: slotMap[slot] }, player);
            return { status: CustomCommandStatus.Success, message: player.name };
        }

        const container = player.getComponent(EntityComponentTypes.Inventory)?.container;
        if (!container) return { status: CustomCommandStatus.Failure, message: "Player inventory not found." };

        switch (slot) {
            case "slot.inventory": {
                const inventorySlotId = slotId + 9;
                if (inventorySlotId < container.size) {
                    this.setItem({ container, slotId: inventorySlotId });
                    return { status: CustomCommandStatus.Success, message: player.name };
                }
                return {
                    status: CustomCommandStatus.Failure,
                    message: `§cCould not replace slot ${slotId}, must be a value between 0 and ${container.size - 10}.§r`,
                };
            }
            case "slot.hotbar":
                this.setItem({ container, slotId });
                return { status: CustomCommandStatus.Success, message: player.name };
            default:
                return {
                    status: CustomCommandStatus.Failure,
                    message: `§cCould not replace slot ${slotId}, must be a value between 0 and ${container.size}.§r`,
                };
        }
    }

    // /replaceitem block相当の処理を実行する
    public replaceitem_block(
        position: { x: number; y: number; z: number },
        slot: string,
        slotId: number
    ): CommandResult {
        if (this.invalidCustomDataMessage) return { status: CustomCommandStatus.Failure, message: this.invalidCustomDataMessage };

        const dimension = this.origin.sourceEntity?.dimension || this.origin.sourceBlock?.dimension || world.getDimension("overworld");
        const container = dimension.getBlock(position)?.getComponent(BlockComponentTypes.Inventory)?.container;

        if (!container) {
            return {
                status: CustomCommandStatus.Failure,
                message: `Block at (${Math.floor(position.x)},${Math.floor(position.y)},${Math.floor(position.z)}) is not a container.`,
            };
        }

        if (slotId >= container.size) {
            return {
                status: CustomCommandStatus.Failure,
                message: `Could not replace slot ${slotId}, must be a value between 0 and ${container.size}.`,
            };
        }

        this.setItem({ container, slotId });
        return {
            status: CustomCommandStatus.Success,
            message: `Replaced ${slot} slot ${slotId} with ${this.amount} * ${this.getItemLocalizationKey()}`,
        };
    }
}

export const superGiveCommand: SuperGiveCommand = function (origin, players, itemType, amount = 1, data = 0, customData) {
    let itemLocalizationKey: string | undefined;

    for (const player of players) {
        const playerCommands = Commands.create(origin, itemType.id, amount, data, customData);
        if (!(playerCommands instanceof Commands)) return playerCommands;
        itemLocalizationKey ??= playerCommands.getItemLocalizationKey();

        const result = playerCommands.give(player);
        if (result.status === CustomCommandStatus.Failure) return result;
    }

    return {
        status: CustomCommandStatus.Success,
        message: `Gave ${itemLocalizationKey ?? itemType.id} * ${amount} to ${players.map((player) => player.name).join(", ")}`,
    };
};

export const superReplaceItemEntityCommand: SuperReplaceItemEntityCommand = function (
    origin,
    players,
    slot,
    slotId,
    itemType,
    amount = 1,
    data = 0,
    customData
) {
    let itemLocalizationKey: string | undefined;
    const successTargets: string[] = [];

    for (const player of players) {
        const playerCommands = Commands.create(origin, itemType.id, amount, data, customData);
        if (!(playerCommands instanceof Commands)) return playerCommands;
        itemLocalizationKey ??= playerCommands.getItemLocalizationKey();

        const result = playerCommands.replaceitem_player(player, slot, slotId);
        if (result.status === CustomCommandStatus.Failure) return result;
        if (result.message) successTargets.push(result.message);
    }

    return {
        status: CustomCommandStatus.Success,
        message: `Replaced ${slot} slot ${slotId} of ${successTargets.join(", ")} with ${amount} * ${itemLocalizationKey ?? itemType.id}`,
    };
};

export const superReplaceItemBlockCommand: SuperReplaceItemBlockCommand = function (
    origin,
    position,
    slot,
    slotId,
    itemType,
    amount = 1,
    data = 0,
    customData
) {
    const commands = Commands.create(origin, itemType.id, amount, data, customData);
    if (!(commands instanceof Commands)) return commands;

    return commands.replaceitem_block(position, slot, slotId);
};
