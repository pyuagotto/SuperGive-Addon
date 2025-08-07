import { BlockTypes, EnchantmentTypes } from "@minecraft/server";
import { lockModeMap } from "./constants/commandConstants";
import { customDataList } from "./constants/commandConstants";
// カスタムデータをJSON形式に変換する関数
export const convertCustomDataToJson = function (str) {
    str = str.trim();
    if (str.startsWith("{") && str.endsWith("}")) {
        str = str.slice(1, -1);
    }
    let result = "";
    let inQuote = false;
    let bracketDepth = 0;
    let braceDepth = 0;
    let buffer = "";
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '"' && str[i - 1] !== "\\") {
            inQuote = !inQuote;
        }
        if (!inQuote) {
            if (char === "[")
                bracketDepth++;
            if (char === "]")
                bracketDepth--;
            if (char === "{")
                braceDepth++;
            if (char === "}")
                braceDepth--;
        }
        // トップレベルで「=」を「:」に置き換え
        if (!inQuote && bracketDepth === 0 && braceDepth === 0 && char === "=") {
            result += buffer.replace(/^\s*(\w+)\s*$/, '"$1"') + ":";
            buffer = "";
        }
        else if (!inQuote && bracketDepth === 0 && braceDepth === 0 && char === ",") {
            result += buffer + ",";
            buffer = "";
        }
        else {
            buffer += char;
        }
        // enchantのidにダブルクォートをつける処理
        if (buffer.trim().startsWith("{") && buffer.trim().endsWith("}")) {
            buffer = buffer.replace(/(\w+)\s*:/g, '"$1":');
        }
    }
    result += buffer; // 最後の残り
    const jsonString = `{${result}}`;
    try {
        const customData = JSON.parse(jsonString);
        return checkCustomData(customData);
    }
    catch (e) {
        return "Custom data description format is invalid.";
    }
};
/**
 * CustomDataのバリデーション
 */
const checkCustomData = function (customData) {
    for (const data in customData) {
        if (!customDataList[data])
            return `Invalid custom data key: ${data}`;
    }
    if (customData.custom_name && typeof customData.custom_name !== "string")
        return "Invalid custom_name format.";
    if (customData.lore && !Array.isArray(customData.lore))
        return "Invalid lore format.";
    if (customData.enchantments && typeof customData.enchantments !== "object")
        return "Invalid enchantments format.";
    if (customData.can_place_on) {
        if (!Array.isArray(customData.can_place_on))
            return "Invalid can_place_on format.";
        for (const blockType of customData.can_place_on) {
            if (!BlockTypes.get(blockType))
                return `Invalid block type in can_place_on: ${blockType}`;
        }
    }
    if (customData.can_destroy) {
        if (!Array.isArray(customData.can_destroy))
            return "Invalid can_destroy format.";
        for (const blockType of customData.can_destroy) {
            if (!BlockTypes.get(blockType))
                return `Invalid block type in can_destroy: ${blockType}`;
        }
    }
    if (customData.keep_on_death !== undefined && typeof customData.keep_on_death !== "boolean")
        return "Invalid keep_on_death format.";
    if (customData.item_lock) {
        if (typeof customData.item_lock !== "string")
            return "Invalid item_lock format.";
        if (lockModeMap[customData.item_lock] === undefined)
            return `Invalid item_lock value: ${customData.item_lock}`;
    }
    if (customData.enchantments) {
        for (const enchantId in customData.enchantments) {
            const enchantmentType = EnchantmentTypes.get(enchantId);
            if (!enchantmentType)
                return `Invalid enchantment type: ${enchantId}`;
            if (customData.enchantments[enchantId] > enchantmentType.maxLevel)
                return `${enchantId} dose not support level ${customData.enchantments[enchantId]}`;
        }
    }
    return customData;
};
