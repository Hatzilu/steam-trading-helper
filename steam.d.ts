declare module Steam {
	export interface InventoryResponse {
		success: boolean;
		rgInventory: { [key: string]: RgInventory };
		rgCurrency: any[];
		rgDescriptions: { [key: string]: RgDescription };
		more: boolean;
		more_start: boolean;
	}

	export interface RgInventory {
		id: string;
		classid: string;
		instanceid: string;
		amount: string;
		hide_in_china: number;
		pos: number;
	}

	export interface RgDescription {
		appid: string;
		classid: string;
		instanceid: string;
		icon_url: string;
		icon_url_large: string;
		icon_drag_url: string;
		name: string;
		market_hash_name: string;
		market_name: string;
		name_color: NameColorEnum;
		background_color: BackgroundColor;
		type: string;
		tradable: number;
		marketable: number;
		commodity: number;
		market_tradable_restriction: string;
		market_marketable_restriction: string;
		descriptions: string;
		actions: Action[];
		market_actions?: Action[];
		tags: Tag[];
		app_data: The100_0_AppData;
	}

	export interface Action {
		name: Name;
		link: string;
	}

	export enum Name {
		InspectInGame = 'Inspect in Game...',
		ItemWikiPage = 'Item Wiki Page...',
	}
	export enum BackgroundColor {
		The3C352E = '3C352E',
	}

	export enum PurpleColor {
		D32Ce6 = 'd32ce6',
		D83636 = 'd83636',
		Eb4B4B = 'eb4b4b',
		Ffd700 = 'ffd700',
		The4B69Ff = '4b69ff',
		The6F6A63 = '6F6A63',
		The756B5E = '756b5e',
		The7Ea9D1 = '7ea9d1',
		The8847Ff = '8847ff',
	}

	export enum NameColorEnum {
		Cf6A32 = 'CF6A32',
		The4B69Ff = '4b69ff',
		The7D6D00 = '7D6D00',
		The8650AC = '8650AC',
		The8847Ff = '8847ff',
	}

	export interface Tag {
		internal_name: string;
		name: string;
		category: Category;
		color?: NameColorEnum;
		category_name: Category;
	}

	export enum Category {
		Class = 'Class',
		Collection = 'Collection',
		Grade = 'Grade',
		Quality = 'Quality',
		Rarity = 'Rarity',
		Type = 'Type',
	}

	export interface PurpleAppData {
		limited: number;
	}

	export enum FluffyColor {
		The00A000 = '00a000',
		The7Ea9D1 = '7ea9d1',
		The8B8989 = '8b8989',
	}

	export interface FluffyAppData {
		def_index: string;
	}

	export interface TentacledAppData {
		def_index?: string;
		is_itemset_name?: number;
	}

	export enum TentacledColor {
		D83636 = 'd83636',
		E1E10F = 'e1e10f',
		The756B5E = '756b5e',
		The7Ea9D1 = '7ea9d1',
		The8B8989 = '8b8989',
	}
}
