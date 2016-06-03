
/**
 * Find the first index of an item in a list, by checking on exact equality (===).
 * @param item
 * @param list
 * @returns The first index of the item in the list, when match found.
 *          null, when not match was found.
 *          null, when list is not supplied
 */
export function findIndexByItem<T>(item: T, list: Array<T>): number {
    if (!list) { return; }

    for (var i = 0, length = list.length; i < length; i++) {
        if (list[i] === item) {
            return i;
        }
    }

    return null;
};