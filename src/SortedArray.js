/*
 * Dateline 2.0.0
 * (c) 2019 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/dateline
 * https://sjaakpriester.nl
 */

/**
 * Array that stays always sorted, provided that you only insert items via insert()
 *
 */
export default class SortedArray extends Array {

    /**
     * @param compareFn -- compare function return -1, 0 or 1
     * @param items, optional -- items to start with
     */
    constructor(compareFn, ...items) {
        super();
        Object.defineProperty(this, 'compare', { value: compareFn });
        this.insert(...items);
    }

    /**
     * @param pred
     * @returns {number} 0 <= i <= array.length such that !pred(array[i - 1]) && pred(array[i]).
     * @private
     * @link https://stackoverflow.com/questions/22697936/binary-search-in-javascript
     */
    _binarySearch(pred) {
        let lo = -1, hi = this.length;
        while (1 + lo < hi) {
            const mid = lo + ((hi - lo) >> 1);
            if (pred(this[mid])) {
                hi = mid;
            } else {
                lo = mid;
            }
        }
        return hi;
    }

    /**
     * @param needle
     * @returns {number} 0 ... array.length - 1 if found, -1 otherwise
     */
    binIndexOf(needle) {
        // r is smallest insert position
        let r = this._binarySearch(j => 0 >= this.compare(needle, j));
        return r >= this.length || this.compare(needle, this[r]) ? -1 : r;
    }

    /**
     * @param needle
     * @returns {number} 0 ... array.length smallest insert position
     */
    binInsertPosOf(needle) {
        return this._binarySearch(j => 0 >= this.compare(needle, j));
    }

    /**
     * @param needle
     * @returns {number} 0 ... array.length - 1 if found, -1 otherwise
     */
    binFind(needle) {
        // r is smallest insert position
        let r = this._binarySearch(j => 0 >= this.compare(needle, j)),
            v = this[r];

        return  r >= this.length || this.compare(needle, v) ? undefined : v;
    }

    /**
     * @param items zero or more items -- insert(1, 2, 3...)
     */
    insert(...items)   {
        items.forEach(item => {
            // r is smallest insert position
            let r = this._binarySearch(j => 0 >= this.compare(item, j));
            this.splice(r, 0, item);
        });
    }
}
