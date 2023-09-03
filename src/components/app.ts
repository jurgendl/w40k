//import $ from "jquery";
// https://developer.snapappointments.com/bootstrap-select/
// https://apps.ajott.io/quickref/character.html

// javascript breakpoint
// // eslint-disable-next-line no-debugger
//debugger;

import {compressUrlSafe, decompressUrlSafe} from './lzma-url.mjs'
import 'animate.css';

export enum Aptitude {
	/* common */
	General = "General",
	/* standard */
	Weapon_Skill = "Weapon Skill",
	Ballistic_Skill = "Ballistic Skill",
	Strength = "Strength",
	Toughness = "Toughness",
	Agility = "Agility",
	Intelligence = "Intelligence",
	Perception = "Perception",
	Willpower = "Willpower",
	Fellowship = "Fellowship",
	/* special */
	Offence = "Offence",
	Finesse = "Finesse",
	Defence = "Defence",
	Psyker = "Psyker",
	Tech = "Tech",
	Knowledge = "Knowledge",
	Leadership = "Leadership",
	Fieldcraft = "Fieldcraft",
	Social = "Social"
}

interface W40KCosts {
	type: string;//characteristic(max:4),talent(max:3),skill(max:4)
	cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/
	;
}

interface W40KWorld {
	world: string;
	aptitude: Aptitude;
}

interface W40KBackground {
	background: string;
	aptitude: Aptitude;
}

interface W40KRole {
	role: string;
	aptitudes: Aptitude[];
}

interface W40KData {
	costs: W40KCosts[];
	free: Aptitude;
	classes: W40KClass[];
	worlds: W40KWorld[];
	backgrounds: W40KBackground[];
	roles: W40KRole[];
	optional: Aptitude[];
	characteristic: W40KCharacteristic[];
	skills: W40KSkill[];
	talents: W40KTalent[];
}

interface W40KCharacteristic {
	name: Aptitude;
	aptitude: Aptitude;
}

interface W40KTalent {
	tier: number,
	talent: string,
	prerequisites: string,
	apt1: Aptitude,
	apt2: Aptitude,
	benefit: string,
	ref: string
}

interface W40KSkill {
	name: string;
	aptitudes: Aptitude[];
}

interface W40KClass {
	class: string;
	aptitudes: Aptitude[];
}

class CharacteristicPick {
	characteristic: W40KCharacteristic;
	amount: number;

	constructor(characteristic: W40KCharacteristic, amount: number) {
		this.characteristic = characteristic;
		this.amount = amount;
	}
}

class SkillPick {
	skill: W40KSkill;
	choice: string | null;
	amount: number;

	constructor(skill: W40KSkill, choice: string, amount: number) {
		this.skill = skill;
		this.choice = choice;
		this.amount = amount;
	}
}

class WeightedClass {
	class: W40KClass | null = null;
	matches = 0;

	constructor(c: W40KClass, matches: number) {
		this.class = c;
		this.matches = matches;
	}
}

class WeightedRole {
	role: W40KRole | null = null;
	matches = 0;

	constructor(r: W40KRole, matches: number) {
		this.role = r;
		this.matches = matches;
	}
}

class WeightedWorld {
	world: W40KWorld | null = null;
	matches = 0;

	constructor(w: W40KWorld, matches: number) {
		this.world = w;
		this.matches = matches;
	}
}

class WeightedBackground {
	background: W40KBackground | null = null;
	matches = 0;

	constructor(b: W40KBackground, matches: number) {
		this.background = b;
		this.matches = matches;
	}
}

class ConfigData {
	wishlist: string; // talent_wishlist
	skill_wishlist: string;
	characteristic_wishlist: string;
	skip0CbChecked: boolean;
	worldSelected: string;
	classSelected: string;
	backgroundSelected: string;
	roleSelected: string;
	extraAptitudesSelected: string[];
	aptitudesWishlist: string[];

	constructor() {
		this.wishlist = ""; // talent_wishlist
		this.skill_wishlist = "";
		this.characteristic_wishlist = "";
		this.aptitudesWishlist = [];
		this.skip0CbChecked = false;
		this.worldSelected = "";
		this.classSelected = "";
		this.backgroundSelected = "";
		this.roleSelected = "";
		this.extraAptitudesSelected = [];
	}
}

class Tree {
	nodeMap = new Map<string, Node>();

	rootNode = new Node("");

	nodeCount = 0;

	treeBuild = false;

	get(name: string): Node | undefined {
		return this.nodeMap.get(name);
	}

	getOrCreate(name: string): Node {
		let node = this.nodeMap.get(name);
		if (!node) {
			this.nodeCount++;
			node = new Node(name);
			this.nodeMap.set(name, node);
		}
		return node;
	}

	linkParentToChild(parent: Node, child: Node): void {
		parent.children.push(child);
		child.parents.push(parent);
	}

	buildTree(createRootNode: boolean): Tree {
		if (this.treeBuild) return this;

		if (createRootNode) {
			for (const node of this.nodeMap.values()) {
				if (node.parents.length === 0) {
					this.linkParentToChild(this.rootNode, node);
				}
			}
		}

		// iterate over all nodes and sort children by name
		for (const node of this.nodeMap.values()) {
			node.children.sort((a, b) => a.name.localeCompare(b.name));
		}

		if (createRootNode) this.rootNode.children.sort((a, b) => a.name.localeCompare(b.name));

		this.treeBuild = true;

		return this;
	}

	iterateParents(node: Node): Node[] {
		const parents = [] as Node[];
		for (const parent of node.parents) {
			parents.push(...this.iterateParents(parent));
			parents.push(parent);
		}
		return parents;
	}
}

class Node {
	name: string;
	parents: Node[];
	children: Node[];
	data: any;

	constructor(name: string) {
		this.name = name;
		this.data = null;
		this.parents = [];
		this.children = [];
	}
}

export class App {
	tree = new Tree();
	fullTree = new Tree();
	data!: W40KData;
	configData: ConfigData = new ConfigData();
	selectedAptitudes: Aptitude[] = [];
	source = "ow";

	start(): void {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const sourceParam: string | null = urlParams.get('source');
		const configDateParam: string | null = urlParams.get('cfg');
		const source = sourceParam ? sourceParam : "ow";
		fetch('assets/w40k-' + source + '.json')
			.then((response) => response.json())
			.then((data) => this.$start(data, source, configDateParam));
	}

	$start(data: W40KData, source: string, configDateParam: string | null): void {
		this.data = data;
		this.source = source;

		this.buildFullTree();

		const configDataString: string | null = localStorage.getItem("w40k-data-config-" + source);
		if (configDateParam) {
			if (configDateParam.startsWith("%7B") || configDateParam.startsWith("{")) {
				console.log("load-json", "w40k-data-config-" + this.source, configDateParam);
				this.configData = JSON.parse(configDateParam);
			} else {
				const decompressUrlSafe1 = decompressUrlSafe(configDateParam);
				console.log("load-compressed", "w40k-data-config-" + this.source, decompressUrlSafe1);
				this.configData = JSON.parse(decompressUrlSafe1);
			}
		} else if (configDataString) {
			console.log("load-browser", "w40k-data-config-" + this.source, configDataString);
			this.configData = JSON.parse(configDataString);
		}

		const classSelectContainer = document.getElementById("classSelectContainer") as HTMLDivElement;
		if (this.data.classes && this.data.classes.length > 0) {
			const classSelect = document.getElementById("classSelect") as HTMLSelectElement;
			{
				const option = document.createElement("option");
				option.text = "None";
				classSelect.add(option);
			}
			// add options to select element
			for (let i = 0; i < this.data.classes.length; i++) {
				const option = document.createElement("option");
				const apts = this.data.classes[i].aptitudes;
				/*let apt = "";
				let aptalt = "";
				for (let j = 0; j < apts.length; j++) {
					apt += apts[j];
					aptalt += "<span class='badge badge-pill badge-secondary "+apts[j].replace(" ","_")+"'>"+apts[j]+"</span>";
					if (j < apts.length - 1) {
						apt += ", ";
					}
				}*/
				const {apt, aptalt} = this.commonFunc2(apts);
				option.text = this.data.classes[i].class + " (" + apt.trim() + ")";
				option.setAttribute("data-content", this.data.classes[i].class + " " + aptalt);
				option.value = this.data.classes[i].class;
				if (this.configData.classSelected && this.configData.classSelected == this.data.classes[i].class) {
					option.selected = true;
				}
				classSelect.add(option);
			}
			// add event listener to select element
			classSelect.addEventListener("change", (event) => {
				this.triggerRecalc(event);
			});
		} else {
			classSelectContainer.style.display = "none";
		}

		const worldSelectContainer = document.getElementById("worldSelectContainer") as HTMLDivElement;
		if (this.data.worlds && this.data.worlds.length > 0) {
			const worldSelect = document.getElementById("worldSelect") as HTMLSelectElement;
			{
				const option = document.createElement("option");
				option.text = "None";
				worldSelect.add(option);
			}
			// add options to select element
			for (let i = 0; i < this.data.worlds.length; i++) {
				const option = document.createElement("option");
				option.text = this.data.worlds[i].world + " (" + this.data.worlds[i].aptitude + ")";
				option.setAttribute("data-content", this.data.worlds[i].world + " " + "<span class='badge badge-pill badge-secondary " + this.data.worlds[i].aptitude.replace(" ", "_") + "'>" + this.data.worlds[i].aptitude + "</span>");
				option.value = this.data.worlds[i].world;
				if (this.configData.worldSelected && this.configData.worldSelected == this.data.worlds[i].world) {
					option.selected = true;
				}
				worldSelect.add(option);
			}
			// add event listener to select element
			worldSelect.addEventListener("change", (event) => {
				this.triggerRecalc(event);
			});
		} else {
			worldSelectContainer.style.display = "none";
		}

		const backgroundSelectContainer = document.getElementById("backgroundSelectContainer") as HTMLDivElement;
		if (this.data.backgrounds && this.data.backgrounds.length > 0) {
			const backgroundSelect = document.getElementById("backgroundSelect") as HTMLSelectElement;
			{
				const option = document.createElement("option");
				option.text = "None";
				backgroundSelect.add(option);
			}
			// add options to select element
			for (let i = 0; i < this.data.backgrounds.length; i++) {
				const option = document.createElement("option");
				option.text = this.data.backgrounds[i].background + " (" + this.data.backgrounds[i].aptitude + ")";
				option.setAttribute("data-content", this.data.backgrounds[i].background + " " + "<span class='badge badge-pill badge-secondary " + this.data.backgrounds[i].aptitude.replace(" ", "_") + "'>" + this.data.backgrounds[i].aptitude + "</span>");
				option.value = this.data.backgrounds[i].background;
				if (this.configData.backgroundSelected && this.configData.backgroundSelected == this.data.backgrounds[i].background) {
					option.selected = true;
				}
				backgroundSelect.add(option);
			}
			// add event listener to select element
			backgroundSelect.addEventListener("change", (event) => {
				this.triggerRecalc(event);
			});
		} else {
			backgroundSelectContainer.style.display = "none";
		}

		const roleSelectContainer = document.getElementById("roleSelectContainer") as HTMLDivElement;
		if (this.data.roles && this.data.roles.length > 0) {
			const roleSelect = document.getElementById("roleSelect") as HTMLSelectElement;
			{
				const option = document.createElement("option");
				option.text = "None";
				roleSelect.add(option);
			}
			// add options to select element
			for (let i = 0; i < this.data.roles.length; i++) {
				const option = document.createElement("option");
				const apts = this.data.roles[i].aptitudes;
				const {apt, aptalt} = this.commonFunc2(apts);
				option.text = this.data.roles[i].role + " (" + apt.trim() + ")";
				option.setAttribute("data-content", this.data.roles[i].role + " " + aptalt);
				option.value = this.data.roles[i].role;
				if (this.configData.roleSelected && this.configData.roleSelected == this.data.roles[i].role) {
					option.selected = true;
				}
				roleSelect.add(option);
			}
			// add event listener to select element
			roleSelect.addEventListener("change", (event) => this.triggerRecalc(event));
		} else {
			roleSelectContainer.style.display = "none";
		}

		const aptitudeSelect = document.getElementById("aptitudeSelect") as HTMLSelectElement;
		for (let i = 0; i < this.data.optional.length; i++) {
			const aptitudeSelectOption = document.createElement("option");
			aptitudeSelectOption.text = this.data.optional[i];
			aptitudeSelectOption.value = this.data.optional[i];
			if (this.configData.extraAptitudesSelected && this.configData.extraAptitudesSelected.includes(this.data.optional[i])) {
				aptitudeSelectOption.selected = true;
			}
			aptitudeSelect.add(aptitudeSelectOption);
		}
		aptitudeSelect.addEventListener("change", (event) => this.triggerRecalc(event));

		const aptitudeWishlistSelect = document.getElementById("aptitudeWishlistSelect") as HTMLSelectElement;
		for (let i = 0; i < this.data.optional.length; i++) {
			const aptitudeWishlistSelectOption = document.createElement("option");
			aptitudeWishlistSelectOption.text = this.data.optional[i];
			aptitudeWishlistSelectOption.value = this.data.optional[i];
			if (this.configData.aptitudesWishlist && this.configData.aptitudesWishlist.includes(this.data.optional[i])) {
				aptitudeWishlistSelectOption.selected = true;
			}
			aptitudeWishlistSelect.add(aptitudeWishlistSelectOption);
		}
		aptitudeWishlistSelect.addEventListener("change", (event) => {
			this.logMatchingClasses(event, data);
			this.logMatchingWorlds(event, data);
			this.logMatchingBackgrounds(event, data);
			this.logMatchingRoles(event, data);
			this.styleAptitudeMatches(event, data);
		});

		const skip0Cb = document.getElementById("skip0Cb") as HTMLInputElement;
		skip0Cb.checked = this.configData.skip0CbChecked;
		skip0Cb.addEventListener("change", (event) => this.triggerRecalc(event));

		const characteristic_wishlist = document.getElementById("characteristic_wishlist") as HTMLTextAreaElement;
		characteristic_wishlist.value = this.configData.characteristic_wishlist;
		characteristic_wishlist.addEventListener("change", (event) => this.triggerRecalc(event));

		const skill_wishlist = document.getElementById("skill_wishlist") as HTMLTextAreaElement;
		skill_wishlist.value = this.configData.skill_wishlist;
		skill_wishlist.addEventListener("change", (event) => this.triggerRecalc(event));

		const wishlist = document.getElementById("wishlist") as HTMLTextAreaElement; // talent_wishlist
		wishlist.value = this.configData.wishlist;
		wishlist.addEventListener("change", (event) => this.triggerRecalc(event));

		const export_characteristic = document.getElementById("export_characteristic") as HTMLSelectElement;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		export_characteristic.addEventListener("click", (event) => this.copyToClipboardText("characteristic"));

		const export_skill = document.getElementById("export_skill") as HTMLSelectElement;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		export_skill.addEventListener("click", (event) => this.copyToClipboardText("skill"));

		const export_talent = document.getElementById("export_talent") as HTMLSelectElement;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		export_talent.addEventListener("click", (event) => this.copyToClipboardText("talent"));

		const export_characteristic_wishlist = document.getElementById("export_characteristic_wishlist") as HTMLSelectElement;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		export_characteristic_wishlist.addEventListener("click", (event) => this.copyToClipboardWishlist("characteristic", 2));

		const export_skill_wishlist = document.getElementById("export_skill_wishlist") as HTMLSelectElement;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		export_skill_wishlist.addEventListener("click", (event) => this.copyToClipboardWishlist("skill", 2));

		const export_talent_wishlist = document.getElementById("export_talent_wishlist") as HTMLSelectElement;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		export_talent_wishlist.addEventListener("click", (event) => this.copyToClipboardWishlist("talent", 3));

		const export_all = document.getElementById("export_all") as HTMLSelectElement;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		export_all.addEventListener("click", (event) => this.exportAllTableToExcelDef("characteristic", "skill", "talent"));

		const wishlist_clear = document.getElementById("wishlist_clear") as HTMLSelectElement;
		wishlist_clear.addEventListener("click", (event) => {
			wishlist.value = "";
			this.triggerRecalc(event);
		});

		const skill_wishlist_clear = document.getElementById("skill_wishlist_clear") as HTMLSelectElement;
		skill_wishlist_clear.addEventListener("click", (event) => {
			skill_wishlist.value = "";
			this.triggerRecalc(event);
		});

		const characteristic_wishlist_clear = document.getElementById("characteristic_wishlist_clear") as HTMLSelectElement;
		characteristic_wishlist_clear.addEventListener("click", (event) => {
			characteristic_wishlist.value = "";
			this.triggerRecalc(event);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		($('._selectpicker') as any).selectpicker();

		this.triggerRecalc(null);
		this.styleAptitudeMatches(null, data);
	}

	private buildFullTree() {
		this.data.talents.forEach(parentTalent => {
			const parentTalentName = parentTalent.talent.toLowerCase().trim();
			this.data.talents.forEach(otherTalent => {
				const otherTalentPrerequisites = otherTalent.prerequisites.toLowerCase();
				if (otherTalentPrerequisites.includes(parentTalentName)) {
					const parentTalentNode = this.fullTree.getOrCreate(parentTalent.talent);
					parentTalentNode.data = parentTalent;
					const otherTalentNode = this.fullTree.getOrCreate(otherTalent.talent);
					otherTalentNode.data = otherTalent;
					this.fullTree.linkParentToChild(parentTalentNode, otherTalentNode);
				}
			});
		});
		this.fullTree.buildTree(false);
	}

	scrollToAnchor(anchorId: string) {
		const $toEl = document.getElementById(anchorId) as HTMLElement;
		const $offset = $toEl.getBoundingClientRect().top + window.scrollY - 100;
		window.scrollTo({top: $offset, behavior: "auto"});
		const classList = ["animate__animated", "animate__faster", "animate__flash"];
		$toEl.classList.add(...classList);
		$toEl.addEventListener("animationend", () => $toEl.classList.remove(...classList));
	}

	private commonFunc2(apts: Aptitude[]) {
		let apt = "";
		let aptalt = "";
		for (let j = 0; j < apts.length; j++) {
			apt += apts[j];
			aptalt += "<span class='badge badge-pill badge-secondary " + apts[j].replace(" ", "_") + "'>" + apts[j] + "</span>";
			if (j < apts.length - 1) {
				apt += ", ";
			}
		}
		return {apt, aptalt};
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private triggerRecalc(event: Event | null) {
		//console.log("triggerRecalc");

		this.tree = new Tree();

		const wishlist = document.getElementById("wishlist") as HTMLTextAreaElement;
		this.configData.wishlist = wishlist.value;
		// split textarea content into array
		const wishlistArray = wishlist.value.split("\n");
		// remove empty elements from array
		for (let i = 0; i < wishlistArray.length; i++) {
			if (wishlistArray[i] === "") {
				wishlistArray.splice(i, 1);
				i--;
			}
		}
		// lowercase all elements in array
		for (let i = 0; i < wishlistArray.length; i++) {
			wishlistArray[i] = wishlistArray[i].toLowerCase().trim();
		}

		const skill_wishlist = document.getElementById("skill_wishlist") as HTMLTextAreaElement;
		this.configData.skill_wishlist = skill_wishlist.value;
		// split textarea content into array
		const skill_wishlistArray = skill_wishlist.value.split("\n");
		// remove empty elements from array
		for (let i = 0; i < skill_wishlistArray.length; i++) {
			if (skill_wishlistArray[i] === "") {
				skill_wishlistArray.splice(i, 1);
				i--;
			}
		}
		// lowercase all elements in array
		for (let i = 0; i < skill_wishlistArray.length; i++) {
			skill_wishlistArray[i] = skill_wishlistArray[i].toLowerCase().trim();
		}

		const characteristic_wishlist = document.getElementById("characteristic_wishlist") as HTMLTextAreaElement;
		this.configData.characteristic_wishlist = characteristic_wishlist.value;
		// split textarea content into array
		const characteristic_wishlistArray = characteristic_wishlist.value.split("\n");
		// remove empty elements from array
		for (let i = 0; i < characteristic_wishlistArray.length; i++) {
			if (characteristic_wishlistArray[i] === "") {
				characteristic_wishlistArray.splice(i, 1);
				i--;
			}
		}
		// lowercase all elements in array
		for (let i = 0; i < characteristic_wishlistArray.length; i++) {
			characteristic_wishlistArray[i] = characteristic_wishlistArray[i].toLowerCase().trim();
		}

		this.selectedAptitudes = [];

		const skip0Cb = document.getElementById("skip0Cb") as HTMLInputElement;
		this.configData.skip0CbChecked = skip0Cb.checked;
		const skip0CbChecked = skip0Cb.checked;

		this.selectedAptitudes.push(this.data.free);

		const duplicates: Aptitude[] = [];

		const classSelect = document.getElementById("classSelect") as HTMLSelectElement;
		if (classSelect.selectedIndex > 0) {
			const selectedClass = this.data.classes[classSelect.selectedIndex - 1];
			const classAptitudes = selectedClass.aptitudes;
			this.configData.classSelected = selectedClass.class;
			for (let i = 0; i < classAptitudes.length; i++) {
				//console.log("classSelect", classAptitudes[i]);
				if (this.selectedAptitudes.includes(classAptitudes[i])) {
					duplicates.push(classAptitudes[i]);
				} else {
					this.selectedAptitudes.push(classAptitudes[i]);
				}
			}
		} else {
			this.configData.classSelected = "";
		}

		const worldSelect = document.getElementById("worldSelect") as HTMLSelectElement;
		if (worldSelect.selectedIndex > 0) {
			const selectedWorld = this.data.worlds[worldSelect.selectedIndex - 1];
			const aptitude = selectedWorld.aptitude;
			this.configData.worldSelected = selectedWorld.world;
			//console.log("worldSelect", aptitude);
			if (this.selectedAptitudes.includes(aptitude)) {
				duplicates.push(aptitude);
			} else {
				this.selectedAptitudes.push(aptitude);
			}
		} else {
			this.configData.worldSelected = "";
		}

		const roleSelect = document.getElementById("roleSelect") as HTMLSelectElement;
		if (roleSelect.selectedIndex > 0) {
			const roleSelected = this.data.roles[roleSelect.selectedIndex - 1];
			const aptitudes = roleSelected.aptitudes;
			this.configData.roleSelected = roleSelected.role;
			for (let i = 0; i < aptitudes.length; i++) {
				//console.log("roleSelect", aptitudes[i]);
				if (this.selectedAptitudes.includes(aptitudes[i])) {
					duplicates.push(aptitudes[i]);
				} else {
					this.selectedAptitudes.push(aptitudes[i]);
				}
			}
		} else {
			this.configData.roleSelected = "";
		}

		const backgroundSelect = document.getElementById("backgroundSelect") as HTMLSelectElement;
		if (backgroundSelect.selectedIndex > 0) {
			const backgroundSelected = this.data.backgrounds[backgroundSelect.selectedIndex - 1];
			const aptitude = backgroundSelected.aptitude;
			this.configData.backgroundSelected = backgroundSelected.background;
			//console.log("backgroundSelect", aptitude);
			if (this.selectedAptitudes.includes(aptitude)) {
				duplicates.push(aptitude);
			} else {
				this.selectedAptitudes.push(aptitude);
			}
		} else {
			this.configData.backgroundSelected = "";
		}

		const aptitudeSelect = document.getElementById("aptitudeSelect") as HTMLSelectElement;
		this.configData.extraAptitudesSelected = [];
		if (aptitudeSelect.selectedIndex >= 0) {
			const selectedOptions = aptitudeSelect.selectedOptions;
			for (let z = 0; z < selectedOptions.length; z++) {
				const aptitude = this.data.optional[selectedOptions[z].index] as Aptitude;
				this.configData.extraAptitudesSelected.push(aptitude);
				//console.log("aptitudeSelect", aptitude);
				if (this.selectedAptitudes.includes(aptitude)) {
					duplicates.push(aptitude);
				} else {
					this.selectedAptitudes.push(aptitude);
				}
			}
		}

		const selectedAptitudes = document.getElementById("selectedAptitudes") as HTMLDivElement;
		selectedAptitudes.innerHTML = "";
		for (let i = 0; i < this.selectedAptitudes.length; i++) {
			selectedAptitudes.innerHTML += "<span class='badge badge-pill badge-secondary " + this.selectedAptitudes[i].replace(" ", "_") + "'>" + this.selectedAptitudes[i] + "</span>&nbsp;";
		}
		for (let i = 0; i < duplicates.length; i++) {
			selectedAptitudes.innerHTML += "<span class='badge badge-pill badge-danger'>" + duplicates[i] + " (duplicate)" + "</span>";
		}

		const characteristicTableDiv = document.getElementById("characteristic") as HTMLDivElement;
		characteristicTableDiv.innerHTML = "";

		const sortedCharacteristic = this.data.characteristic.sort((a, b) => {
			let amatches = 0;
			if (this.selectedAptitudes.includes(a.name)) amatches++;
			if (this.selectedAptitudes.includes(a.aptitude)) amatches++;
			let bmatches = 0;
			if (this.selectedAptitudes.includes(b.name)) bmatches++;
			if (this.selectedAptitudes.includes(b.aptitude)) bmatches++;
			return bmatches - amatches;
		});
		for (let i = 0; i < sortedCharacteristic.length; i++) {
			if (!(characteristic_wishlistArray.length == 0 || characteristic_wishlistArray.includes(sortedCharacteristic[i].name.toLowerCase().trim()))) {
				continue;
			}

			const costDiv = document.createElement("div");
			const matchesDiv = document.createElement("div");

			let skip = false;
			for (let j = 0; j < this.data.costs.length; j++) {
				if (this.data.costs[j].type === "characteristic") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if (this.selectedAptitudes.includes(sortedCharacteristic[i].name)) matches++;
					if (this.selectedAptitudes.includes(sortedCharacteristic[i].aptitude)) matches++;
					skip = this.calcSkipAndSetMatchCount(costDiv, j, matches, matchesDiv, skip0CbChecked, skip);
				}
			}
			if (skip) continue;

			const rootDiv = document.createElement("div");
			characteristicTableDiv.appendChild(rootDiv);
			rootDiv.appendChild(costDiv);
			rootDiv.appendChild(matchesDiv);

			const characteristicName = document.createElement("div");
			characteristicName.innerHTML = sortedCharacteristic[i].name;
			if (this.selectedAptitudes.includes(sortedCharacteristic[i].name)) characteristicName.classList.add("m2");
			rootDiv.appendChild(characteristicName);

			const characteristicAptitude = document.createElement("div");
			characteristicAptitude.innerHTML = sortedCharacteristic[i].aptitude;
			if (this.selectedAptitudes.includes(sortedCharacteristic[i].aptitude)) characteristicAptitude.classList.add("m2");
			rootDiv.appendChild(characteristicAptitude);
		}

		const talentTableDiv = document.getElementById("talent") as HTMLDivElement;
		talentTableDiv.innerHTML = "";
		const sortedTalents = this.data.talents.sort((a, b) => {
			let amatches = 0;
			if (this.selectedAptitudes.includes(a.apt1)) amatches++;
			if (this.selectedAptitudes.includes(a.apt2)) amatches++;
			let bmatches = 0;
			if (this.selectedAptitudes.includes(b.apt1)) bmatches++;
			if (this.selectedAptitudes.includes(b.apt2)) bmatches++;
			if (amatches === bmatches) return a.tier - b.tier; // lower tier on top
			return bmatches - amatches; // more matches on top
		});
		for (let i = 0; i < sortedTalents.length; i++) {
			if (!(wishlistArray.length == 0 || wishlistArray.includes(sortedTalents[i].talent.toLowerCase().trim()))) {
				continue;
			}

			const costDiv = document.createElement("div");
			costDiv.setAttribute("data-export", "true");

			const matchesDiv = document.createElement("div");
			matchesDiv.setAttribute("data-export", "true");

			let skip = false;
			for (let j = 0; j < this.data.costs.length; j++) {
				if (this.data.costs[j].type === "talent") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if (this.selectedAptitudes.includes(sortedTalents[i].apt1)) matches++;
					if (this.selectedAptitudes.includes(sortedTalents[i].apt2)) matches++;
					costDiv.innerHTML = "" + this.data.costs[j].cost[2 - matches][sortedTalents[i].tier - 1];
					costDiv.classList.add("m" + matches);
					matchesDiv.innerHTML = "" + matches;
					matchesDiv.classList.add("m" + matches);
					if (matches === 0 && skip0CbChecked) skip = true;
				}
			}
			if (skip) continue;

			const recordDiv = document.createElement("div");
			talentTableDiv.appendChild(recordDiv);
			recordDiv.appendChild(costDiv)
			recordDiv.appendChild(matchesDiv);

			const talentTierDiv = document.createElement("div");
			talentTierDiv.setAttribute("data-export", "true");
			talentTierDiv.innerHTML = "T" + sortedTalents[i].tier;
			recordDiv.appendChild(talentTierDiv);

			const talentNameDiv = document.createElement("div");
			talentNameDiv.setAttribute("data-export", "true");
			talentNameDiv.innerHTML = sortedTalents[i].talent;
			recordDiv.appendChild(talentNameDiv);
			talentNameDiv.title = sortedTalents[i].benefit;
			talentNameDiv.id = sortedTalents[i].talent;
			if (sortedTalents[i].ref) talentNameDiv.title += " ( " + sortedTalents[i].ref.replace("PG", "").trim() + " )";

			const talentApt1Div = document.createElement("div");
			talentApt1Div.setAttribute("data-export", "true");
			talentApt1Div.innerHTML = sortedTalents[i].apt1;
			recordDiv.appendChild(talentApt1Div);
			if (this.selectedAptitudes.includes(sortedTalents[i].apt1)) talentApt1Div.classList.add("m2");

			const talentApt2Div = document.createElement("div");
			talentApt2Div.setAttribute("data-export", "true");
			talentApt2Div.innerHTML = sortedTalents[i].apt2;
			recordDiv.appendChild(talentApt2Div);
			if (this.selectedAptitudes.includes(sortedTalents[i].apt2)) talentApt2Div.classList.add("m2");

			const talentPrerequisitesDiv = document.createElement("div");
			talentPrerequisitesDiv.setAttribute("data-export", sortedTalents[i].prerequisites);
			const hasTree = this.replacePrerequisites(sortedTalents[i], talentPrerequisitesDiv, sortedTalents[i].prerequisites);
			recordDiv.appendChild(talentPrerequisitesDiv);

			const talentDescriptionDiv = document.createElement("div");
			talentDescriptionDiv.setAttribute("data-export", "true");
			talentDescriptionDiv.innerHTML = sortedTalents[i].benefit;
			talentDescriptionDiv.style.display = "none";
			recordDiv.appendChild(talentDescriptionDiv);

			const actionDiv = document.createElement("div");
			actionDiv.setAttribute("data-export", "false");
			const nodeLookup = this.fullTree.get(sortedTalents[i].talent);
			const allPrerequisites = [] as string[];
			if (nodeLookup && nodeLookup.parents.length > 0) {
				this.fullTree.iterateParents(nodeLookup).forEach((parent) => {
					if (parent.data && parent.data.prerequisites && '—' != parent.data.prerequisites && '-' != parent.data.prerequisites) {
						const splitted = this.splitPrerequisites(parent.data.prerequisites);
						for (let i = 0; i < splitted.length; i++) {
							allPrerequisites.push(splitted[i]);
						}
					}
				});
				{
					const splitted = this.splitPrerequisites(sortedTalents[i].prerequisites);
					for (let i = 0; i < splitted.length; i++) {
						allPrerequisites.push(splitted[i]);
					}
				}
			}
			let randomId = null;
			if (allPrerequisites.length > 0) {
				const characteristicPicks = [] as CharacteristicPick[];
				const skillPicks = [] as SkillPick[];
				const collapsedPrerequisites = [] as string[];
				allPrerequisites.forEach((allPrerequisite) => {
					let canReplace = false;
					this.data.characteristic.forEach((characteristic) => {
						// regular expression, allPrerequisite starts with characteristic name folled by numer to extra number
						const regex = new RegExp("^" + characteristic.name + " (\\d+)$", "i");
						if (regex.test(allPrerequisite)) {
							const amount = parseInt(allPrerequisite.match(regex)![1]);
							const matchPicks = characteristicPicks.filter((characteristicPick) => characteristicPick.characteristic.name === characteristic.name);
							if (matchPicks.length > 0) {
								const existingPick = matchPicks[0]; // should always be 1 element or 0
								if (existingPick.amount < amount) existingPick.amount = amount;
							} else {
								characteristicPicks.push({characteristic, amount});
							}
							canReplace = true;
						}
					});
					this.data.skills.forEach((skill) => {
						// regex skillName (choice) +number
						const regex2 = new RegExp("^" + skill.name + " \\((.+)\\) \\+(\\d+)$", "i");
						// regular expression, allPrerequisite starts with characteristic name folled by numer to extra number
						const regex1 = new RegExp("^" + skill.name + " \\+(\\d+)$", "i");
						let amount: number | null = null;
						let choice: string | null = null;
						if (regex2.test(allPrerequisite)) {
							amount = parseInt(allPrerequisite.match(regex2)![2]);
							choice = allPrerequisite.match(regex2)![1];
							canReplace = true;
						} else if (regex1.test(allPrerequisite)) {
							amount = parseInt(allPrerequisite.match(regex1)![1]);
							canReplace = true;
						}
						if (amount != null) {
							const matchPicks = skillPicks.filter((skillPick) => skillPick.skill.name === skill.name && skillPick.choice === choice);
							if (matchPicks.length > 0) {
								const existingPick = matchPicks[0]; // should always be 1 element or 0
								if (existingPick.amount < amount) existingPick.amount = amount;
							} else {
								skillPicks.push({skill, choice, amount});
							}
						}
					});
					if (!canReplace) {
						const toAdd = `${allPrerequisite}`;
						if (collapsedPrerequisites.indexOf(toAdd) === -1) collapsedPrerequisites.push(toAdd);
					}
				});
				collapsedPrerequisites.sort((a, b) => a.localeCompare(b));
				characteristicPicks.sort((a, b) => a.characteristic.name.localeCompare(b.characteristic.name)).forEach((characteristicPick) => {
					collapsedPrerequisites.push(`<i>Char</i>: ${characteristicPick.characteristic.name} ${characteristicPick.amount}`);
				});
				skillPicks.sort((a, b) => a.skill.name.localeCompare(b.skill.name)).forEach((skillPick) => {
					if (skillPick.choice) {
						collapsedPrerequisites.push(`<i>Skill</i>: ${skillPick.skill.name} (${skillPick.choice}) +${skillPick.amount}`);
					} else {
						collapsedPrerequisites.push(`<i>Skill</i>: ${skillPick.skill.name} ${skillPick.amount}`);
					}
				});
				let strPrerequisites = "<b>All Prerequisites</b>:<br><ul class='tiny-ul'>";
				for (let i = 0; i < collapsedPrerequisites.length; i++) {
					strPrerequisites += "<li>" + collapsedPrerequisites[i] + "</li>";
				}
				strPrerequisites += "</ul>";
				randomId = this.randomStr(10);
				const pop = `
				<button id="${randomId}" type="button" class="unstyled-button" data-container="body" data-toggle="popover" data-placement="left" data-content="${strPrerequisites}">
					<i class='icon-as-button fa-regular fa-eye'></i>
				</button>
				`;
				if (strPrerequisites !== "") actionDiv.innerHTML = pop;
			}
			recordDiv.appendChild(actionDiv);
			if (randomId != null) ($('#' + randomId) as any).popover({trigger: 'focus', html: true});
		}

		// iterate over array this.data.skills
		const skillTableDiv = document.getElementById("skill") as HTMLDivElement;
		skillTableDiv.innerHTML = "";
		const sortedSkills = this.data.skills.sort((a, b) => {
			let amatches = 0;
			if (this.selectedAptitudes.includes(a.aptitudes[0])) amatches++;
			if (this.selectedAptitudes.includes(a.aptitudes[1])) amatches++;
			let bmatches = 0;
			if (this.selectedAptitudes.includes(b.aptitudes[0])) bmatches++;
			if (this.selectedAptitudes.includes(b.aptitudes[1])) bmatches++;
			return bmatches - amatches;
		});
		for (let i = 0; i < sortedSkills.length; i++) {
			if (!(skill_wishlistArray.length == 0 || skill_wishlistArray.includes(sortedSkills[i].name.toLowerCase().trim()))) {
				continue;
			}
			const costDiv = document.createElement("div");
			const matchesDiv = document.createElement("div");
			let skip = false;
			for (let j = 0; j < this.data.costs.length; j++) {
				if (this.data.costs[j].type === "skill") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if (this.selectedAptitudes.includes(sortedSkills[i].aptitudes[0])) matches++;
					if (this.selectedAptitudes.includes(sortedSkills[i].aptitudes[1])) matches++;
					skip = this.calcSkipAndSetMatchCount(costDiv, j, matches, matchesDiv, skip0CbChecked, skip);
				}
			}
			if (skip) continue;

			const rootDiv = document.createElement("div");
			skillTableDiv.appendChild(rootDiv);
			rootDiv.appendChild(costDiv);
			rootDiv.appendChild(matchesDiv);

			const skillName = document.createElement("div");
			skillName.innerHTML = sortedSkills[i].name;
			rootDiv.appendChild(skillName);
			for (let j = 0; j < sortedSkills[i].aptitudes.length; j++) {
				const skillApt = document.createElement("div");
				skillApt.innerHTML = sortedSkills[i].aptitudes[j];
				if (this.selectedAptitudes.includes(sortedSkills[i].aptitudes[j])) {
					skillApt.classList.add("m2");
				}
				rootDiv.appendChild(skillApt);
			}
		}

		this.buildSelectedTree();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		($('[title]:not(.dropdown-toggle)') as any).tooltip();

		this.save();
	}

	private buildSelectedTree() {
		const treeToShow = this.tree;

		treeToShow.buildTree(true);

		function treeToData(node: Node, parentNodeData: any) {
			node.children.forEach((child) => {
				const childData = {name: child.name, parent: node.name, children: [], data: child.data};
				parentNodeData.children.push(childData);
				treeToData(child, childData);
			});
		}

		const treeDataRootNode = {name: treeToShow.rootNode.name, parent: null, children: []};
		treeToData(treeToShow.rootNode, treeDataRootNode);
		//console.log("treeDataRootNode", JSON.stringify(treeDataRootNode, null, "\t"));
		drawChart("selectedTree", treeDataRootNode, treeToShow.nodeCount);
	}

	private splitPrerequisites(prerequisites: string): string[] {
		return prerequisites.split(/,(?![^()]*\))/).map((each) => each.trim());
	}

	private replacePrerequisites(talent: W40KTalent, talentPrerequisitesDiv: HTMLDivElement, str: string) {
		if ('—' == str || '-' == str) {
			const spanEl = document.createElement("span");
			spanEl.innerHTML = "—";
			talentPrerequisitesDiv.appendChild(spanEl);
			return false;
		}
		const listEl = document.createElement("ul");
		let hasTree = false;
		// split string by comma but not comma inside parenthesis
		// https://stackoverflow.com/questions/11456850/split-a-string-by-commas-but-ignore-commas-within-double-quotes-using-javascript
		// eslint-disable-next-line no-useless-escape
		const parts = this.splitPrerequisites(str);
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i].trim();
			const listItemTag = document.createElement("li");
			const partLC = part.toLowerCase();
			const rangesToReplace: {
				from: number,
				to: number,
				talent: W40KTalent
			}[] = [];
			const talentsReplaced: string[] = [];
			this.data.talents.forEach((eachTalent) => {
				const loc = partLC.indexOf(eachTalent.talent.toLowerCase());
				if (loc >= 0 && !talentsReplaced.includes(eachTalent.talent)) {
					talentsReplaced.push(eachTalent.talent);
					rangesToReplace.push({from: loc, to: eachTalent.talent.length, talent: eachTalent});
					const parent = this.tree.getOrCreate(eachTalent.talent);
					parent.data = eachTalent;
					const child = this.tree.getOrCreate(talent.talent);
					child.data = talent;
					this.tree.linkParentToChild(parent, child);
				}
			});
			if (rangesToReplace.length > 0) {
				rangesToReplace.sort((a, b) => a.from - b.from);
				let loc = 0;
				while (loc < part.length) {
					if (rangesToReplace.length > 0 && rangesToReplace[0].from == loc) {
						const spanEl = document.createElement("span");
						spanEl.classList.add("jump-to-anchor");
						spanEl.setAttribute("title", rangesToReplace[0].talent.benefit);
						const talentName = rangesToReplace[0].talent.talent;
						spanEl.innerText = talentName;
						spanEl.setAttribute("data-talent", talentName);
						spanEl.onclick = () => this.scrollToAnchor(talentName);
						listItemTag.appendChild(spanEl);
						loc += rangesToReplace[0].to;
						rangesToReplace.shift();
						hasTree = true;
					} else if (rangesToReplace.length > 0) {
						const spanEl = document.createElement("span");
						spanEl.innerText = part.substring(loc, rangesToReplace[0].from);
						listItemTag.appendChild(spanEl);
						loc = rangesToReplace[0].from;
					} else {
						const spanEl = document.createElement("span");
						spanEl.innerText = part.substring(loc);
						listItemTag.appendChild(spanEl);
						loc = part.length;
					}
				}
			} else {
				listItemTag.innerText = part;
			}
			/*
			this.data.talents.forEach((t) => {
				let title = t.benefit;
				if (t.ref) title += " ( " + t.ref.replace("PG", "").trim() + " )";
				// https://css-tricks.com/snippets/jquery/smooth-scrolling/
				// https://animate.style/
				// $toEl.scrollIntoView({behavior:"smooth"})
				// window.scrollTo({top:$toEl.getBoundingClientRect().top+window.pageYOffset,behavior:"smooth"})
				const spanEl = document.createElement("span");
				spanEl.classList.add("jump-to-anchor");
				//spanEl.setAttribute("href", "#" + t.talent);
				spanEl.setAttribute("title", title);
				spanEl.innerText = t.talent;
				spanEl.onclick = () => this.scrollToAnchor(t.talent);
				console.log(spanEl.outerHTML);
				p = p.replace(t.talent, spanEl.outerHTML);
				//p = p.replace(t.talent, `<span onclick='this.scrollToAnchor("${t.talent}")' class='jump-to-anchor' _href='#${t.talent}' title='${title}'>${t.talent}</span>`);
			});
			*/
			listEl.appendChild(listItemTag);
		}
		talentPrerequisitesDiv.appendChild(listEl);
		return hasTree;
	}

	private save() {
		const configDataString = JSON.stringify(this.configData);
		console.log("save", "w40k-data-config-" + this.source, configDataString);
		localStorage.setItem("w40k-data-config-" + this.source, configDataString);

		// https://github.com/rotemdan/lzutf8.js/
		// https://www.digitalocean.com/community/tutorials/how-to-encode-and-decode-strings-with-base64-in-javascript
		// https://gist.github.com/loilo/92220c23567d6ed085a28f2c3e84e311#file-base64-mjs

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		//const compressorLZUTF8 = (LZUTF8 as any);
		//const tmp1 = compressorLZUTF8.compress(configDataString, {outputEncoding: "ByteArray"});
		//const tmp2 = compressorLZUTF8.decompress(tmp1, {inputEncoding: "ByteArray"});
		//const encodedStringBtoA = btoa(tmp1);
		//const decodedStringAtoB = atob(encodedStringBtoA);
		//const compressed = compressorLZUTF8.compress(configDataString, {outputEncoding: "Base64"});
		//const decompressed = compressorLZUTF8.decompress(compressed, {inputEncoding: "Base64"});

		const compressedSerializedData = compressUrlSafe(configDataString);
		//const deserializedData = decompressUrlSafe(compressedSerializedData);
		// replace / followed by newline in deserializedData by newline
		//const fixedDeserializedData = deserializedData.replace(/\//g, /\n/g);
		//console.log(configDataString.length,compressedSerializedData.length,compressedSerializedData);
		//console.log(JSON.parse(deserializedData));

		const encoded = encodeURIComponent(configDataString);
		//console.log(configDataString.length, encoded.length, compressedSerializedData.length);
		const saveLink = document.getElementById("saveLink") as HTMLLinkElement;
		saveLink.href = "?source=" + this.source + "&cfg=" + encoded;
		const saveLinkAlt = document.getElementById("saveLinkAlt") as HTMLLinkElement;
		saveLinkAlt.href = "?source=" + this.source + "&cfg=" + compressedSerializedData;
	}

	private calcSkipAndSetMatchCount(costDiv: HTMLDivElement, j: number, matches: number, matchesDiv: HTMLDivElement, skip0CbChecked: boolean, skip: boolean) {
		costDiv.innerHTML = "" + this.data.costs[j].cost[2 - matches][0];
		costDiv.classList.add("m" + matches);
		matchesDiv.innerHTML = "" + matches;
		matchesDiv.classList.add("m" + matches);
		if (matches === 0 && skip0CbChecked) skip = true;
		return skip;
	}

	private exportAllTableToExcelDef(divId1: string, divId2: string, divId3: string) {
		document.getElementById("exportTableToExcelDef")?.remove();
		const tableHtml1 = this.exportDivToTable(divId1);
		const tableHtml2 = this.exportDivToTable(divId2);
		const tableHtml3 = this.exportDivToTable(divId3);
		if (!tableHtml1) return;
		if (!tableHtml2) return;
		if (!tableHtml3) return;
		const d = document.createElement("div");
		d.innerHTML = "<table>"
			+ "<tr><td>Characteristics</td></tr>"
			+ "\t<tr>\n"
			+ "\t\t<td>cost</td>\n"
			+ "\t\t<td>m</td>\n"
			+ "\t\t<td>skill</td>\n"
			+ "\t\t<td>aptitude</td>\n"
			+ "\t</tr>"
			+ tableHtml1.replace("<table>", "").replace("</table>", "")
			+ "<tr><td> </td></tr>"
			+ "<tr><td> </td></tr>"
			+ "<tr><td>Skills</td></tr>"
			+ "\t<tr>\n"
			+ "\t\t<td>cost</td>\n"
			+ "\t\t<td>m</td>\n"
			+ "\t\t<td>characteristic</td>\n"
			+ "\t\t<td>aptitude</td>\n"
			+ "\t\t<td>aptitude</td>\n"
			+ "\t</tr>"
			+ tableHtml2.replace("<table>", "").replace("</table>", "")
			+ "<tr><td> </td></tr>"
			+ "<tr><td> </td></tr>"
			+ "<tr><td>Talents</td></tr>"
			+ "\t<tr>\n"
			+ "\t\t<td>cost</td>\n"
			+ "\t\t<td>m</td>\n"
			+ "\t\t<td>tier</td>\n"
			+ "\t\t<td>talent</td>\n"
			+ "\t\t<td>aptitude</td>\n"
			+ "\t\t<td>aptitude</td>\n"
			+ "\t\t<td>requirement</td>\n"
			+ "\t\t<td>description</td>\n"
			+ "\t</tr>"
			+ tableHtml3.replace("<table>", "").replace("</table>", "")
			+ "</table>";
		d.style.display = "none";
		d.id = "exportTableToExcelDef";
		document.body.appendChild(d);
		this.exportTableToExcel("exportTableToExcelDef", "all");
	}

	private exportTableToExcelDef(divId: string) {
		const dummyElementId = "exportTableToExcelDef_";
		document.getElementById(dummyElementId)?.remove();
		const tableHtml = this.exportDivToTable(divId);
		if (!tableHtml) return;
		const divElement = document.createElement("div");
		divElement.innerHTML = tableHtml;
		divElement.style.display = "none";
		divElement.id = dummyElementId;
		document.body.appendChild(divElement);
		this.exportTableToExcel(divElement.id, divId);
	}

	private exportDivToTable(divId: string, plain = false) {
		const divElement = document.getElementById(divId);
		if (!divElement) return;
		// iterate over divs inside div
		let tab = "";
		if (!plain) tab += "<table>";
		for (let i = 0; i < divElement.children.length; i++) {
			if (!plain) tab += "<tr>";
			const r = divElement.children[i] as HTMLDivElement;
			for (let j = 0; j < r.children.length; j++) {
				const c = r.children[j] as HTMLDivElement;
				const dataExport = c.getAttribute("data-export") as string;
				if (dataExport === "false") continue;
				if (!plain) tab += "<td>";
				tab += (dataExport === "true" || dataExport === null) ? c.innerHTML : dataExport;
				if (!plain) tab += "</td>"; else tab += "\t";
			}
			if (!plain) tab += "</tr>"; else tab += "\n";
		}
		if (!plain) tab += "</table>";
		return tab;
	}

	// https://www.codexworld.com/export-html-table-data-to-excel-using-javascript/
	private exportTableToExcel(tableID: string, filename = '') {
		const dataType = 'application/vnd.ms-excel';
		const tableSelect = document.getElementById(tableID);
		if (!tableSelect) return;
		const tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
		filename = filename ? filename + '.html.xls' : 'w40k.html.xls';
		document.getElementById("downloadLinkId")?.remove();
		const downloadLink = document.createElement("a");
		downloadLink.id = "downloadLinkId";
		document.body.appendChild(downloadLink);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ((navigator as any).msSaveOrOpenBlob) {
			const blob = new Blob(['\ufeff', tableHTML], {
				type: dataType
			});
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(navigator as any).msSaveOrOpenBlob(blob, filename);
		} else {
			// Create a link to the file
			downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
			// Setting the file name
			downloadLink.download = filename;
			//triggering the function
			downloadLink.click();
		}
	}

	private copyToClipboardText(tableDivId: string) {
		const tableHtml = this.exportDivToTable(tableDivId, true);
		if (!tableHtml) return;
		const dummyElPrefix = "1_textarea_copy_";
		document.getElementById(dummyElPrefix + tableDivId)?.remove();
		const textAreaElement: HTMLTextAreaElement = document.createElement("textarea");
		textAreaElement.innerHTML = tableHtml;
		textAreaElement.style.display = "none";
		textAreaElement.id = dummyElPrefix + tableDivId;
		document.body.appendChild(textAreaElement);
		textAreaElement.select();
		textAreaElement.setSelectionRange(0, 99999); // For mobile devices
		navigator.clipboard.writeText(textAreaElement.value);
	}

	private copyToClipboardWishlist(id: string, colIndex: number) {
		const divElement = document.getElementById(id);
		if (!divElement) return;
		let tableHtml = "";
		for (let i = 0; i < divElement.children.length; i++) {
			const childLevel1 = divElement.children[i] as HTMLDivElement;
			const childLevel2 = childLevel1.children[1] as HTMLInputElement;
			const retain = childLevel2.innerHTML == "0" || childLevel2.innerHTML == "1";
			const retailChildLevel = childLevel1.children[colIndex] as HTMLInputElement;
			if (retain) tableHtml += retailChildLevel.innerHTML + "\n";
		}
		const textAreaElementId = "2_textarea_copy_" + id;
		document.getElementById(textAreaElementId)?.remove();
		const textAreaElement: HTMLTextAreaElement = document.createElement("textarea");
		textAreaElement.innerHTML = tableHtml;
		textAreaElement.style.display = "none";
		textAreaElement.id = textAreaElementId;
		document.body.appendChild(textAreaElement);
		textAreaElement.select();
		textAreaElement.setSelectionRange(0, 99999); // For mobile devices
		navigator.clipboard.writeText(textAreaElement.value).then(() => {
			// completed
		});
	}

	/*aptitude(key: string): Aptitude | null {
		for (const value in Aptitude) {
			if (key.replace("_", "").replace(" ", "") == value.replace("_", "").replace(" ", "")) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				return Aptitude[value];
			}
		}
		return null;
	}*/

	private logMatchingWorlds(event: Event, data: W40KData) {
		if (!data.worlds || data.worlds.length == 0) return;
		const aptitudeSelect = document.getElementById("aptitudeWishlistSelect") as HTMLSelectElement;
		if (aptitudeSelect.selectedIndex >= 0) {
			console.log("logMatchingWorlds");
			const selectedOptions = aptitudeSelect.selectedOptions;
			const aptitudes: Aptitude[] = [];
			const weightedWorlds: WeightedWorld[] = [];
			for (let z = 0; z < selectedOptions.length; z++) {
				aptitudes.push(this.data.optional[selectedOptions[z].index]);
			}
			console.log(aptitudes);
			for (let i = 0; i < data.worlds.length; i++) {
				let matches = 0;
				for (let k = 0; k < aptitudes.length; k++) {
					if (data.worlds[i].aptitude == aptitudes[k]) matches++;
				}
				weightedWorlds.push(new WeightedWorld(data.worlds[i], matches));
			}
			weightedWorlds.sort((a, b) => b.matches - a.matches);
			for (let i = 0; i < weightedWorlds.length; i++) {
				console.log(weightedWorlds[i].world?.world, weightedWorlds[i].matches, weightedWorlds[i].world?.aptitude);
			}
		}
	}

	private logMatchingBackgrounds(event: Event, data: W40KData) {
		if (!data.backgrounds || data.backgrounds.length == 0) return;
		const aptitudeSelect = document.getElementById("aptitudeWishlistSelect") as HTMLSelectElement;
		if (aptitudeSelect.selectedIndex >= 0) {
			console.log("logMatchingBackgrounds");
			const selectedOptions = aptitudeSelect.selectedOptions;
			const aptitudes: Aptitude[] = [];
			const weightedBackgrounds: WeightedBackground[] = [];
			for (let z = 0; z < selectedOptions.length; z++) {
				aptitudes.push(this.data.optional[selectedOptions[z].index]);
			}
			console.log(aptitudes);
			for (let i = 0; i < data.backgrounds.length; i++) {
				let matches = 0;
				for (let k = 0; k < aptitudes.length; k++) {
					if (data.backgrounds[i].aptitude == aptitudes[k]) matches++;
				}
				weightedBackgrounds.push(new WeightedBackground(data.backgrounds[i], matches));
			}
			weightedBackgrounds.sort((a, b) => b.matches - a.matches);
			for (let i = 0; i < weightedBackgrounds.length; i++) {
				console.log(weightedBackgrounds[i].background?.background, weightedBackgrounds[i].matches, weightedBackgrounds[i].background?.aptitude);
			}
		}
	}

	private logMatchingRoles(event: Event, data: W40KData) {
		if (!data.roles || data.roles.length == 0) return;
		const aptitudeSelect = document.getElementById("aptitudeWishlistSelect") as HTMLSelectElement;
		if (aptitudeSelect.selectedIndex >= 0) {
			console.log("logMatchingRoles");
			const selectedOptions = aptitudeSelect.selectedOptions;
			const aptitudes: Aptitude[] = [];
			const weightedRoles: WeightedRole[] = [];
			for (let z = 0; z < selectedOptions.length; z++) {
				aptitudes.push(this.data.optional[selectedOptions[z].index]);
			}
			console.log(aptitudes);
			for (let i = 0; i < data.roles.length; i++) {
				let matches = 0;
				for (let j = 0; j < data.roles[i].aptitudes.length; j++) {
					for (let k = 0; k < aptitudes.length; k++) {
						if (data.roles[i].aptitudes[j] == aptitudes[k]) matches++;
					}
				}
				weightedRoles.push(new WeightedRole(data.roles[i], matches));
			}
			weightedRoles.sort((a, b) => b.matches - a.matches);
			for (let i = 0; i < weightedRoles.length; i++) {
				console.log(weightedRoles[i].role?.role, weightedRoles[i].matches, weightedRoles[i].role?.aptitudes);
			}
		}
	}

	private logMatchingClasses(event: Event, data: W40KData) {
		if (!data.classes || data.classes.length == 0) return;
		const aptitudeSelect = document.getElementById("aptitudeWishlistSelect") as HTMLSelectElement;
		if (aptitudeSelect.selectedIndex >= 0) {
			console.log("logMatchingClasses");
			const selectedOptions = aptitudeSelect.selectedOptions;
			const aptitudes: Aptitude[] = [];
			const weightedClasses: WeightedClass[] = [];
			for (let z = 0; z < selectedOptions.length; z++) {
				aptitudes.push(this.data.optional[selectedOptions[z].index]);
			}
			console.log(aptitudes);
			for (let i = 0; i < data.classes.length; i++) {
				let matches = 0;
				for (let j = 0; j < data.classes[i].aptitudes.length; j++) {
					for (let k = 0; k < aptitudes.length; k++) {
						if (data.classes[i].aptitudes[j] == aptitudes[k]) matches++;
					}
				}
				weightedClasses.push(new WeightedClass(data.classes[i], matches));
			}
			weightedClasses.sort((a, b) => b.matches - a.matches);
			for (let i = 0; i < weightedClasses.length; i++) {
				console.log(weightedClasses[i].class?.class, weightedClasses[i].matches, weightedClasses[i].class?.aptitudes);
			}
		}
	}

	private styleAptitudeMatches(event: Event | null, data: W40KData) {
		for (let z = 0; z < data.optional.length; z++) {
			const aptitude = data.optional[z];
			let style = document.getElementById("style-" + aptitude.replace(" ", "_")) as HTMLStyleElement;
			if (style) {
				style.disabled = true;
			} else {
				style = document.createElement("style");
				style.id = "style-" + aptitude.replace(" ", "_");
				style.innerHTML = ".badge.badge-pill.badge-secondary." + aptitude.replace(" ", "_") + "{background-color:#1cc88a !important}";
				document.body.appendChild(style);
				style.disabled = true;
				//console.log(style);
			}
		}
		const aptitudeSelect = document.getElementById("aptitudeWishlistSelect") as HTMLSelectElement;
		this.configData.aptitudesWishlist = [];
		if (aptitudeSelect.selectedIndex >= 0) {
			const selectedOptions = aptitudeSelect.selectedOptions;
			for (let z = 0; z < selectedOptions.length; z++) {
				const aptitude = this.data.optional[selectedOptions[z].index] as Aptitude;
				this.configData.aptitudesWishlist.push(aptitude);
				const style = document.getElementById("style-" + aptitude.replace(" ", "_")) as HTMLStyleElement;
				style.disabled = false;
				//console.log(style);
			}
		}
		this.save();
	}

	public randomStr(length: number) {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < length) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
			counter += 1;
		}
		return result;
	}
}
