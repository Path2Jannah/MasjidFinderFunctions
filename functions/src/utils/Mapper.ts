
/**
 * Interface for when we want to create an object that will act as a key value pair
 * 
 * Example: 
 * 
 * ```typescript
 * private map: StringToNumber = {
 *       "bukhari": 1,
 *       "muslim": 2,
 * }
 * ```
 * Then we can pull the value from querying the value by giving the key
 * ```typescript
 * console.log(map[muslim]); // Output: 2
 * ```
 */
interface StringToNumber {
    [key: string]: number;
}