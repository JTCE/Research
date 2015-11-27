/**
*	We extend the base type "Array" with a property "itemType", so we can automatically convert JSON to a Model.
*/
interface Array<T> {
	itemType: string;
}