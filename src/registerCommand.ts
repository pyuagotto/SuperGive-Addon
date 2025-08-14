import { system, CustomCommandParamType, CommandPermissionLevel, CustomCommandOrigin, CustomCommandResult, CustomCommandParameter, world, ItemComponentTypes } from "@minecraft/server";
import { superGiveCommand, superReplaceItemEntityCommand, superReplaceItemBlockCommand } from "./class/Commands";

system.beforeEvents.startup.subscribe((ev) => {
    const registerCommand = function(
        name: string, 
        description: string, 
        mandatoryParameters: CustomCommandParameter[], 
        optionalParameters: CustomCommandParameter[], 
        callback: (origin: CustomCommandOrigin, ...args: any[]) => CustomCommandResult | undefined
    ) {
        ev.customCommandRegistry.registerCommand(
            {
                name,
                description,
                mandatoryParameters,
                optionalParameters,
                permissionLevel: CommandPermissionLevel.GameDirectors,
            },
            callback
        );
    };

    ev.customCommandRegistry.registerEnum("pyuagotto:EntityEquipmentSlot", [
        "slot.armor.body",
        "slot.armor.chest",
        "slot.armor.feet",
        "slot.armor.head",
        "slot.armor.legs",
        //"slot.chest",
        //"slot.enderchest",
        //"slot.equippable",
        "slot.hotbar",
        "slot.inventory",
        //"slot.saddle",
        "slot.weapon.mainhand",
        "slot.weapon.offhand",
    ]);

    ev.customCommandRegistry.registerEnum("pyuagotto:slot.container", ["slot.container"]);

    registerCommand(
        "pyuagotto:super_give",
        "commands.give.description",
        [
            { name: "player", type: CustomCommandParamType.PlayerSelector },
            { name: "itemName", type: CustomCommandParamType.ItemType },
        ],
        [
            { name: "amount", type: CustomCommandParamType.Integer },
            { name: "data", type: CustomCommandParamType.Integer },
            { name: "customData", type: CustomCommandParamType.String },
        ],
        superGiveCommand
    );

    registerCommand(
        "pyuagotto:super_replaceitem_player",
        "commands.replaceitem.description",
        [
            { name: "target", type: CustomCommandParamType.PlayerSelector },
            { name: "pyuagotto:EntityEquipmentSlot", type: CustomCommandParamType.Enum },
            { name: "slotId", type: CustomCommandParamType.Integer },
            { name: "itemName", type: CustomCommandParamType.ItemType },
        ],
        [
            { name: "amount", type: CustomCommandParamType.Integer },
            { name: "data", type: CustomCommandParamType.Integer },
            { name: "customData", type: CustomCommandParamType.String },
        ],
        superReplaceItemEntityCommand
    );

    registerCommand(
        "pyuagotto:super_replaceitem_block",
        "commands.replaceitem.description",
        [
            { name: "position", type: CustomCommandParamType.Location },
            { name: "pyuagotto:slot.container", type: CustomCommandParamType.Enum },
            { name: "slotId", type: CustomCommandParamType.Integer },
            { name: "itemName", type: CustomCommandParamType.ItemType },
        ],
        [
            { name: "amount", type: CustomCommandParamType.Integer },
            { name: "data", type: CustomCommandParamType.Integer },
            { name: "customData", type: CustomCommandParamType.String },
        ],
        superReplaceItemBlockCommand
    );
});