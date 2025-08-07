import { ItemStack, system, ItemDurabilityComponent, ItemEnchantableComponent, EnchantmentType, ItemPotionComponent, CustomCommandStatus, world, EntityComponentTypes, BlockComponentTypes, ItemComponentTypes } from "@minecraft/server";
import { convertCustomDataToJson } from "../utils";
import { potionData, potionKeyMap } from "../constants/potionData";
import { potionLiquidMap, slotMap, lockModeMap } from "../constants/commandConstants";
export class Commands {
    constructor(origin, itemType, amount = 1, data = 0, customData) {
        this.origin = origin;
        this.amount = amount;
        this.data = data;
        this.itemStack = new ItemStack(itemType.id, 1);
        // customDataの型チェック
        this.customDataToJson = customData ? convertCustomDataToJson(customData) : undefined;
        if (typeof this.customDataToJson === "string") {
            this.invalidCustomDataMessage = this.customDataToJson;
        }
    }
    //データ値とカスタムデータをアイテムに適用
    applyCustomData(data, customData) {
        if (customData) {
            this.applyComponents(this.itemStack, data, customData);
            if (customData.custom_name)
                this.itemStack.nameTag = customData.custom_name;
            if (customData.lore)
                this.itemStack.setLore(customData.lore);
            if (typeof customData.keep_on_death === "boolean")
                this.itemStack.keepOnDeath = customData.keep_on_death;
            if (customData.can_place_on)
                this.itemStack.setCanPlaceOn(customData.can_place_on);
            if (customData.can_destroy)
                this.itemStack.setCanDestroy(customData.can_destroy);
            if (customData.item_lock)
                this.itemStack.lockMode = lockModeMap[customData.item_lock];
        }
        else {
            this.applyComponents(this.itemStack, data);
        }
    }
    //アイテムのコンポーネントを適用
    applyComponents(itemStack, data, customData) {
        for (const component of itemStack.getComponents()) {
            if (component instanceof ItemDurabilityComponent && data) {
                component.damage = Math.min(data, component.maxDurability);
            }
            if (component instanceof ItemEnchantableComponent && (customData === null || customData === void 0 ? void 0 : customData.enchantments)) {
                this.applyEnchantments(component, customData.enchantments);
            }
            if (component instanceof ItemPotionComponent) {
                this.applyPotionData(itemStack, data);
            }
        }
    }
    //エンチャントを適用
    applyEnchantments(component, enchantments) {
        for (const [enchantType, level] of Object.entries(enchantments)) {
            const enchantment = { type: new EnchantmentType(enchantType), level };
            if (component.canAddEnchantment(enchantment))
                component.addEnchantment(enchantment);
        }
    }
    //ポーションデータを適用
    applyPotionData(itemStack, data) {
        const potion = potionData[data];
        const id = itemStack.typeId;
        if (potion) {
            if (potion.effect === "Regeneration") {
                console.warn(`Potion effect ${potion.effect} is not supported. Please use a different effect.`);
                return;
            }
            this.itemStack = ItemStack.createPotion({
                effect: potion.effect,
                modifier: potion.modifier,
                liquid: potionLiquidMap[id],
            });
        }
    }
    //ポーションのローカライズキー取得
    getPotionLocalizationKey() {
        let itemLocalizationKey = "";
        if (this.data > 46)
            return;
        const potion = potionData[this.data];
        const potionId = potionKeyMap[potion.effect];
        if (potionId) {
            switch (this.itemStack.typeId) {
                case "minecraft:potion":
                    itemLocalizationKey = "potion." + potionId + ".name";
                    break;
                case "minecraft:splash_potion":
                    itemLocalizationKey = "potion." + potionId + ".splash.name";
                    break;
                case "minecraft:lingering_potion":
                    itemLocalizationKey = "potion." + potionId + ".linger.name";
                    break;
            }
        }
        return itemLocalizationKey;
    }
    // ポーションデータやカスタムデータのバリデーションとローカライズキー取得をまとめる
    validateAndGetLocalizationKey() {
        var _a;
        let itemLocalizationKey = this.itemStack.localizationKey;
        if (this.itemStack.getComponent(ItemComponentTypes.Potion)) {
            if (this.data > 46) {
                return { valid: false, message: "Invalid command syntax: no such potion exists with that data value", itemLocalizationKey };
            }
            if (this.data >= 28 && this.data <= 30) {
                return { valid: false, message: "Regeneration potion is not supported", itemLocalizationKey };
            }
            itemLocalizationKey = (_a = this.getPotionLocalizationKey()) !== null && _a !== void 0 ? _a : itemLocalizationKey;
        }
        return { valid: true, itemLocalizationKey };
    }
    setItemAmount() {
        if (!this.itemStack.isStackable)
            this.itemStack.amount = 1;
        else if (this.amount <= this.itemStack.maxAmount)
            this.itemStack.amount = this.amount;
        else
            this.itemStack.amount = this.itemStack.maxAmount;
    }
    giveItem(player, itemStack) {
        const inventory = player.getComponent(EntityComponentTypes.Inventory);
        if (!inventory)
            return;
        const { container } = inventory;
        if (!container)
            return;
        //スタック不可能なアイテムの場合分割する
        if (!itemStack.isStackable) {
            itemStack.amount = 1;
            while (this.amount > 0) {
                const item = container.addItem(itemStack);
                this.amount--;
                if (!item)
                    continue;
                player.dimension.spawnItem(item, player.location);
            }
            return;
        }
        //スタック可能なアイテムの場合、インベントリ内のアイテムを探す
        for (let slot = 0; slot < container.size; slot++) {
            const slotItemStack = container.getItem(slot);
            if (!slotItemStack)
                continue;
            if (!slotItemStack.isStackableWith(itemStack))
                continue;
            if (slotItemStack.maxAmount === slotItemStack.amount)
                continue;
            const maxAmountToAdd = slotItemStack.maxAmount - slotItemStack.amount;
            if (this.amount <= maxAmountToAdd) {
                slotItemStack.amount += this.amount;
                container.setItem(slot, slotItemStack);
                return;
            }
            else {
                this.amount -= maxAmountToAdd;
                slotItemStack.amount = slotItemStack.maxAmount;
                container.setItem(slot, slotItemStack);
            }
        }
        //インベントリ内にアイテムがない場合、またはスタックできない場合
        while (this.amount > 0) {
            if (this.amount <= itemStack.maxAmount) {
                itemStack.amount = this.amount;
                const overflowingItemStack = container.addItem(itemStack);
                if (overflowingItemStack)
                    break;
                return;
            }
            else {
                itemStack.amount = itemStack.maxAmount;
                const overflowingItemStack = container.addItem(itemStack);
                if (overflowingItemStack)
                    break;
                this.amount -= itemStack.maxAmount;
            }
        }
        while (this.amount > 0) {
            if (this.amount <= itemStack.maxAmount)
                itemStack.amount = this.amount;
            else
                itemStack.amount = itemStack.maxAmount;
            player.dimension.spawnItem(itemStack, player.location);
            this.amount -= itemStack.maxAmount;
        }
    }
    setItem({ container, slotId, equippable, equipSlot }, player) {
        system.run(() => {
            if (typeof this.customDataToJson !== "string") {
                this.applyCustomData(this.data, this.customDataToJson);
            }
            if (equippable && equipSlot) {
                this.setItemAmount();
                equippable.setEquipment(equipSlot, this.itemStack);
            }
            else if (container && typeof slotId === "number") {
                this.setItemAmount();
                container.setItem(slotId, this.itemStack);
            }
            else if (player) {
                this.giveItem(player, this.itemStack);
            }
        });
    }
    give(player) {
        var _a;
        if (this.invalidCustomDataMessage)
            return { status: CustomCommandStatus.Failure, message: this.invalidCustomDataMessage };
        const container = (_a = player.getComponent(EntityComponentTypes.Inventory)) === null || _a === void 0 ? void 0 : _a.container;
        if (!container)
            return { status: CustomCommandStatus.Failure, message: "Player inventory not found." };
        const { valid, message, itemLocalizationKey } = this.validateAndGetLocalizationKey();
        if (!valid)
            return { status: CustomCommandStatus.Failure, message };
        this.setItem({ container }, player);
        return { status: CustomCommandStatus.Success, message: itemLocalizationKey };
    }
    replaceitem_player(player, slot, slotId) {
        var _a;
        if (this.invalidCustomDataMessage)
            return { status: CustomCommandStatus.Failure, message: this.invalidCustomDataMessage };
        const { valid, message, itemLocalizationKey } = this.validateAndGetLocalizationKey();
        if (!valid)
            return { status: CustomCommandStatus.Failure, message };
        const equippable = player.getComponent(EntityComponentTypes.Equippable);
        if (slot.startsWith("slot.armor") || slot.startsWith("slot.weapon")) {
            this.setItem({ equippable, equipSlot: slotMap[slot] }, player);
            return { status: CustomCommandStatus.Success, message: player.name };
        }
        else {
            const container = (_a = player.getComponent(EntityComponentTypes.Inventory)) === null || _a === void 0 ? void 0 : _a.container;
            if (!container)
                return { status: CustomCommandStatus.Failure, message: "Player inventory not found." };
            switch (slot) {
                case "slot.inventory": {
                    if (slotId + 9 < container.size) {
                        this.setItem({ container, slotId: slotId + 9 });
                        return { status: CustomCommandStatus.Success, message: player.name };
                    }
                    return { status: CustomCommandStatus.Failure, message: `§cCould not replace slot ${slotId}, must be a value between 0 and ${container.size - 10}.§r` };
                }
                case "slot.hotbar": {
                    this.setItem({ container, slotId });
                    return { status: CustomCommandStatus.Success, message: player.name };
                }
            }
            return { status: CustomCommandStatus.Failure, message: `§cCould not replace slot ${slotId}, must be a value between 0 and ${container.size}.§r` };
        }
    }
    /**
     * /replaceitem block
     */
    replaceitem_block(position, slot, slotId) {
        var _a, _b, _c, _d;
        if (this.invalidCustomDataMessage) {
            return { status: CustomCommandStatus.Failure, message: this.invalidCustomDataMessage };
        }
        const { valid, message, itemLocalizationKey } = this.validateAndGetLocalizationKey();
        if (!valid) {
            return { status: CustomCommandStatus.Failure, message };
        }
        const dimension = ((_a = this.origin.sourceEntity) === null || _a === void 0 ? void 0 : _a.dimension) || ((_b = this.origin.sourceBlock) === null || _b === void 0 ? void 0 : _b.dimension) || world.getDimension("overworld");
        const container = (_d = (_c = dimension.getBlock(position)) === null || _c === void 0 ? void 0 : _c.getComponent(BlockComponentTypes.Inventory)) === null || _d === void 0 ? void 0 : _d.container;
        if (container) {
            if (slotId < container.size) {
                this.setItem({ container, slotId });
                return { status: CustomCommandStatus.Success, message: `Replaced slot.container slot ${slotId} with ${this.amount} * %${itemLocalizationKey}` };
            }
            return { status: CustomCommandStatus.Failure, message: `Could not replace slot ${slotId}, must be a value between 0 and ${container.size}.` };
        }
        return { status: CustomCommandStatus.Failure, message: `Block at (${Math.floor(position.x)},${Math.floor(position.y)},${Math.floor(position.z)}) is not a container.` };
    }
}
// superGiveCommand
export const superGiveCommand = function (origin, players, itemType, amount = 1, data, customData) {
    let itemLocalizationKey = "";
    const commands = new Commands(origin, itemType, amount, data, customData);
    for (const player of players) {
        const result = commands.give(player);
        if ((result === null || result === void 0 ? void 0 : result.status) === CustomCommandStatus.Failure) {
            return { status: CustomCommandStatus.Failure, message: result.message };
        }
        itemLocalizationKey = result === null || result === void 0 ? void 0 : result.message;
    }
    return {
        status: CustomCommandStatus.Success,
        message: `Gave %${itemLocalizationKey} * ${amount} to ${players.map(player => player.name).join(", ")}`
    };
};
// superReplaceItemEntityCommand
export const superReplaceItemEntityCommand = function (origin, players, slot, slotId, itemType, amount = 1, data, customData) {
    const itemStack = new ItemStack(itemType.id);
    const commandResultList = [];
    const commands = new Commands(origin, itemType, amount, data, customData);
    for (const player of players) {
        const result = commands.replaceitem_player(player, slot, slotId);
        if ((result === null || result === void 0 ? void 0 : result.status) === CustomCommandStatus.Failure)
            return { status: CustomCommandStatus.Failure, message: result.message };
        commandResultList.push(result);
    }
    const successTargets = [];
    const failureMessages = [];
    let resultMessage = "";
    for (const result of commandResultList) {
        if ((result === null || result === void 0 ? void 0 : result.status) === CustomCommandStatus.Success) {
            if (result.message)
                successTargets.push(result.message);
        }
        else if ((result === null || result === void 0 ? void 0 : result.status) === CustomCommandStatus.Failure) {
            if (result.message)
                failureMessages.push(result.message);
        }
    }
    if (failureMessages.length > 0) {
        for (const message of failureMessages) {
            resultMessage += message + "\n";
        }
    }
    if (successTargets.length > 0) {
        resultMessage += `Replaced ${slot} slot ${slotId} of ${successTargets.join(", ")} with ${amount} * %${itemStack.localizationKey}`;
    }
    return { status: CustomCommandStatus.Success, message: resultMessage };
};
// superReplaceItemBlockCommand
export const superReplaceItemBlockCommand = function (origin, position, slot, slotId, itemType, amount = 1, data, customData) {
    const commands = new Commands(origin, itemType, amount, data, customData);
    return commands.replaceitem_block(position, slot, slotId);
};
