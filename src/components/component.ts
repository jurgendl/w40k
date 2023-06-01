import $ from "jquery";

export enum Aptitude {
	// common
	General = "General",
	// standard
	Weapon_Skill = "Weapon Skill",
	Ballistic_Skill = "Ballistic Skill",
	Strength = "Strength",
	Toughness = "Toughness",
	Agility = "Agility",
	Intelligence = "Intelligence",
	Perception = "Perception",
	Willpower = "Willpower",
	Fellowship = "Fellowship",
	// special
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
	optional: Aptitude;
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
	benefit: string
}

interface W40KSkill {
	name: string;
	aptitudes: Aptitude[];
}

interface W40KClass {
	class: string;
	aptitudes: Aptitude[];
}

class WeightedClass {
	class: W40KClass | null = null;
	matches = 0;

	constructor(c: W40KClass, matches: number) {
		this.class = c;
		this.matches = matches;
	}
}


export class Component {
	init(): void {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		let source = urlParams.get('source');
		if (!source) {
			source = "ow";
		}
		console.log(urlParams, source, "ow" == source);
		fetch('assets/w40k-' + source + '.json')
			.then((response) => response.json())
			.then((data) => this.app(data));
	}

	data!: W40KData;

	selectedAptitudes: Aptitude[] = [];

	app(data: W40KData): void {
		this.data = data;

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
				let apt = "";
				for (let j = 0; j < apts.length; j++) {
					apt += apts[j];
					if (j < apts.length - 1) {
						apt += ", ";
					}
				}
				option.text = this.data.classes[i].class + " (" + apt.trim() + ")";
				option.value = this.data.classes[i].class;
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
				option.value = this.data.worlds[i].world;
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
				option.value = this.data.backgrounds[i].background;
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
				let apt = "";
				for (let j = 0; j < apts.length; j++) {
					apt += apts[j];
					if (j < apts.length - 1) {
						apt += ", ";
					}
				}
				option.text = this.data.roles[i].role + " (" + apt.trim() + ")";
				option.value = this.data.roles[i].role;
				roleSelect.add(option);
			}
			// add event listener to select element
			roleSelect.addEventListener("change", (event) => {
				this.triggerRecalc(event);
			});
		} else {
			roleSelectContainer.style.display = "none";
		}

		// select element with id="aptitudeSelect"
		const aptitudeSelect = document.getElementById("aptitudeSelect") as HTMLSelectElement;
		// add options to select element
		for (let i = 0; i < this.data.optional.length; i++) {
			const option = document.createElement("option");
			option.text = this.data.optional[i];
			option.value = this.data.optional[i];
			aptitudeSelect.add(option);
		}
		// add event listener to select element
		aptitudeSelect.addEventListener("change", (event) => {
			this.triggerRecalc(event);
		});
		if (data.classes && data.classes.length > 0) {
			aptitudeSelect.addEventListener("change", (event) => {
				this.logMatchingClasses(event, data);
			});
		}

		const skip0Cb = document.getElementById("skip0Cb") as HTMLInputElement;
		skip0Cb.addEventListener("change", (event) => {
			this.triggerRecalc(event);
		});

		const wishlist = document.getElementById("wishlist") as HTMLTextAreaElement;
		wishlist.addEventListener("change", (event) => {
			this.triggerRecalc(event);
		});

		const export_characteristic = document.getElementById("export_characteristic") as HTMLSelectElement;
		export_characteristic.addEventListener("click", (event) => {
			//this.exportTableToExcelDef("characteristic");
			this.copyToClipboard("characteristic");
		});

		const export_skill = document.getElementById("export_skill") as HTMLSelectElement;
		export_skill.addEventListener("click", (event) => {
			//this.exportTableToExcelDef("skill");
			this.copyToClipboard("skill");
		});

		const export_talent = document.getElementById("export_talent") as HTMLSelectElement;
		export_talent.addEventListener("click", (event) => {
			//this.exportTableToExcelDef("talent");
			this.copyToClipboard("talent");
		});

		const export_talent_wishlist = document.getElementById("export_talent_wishlist") as HTMLSelectElement;
		export_talent_wishlist.addEventListener("click", (event) => {
			this.copyToClipboardWishlist();
		});

		const export_all = document.getElementById("export_all") as HTMLSelectElement;
		export_all.addEventListener("click", (event) => {
			this.exportAllTableToExcelDef("characteristic", "skill", "talent");
		});

		const wishlist_clear = document.getElementById("wishlist_clear") as HTMLSelectElement;
		wishlist_clear.addEventListener("click", (event) => {
			wishlist.value = "";
			this.triggerRecalc(event);
		});


		($('._selectpicker') as any).selectpicker();

		this.triggerRecalc(null);
	}

	triggerRecalc(event: Event | null) {
		// javascript breakpoint
		//// eslint-disable-next-line no-debugger
		//debugger;

		const wishlist = document.getElementById("wishlist") as HTMLTextAreaElement;
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

		this.selectedAptitudes = [];

		const skip0Cb = document.getElementById("skip0Cb") as HTMLInputElement;
		const skip0CbChecked = skip0Cb.checked;

		this.selectedAptitudes.push(this.data.free);

		const duplicates: Aptitude[] = [];

		const classSelect = document.getElementById("classSelect") as HTMLSelectElement;
		if (classSelect.selectedIndex > 0) {
			const classAptitudes = this.data.classes[classSelect.selectedIndex - 1].aptitudes;
			for (let i = 0; i < classAptitudes.length; i++) {
				this.selectedAptitudes.push(classAptitudes[i]);
			}
		}

		const worldSelect = document.getElementById("worldSelect") as HTMLSelectElement;
		if (worldSelect.selectedIndex > 0) {
			const aptitude = this.data.worlds[worldSelect.selectedIndex - 1].aptitude;
			if (this.selectedAptitudes.includes(aptitude)) {
				duplicates.push(aptitude);
			} else {
				this.selectedAptitudes.push(aptitude);
			}
		}

		const roleSelect = document.getElementById("roleSelect") as HTMLSelectElement;
		if (roleSelect.selectedIndex > 0) {
			const aptitudes = this.data.roles[roleSelect.selectedIndex - 1].aptitudes;
			for (let i = 0; i < aptitudes.length; i++) {
				this.selectedAptitudes.push(aptitudes[i]);
			}
		}

		const backgroundSelect = document.getElementById("backgroundSelect") as HTMLSelectElement;
		if (backgroundSelect.selectedIndex > 0) {
			const aptitude = this.data.backgrounds[backgroundSelect.selectedIndex - 1].aptitude;
			if (this.selectedAptitudes.includes(aptitude)) {
				duplicates.push(aptitude);
			} else {
				this.selectedAptitudes.push(aptitude);
			}
		}

		const aptitudeSelect = document.getElementById("aptitudeSelect") as HTMLSelectElement;
		console.log("aptitudeSelect.selectedIndex", aptitudeSelect.selectedIndex);
		if (aptitudeSelect.selectedIndex >= 0) {
			const selectedOptions = aptitudeSelect.selectedOptions;
			console.log("selectedOptions", selectedOptions.length, selectedOptions);
			for (let z = 0; z < selectedOptions.length; z++) {
				const aptitude = this.data.optional[selectedOptions[z].index] as Aptitude;
				console.log(selectedOptions[z]);
				if (this.selectedAptitudes.includes(aptitude)) {
					duplicates.push(aptitude);
				} else {
					// push aptitude in array selectedAptitudes
					this.selectedAptitudes.push(aptitude);
					// console.log("apt", aptitudeSelect.selectedIndex, aptitude);
				}
			}
		}

		// concatenate selectedAptitudes into textfield
		const selectedAptitudes = document.getElementById("selectedAptitudes") as HTMLDivElement;
		// console.log(this.selectedAptitudes);
		selectedAptitudes.innerHTML = "";
		for (let i = 0; i < this.selectedAptitudes.length; i++) {
			selectedAptitudes.innerHTML += "<span class='badge badge-secondary'>" + this.selectedAptitudes[i] + "</span>&nbsp;";
		}
		// iterate over array duplicates
		for (let i = 0; i < duplicates.length; i++) {
			selectedAptitudes.innerHTML += "<span class='badge badge-danger'>" + duplicates[i] + " (duplicate)" + "</span>";
		}

		// iterate over array this.data.characteristic
		const characteristic = document.getElementById("characteristic") as HTMLDivElement;
		characteristic.innerHTML = "";

		// iterate over array this.data.characteristic and sort by index
		const sortedCharacteristic = this.data.characteristic.sort((a, b) => {
			let amatches = 0;
			if (this.selectedAptitudes.includes(a.name)) {
				amatches++;
			}
			if (this.selectedAptitudes.includes(a.aptitude)) {
				amatches++;
			}
			let bmatches = 0;
			if (this.selectedAptitudes.includes(b.name)) {
				bmatches++;
			}
			if (this.selectedAptitudes.includes(b.aptitude)) {
				bmatches++;
			}
			return -amatches + bmatches;
		});
		for (let i = 0; i < sortedCharacteristic.length; i++) {
			const cost = document.createElement("div");
			const cost2 = document.createElement("div");
			let skip = false;
			for (let j = 0; j < this.data.costs.length; j++) {
				if (this.data.costs[j].type === "characteristic") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if (this.selectedAptitudes.includes(sortedCharacteristic[i].name)) {
						matches++;
					}
					if (this.selectedAptitudes.includes(sortedCharacteristic[i].aptitude)) {
						matches++;
					}
					cost.innerHTML = "" + this.data.costs[j].cost[2 - matches][0];
					cost.classList.add("m" + matches);
					cost2.innerHTML = "" + matches;
					cost2.classList.add("m" + matches);
					if (matches === 0 && skip0CbChecked) {
						skip = true;
					}
				}
			}
			if (skip) {
				continue;
			}
			const root = document.createElement("div");
			characteristic.appendChild(root);
			root.appendChild(cost);
			root.appendChild(cost2);
			const characteristicName = document.createElement("div");
			characteristicName.innerHTML = sortedCharacteristic[i].name;
			if (this.selectedAptitudes.includes(sortedCharacteristic[i].name)) {
				characteristicName.classList.add("m2");
			}
			root.appendChild(characteristicName);
			const characteristicAptitude = document.createElement("div");
			characteristicAptitude.innerHTML = sortedCharacteristic[i].aptitude;
			if (this.selectedAptitudes.includes(sortedCharacteristic[i].aptitude)) {
				characteristicAptitude.classList.add("m2");
			}
			root.appendChild(characteristicAptitude);
		}

		const talent = document.getElementById("talent") as HTMLDivElement;
		talent.innerHTML = "";
		const sortedTalents = this.data.talents.sort((a, b) => {
			let amatches = 0;
			if (this.selectedAptitudes.includes(a.apt1)) {
				amatches++;
			}
			if (this.selectedAptitudes.includes(a.apt2)) {
				amatches++;
			}
			let bmatches = 0;
			if (this.selectedAptitudes.includes(b.apt1)) {
				bmatches++;
			}
			if (this.selectedAptitudes.includes(b.apt2)) {
				bmatches++;
			}
			if (amatches === bmatches) {
				return a.tier - b.tier;
			}
			return -amatches + bmatches;
		});
		let matches2 = 0;
		let matches1 = 0;
		let matches0 = 0;
		for (let i = 0; i < sortedTalents.length; i++) {
			// console.log(sortedTalents[i].talent.toLowerCase(), wishlistArray.length == 0, wishlistArray.includes(sortedTalents[i].talent.toLowerCase()));
			if (!(wishlistArray.length == 0 || wishlistArray.includes(sortedTalents[i].talent.toLowerCase().trim()))) {
				continue;
			}
			const cost = document.createElement("div");
			const cost2 = document.createElement("div");
			let skip = false;
			for (let j = 0; j < this.data.costs.length; j++) {
				if (this.data.costs[j].type === "talent") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if (this.selectedAptitudes.includes(sortedTalents[i].apt1)) {
						matches++;
					}
					if (this.selectedAptitudes.includes(sortedTalents[i].apt2)) {
						matches++;
					}
					if (matches == 2) {
						matches2++;
					} else if (matches == 1) {
						matches1++;
					} else {
						matches0++;
					}
					cost.innerHTML = "" + this.data.costs[j].cost[2 - matches][sortedTalents[i].tier - 1];
					cost.classList.add("m" + matches);
					cost2.innerHTML = "" + matches;
					cost2.classList.add("m" + matches);
					if (matches === 0 && skip0CbChecked) {
						skip = true;
					}
				}
			}
			// console.log("2 -- 1 -- 0", matches2, matches1, matches0);
			if (skip) {
				continue;
			}
			const root = document.createElement("div");
			talent.appendChild(root);
			root.appendChild(cost)
			root.appendChild(cost2);
			const talentTier = document.createElement("div");
			talentTier.innerHTML = "T" + sortedTalents[i].tier;
			root.appendChild(talentTier);
			const talentName = document.createElement("div");
			talentName.innerHTML = sortedTalents[i].talent;
			root.appendChild(talentName);
			talentName.title = sortedTalents[i].benefit;
			const talentApt1 = document.createElement("div");
			talentApt1.innerHTML = sortedTalents[i].apt1;
			root.appendChild(talentApt1);
			if (this.selectedAptitudes.includes(sortedTalents[i].apt1)) {
				talentApt1.classList.add("m2");
			}
			const talentApt2 = document.createElement("div");
			talentApt2.innerHTML = sortedTalents[i].apt2;
			root.appendChild(talentApt2);
			if (this.selectedAptitudes.includes(sortedTalents[i].apt2)) {
				talentApt2.classList.add("m2");
			}
			const talentPrerequisites = document.createElement("div");
			talentPrerequisites.innerHTML = sortedTalents[i].prerequisites;
			root.appendChild(talentPrerequisites);
			const talentDescription = document.createElement("div");
			talentDescription.innerHTML = sortedTalents[i].benefit;
			talentDescription.style.display = "none";
			root.appendChild(talentDescription);
		}

		// iterate over array this.data.skills
		const skill = document.getElementById("skill") as HTMLDivElement;
		skill.innerHTML = "";
		const sortedSkills = this.data.skills.sort((a, b) => {
			let amatches = 0;
			if (this.selectedAptitudes.includes(a.aptitudes[0])) {
				amatches++;
			}
			if (this.selectedAptitudes.includes(a.aptitudes[1])) {
				amatches++;
			}
			let bmatches = 0;
			if (this.selectedAptitudes.includes(b.aptitudes[0])) {
				bmatches++;
			}
			if (this.selectedAptitudes.includes(b.aptitudes[1])) {
				bmatches++;
			}
			return -amatches + bmatches;
		});
		for (let i = 0; i < sortedSkills.length; i++) {
			let skip = false;
			const cost = document.createElement("div");
			const cost2 = document.createElement("div");
			for (let j = 0; j < this.data.costs.length; j++) {
				if (this.data.costs[j].type === "skill") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if (this.selectedAptitudes.includes(sortedSkills[i].aptitudes[0])) {
						matches++;
					}
					if (this.selectedAptitudes.includes(sortedSkills[i].aptitudes[1])) {
						matches++;
					}
					cost.innerHTML = "" + this.data.costs[j].cost[2 - matches][0];
					cost.classList.add("m" + matches);
					cost2.innerHTML = "" + matches;
					cost2.classList.add("m" + matches);
					if (matches === 0 && skip0CbChecked) {
						skip = true;
					}
				}
			}
			if (skip) {
				continue;
			}
			const root = document.createElement("div");
			skill.appendChild(root);
			root.appendChild(cost);
			root.appendChild(cost2);
			const skillName = document.createElement("div");
			skillName.innerHTML = sortedSkills[i].name;
			root.appendChild(skillName);
			for (let j = 0; j < sortedSkills[i].aptitudes.length; j++) {
				const skillApt = document.createElement("div");
				skillApt.innerHTML = sortedSkills[i].aptitudes[j];
				if (this.selectedAptitudes.includes(sortedSkills[i].aptitudes[j])) {
					skillApt.classList.add("m2");
				}
				root.appendChild(skillApt);
			}
		}

		($('[title]:not(.dropdown-toggle)') as any).tooltip();
	}

	exportAllTableToExcelDef(divId1: string, divId2: string, divId3: string) {
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
			+ "\t<tr>\n" +
			"\t\t<td>cost</td>\n" +
			"\t\t<td>m</td>\n" +
			"\t\t<td>skill</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t</tr>"
			+ tableHtml1.replace("<table>", "").replace("</table>", "")
			+ "<tr><td> </td></tr>"
			+ "<tr><td> </td></tr>"
			+ "<tr><td>Skills</td></tr>"
			+ "\t<tr>\n" +
			"\t\t<td>cost</td>\n" +
			"\t\t<td>m</td>\n" +
			"\t\t<td>characteristic</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t</tr>"
			+ tableHtml2.replace("<table>", "").replace("</table>", "")
			+ "<tr><td> </td></tr>"
			+ "<tr><td> </td></tr>"
			+ "<tr><td>Talents</td></tr>"
			+ "\t<tr>\n" +
			"\t\t<td>cost</td>\n" +
			"\t\t<td>m</td>\n" +
			"\t\t<td>tier</td>\n" +
			"\t\t<td>talent</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t\t<td>requirement</td>\n" +
			"\t\t<td>description</td>\n" +
			"\t</tr>"
			+ tableHtml3.replace("<table>", "").replace("</table>", "")
			+ "</table>";
		d.style.display = "none";
		d.id = "exportTableToExcelDef";
		document.body.appendChild(d);
		this.exportTableToExcel("exportTableToExcelDef", "all");
	}

	exportTableToExcelDef(divId: string) {
		document.getElementById("exportTableToExcelDef")?.remove();
		const tableHtml = this.exportDivToTable(divId);
		if (!tableHtml) return;
		const d = document.createElement("div");
		d.innerHTML = tableHtml;
		d.style.display = "none";
		d.id = "exportTableToExcelDef";
		document.body.appendChild(d);
		this.exportTableToExcel("exportTableToExcelDef", divId);
	}

	exportDivToTable(divId: string, plain = false) {
		const div = document.getElementById(divId);
		if (!div) return;
		// iterate over divs inside div
		let tab = "";
		if (!plain) tab += "<table>";
		for (let i = 0; i < div.children.length; i++) {
			if (!plain) tab += "<tr>";
			const r = div.children[i] as HTMLDivElement;
			for (let j = 0; j < r.children.length; j++) {
				const c = r.children[j] as HTMLDivElement;
				if (!plain) tab += "<td>";
				tab += c.innerHTML;
				if (!plain) tab += "</td>";
				else tab += "\t";
			}
			if (!plain) tab += "</tr>";
			else tab += "\n";
		}
		if (!plain) tab += "</table>";
		return tab;
	}

	// https://www.codexworld.com/export-html-table-data-to-excel-using-javascript/
	exportTableToExcel(tableID: string, filename = '') {
		const dataType = 'application/vnd.ms-excel';
		const tableSelect = document.getElementById(tableID);
		if (!tableSelect) return;
		const tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
		filename = filename ? filename + '.xls' : 'excel_data.xls';
		document.getElementById("a789")?.remove();
		const downloadLink = document.createElement("a");
		downloadLink.id = "a789";
		document.body.appendChild(downloadLink);
		if ((navigator as any).msSaveOrOpenBlob) {
			const blob = new Blob(['\ufeff', tableHTML], {
				type: dataType
			});
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

	copyToClipboard(divId: string) {
		const tableHtml = this.exportDivToTable(divId, true);
		if (!tableHtml) return;
		document.getElementById("textarea123")?.remove();
		const d: HTMLTextAreaElement = document.createElement("textarea");
		//d.type="text";
		//d.value = tableHtml;
		d.innerHTML = tableHtml;
		d.style.display = "none";
		d.id = "textarea123";
		document.body.appendChild(d);
		d.select();
		d.setSelectionRange(0, 99999); // For mobile devices
		// console.log(d.value);
		navigator.clipboard.writeText(d.value);
	}

	copyToClipboardWishlist() {
		const div = document.getElementById("talent");
		if (!div) return;
		let tableHtml = "";
		for (let i = 0; i < div.children.length; i++) {
			const r = div.children[i] as HTMLDivElement;
			const retain = (r.children[1] as HTMLInputElement).innerHTML == "0" || (r.children[1] as HTMLInputElement).innerHTML == "1";
			if (retain) {
				tableHtml += (r.children[3] as HTMLDivElement).innerHTML + "\n";
			}
		}
		document.getElementById("textarea456aa")?.remove();
		const d: HTMLTextAreaElement = document.createElement("textarea");
		d.innerHTML = tableHtml;
		d.style.display = "none";
		d.id = "textarea456aa";
		document.body.appendChild(d);
		d.select();
		d.setSelectionRange(0, 99999); // For mobile devices
		console.log(d.value);
		navigator.clipboard.writeText(d.value);
	}

	aptitude(key: string): Aptitude | null {
		for (const value in Aptitude) {
			if (key.replace("_", "").replace(" ", "") == value.replace("_", "").replace(" ", "")) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				return Aptitude[value];
			}
		}
		return null;
	}

	logMatchingClasses(event: Event, data: W40KData) {
		console.log("logMatchingClasses");
		const aptitudeSelect = document.getElementById("aptitudeSelect") as HTMLSelectElement;
		if (aptitudeSelect.selectedIndex >= 0) {
			const selectedOptions = aptitudeSelect.selectedOptions;
			const aptitudes: Aptitude[] = [];
			const weightedClasses: WeightedClass[] = [];
			for (let z = 0; z < selectedOptions.length; z++) {
				const aptitude = this.data.optional[selectedOptions[z].index] as Aptitude;
				aptitudes.push(aptitude);
			}
			console.log(aptitudes);
			for (let i = 0; i < data.classes.length; i++) {
				const c = data.classes[i];
				let matches = 0;
				for (let j = 0; j < c.aptitudes.length; j++) {
					const a = c.aptitudes[j];
					for (let k = 0; k < aptitudes.length; k++) {
						const b = aptitudes[k];
						if (a == b) {
							matches++;
						}
					}
				}
				const weightedClass = new WeightedClass(c, matches);
				weightedClasses.push(weightedClass);
			}
			weightedClasses.sort((a, b) => {
				return b.matches - a.matches;
			});
			for (let i = 0; i < weightedClasses.length; i++) {
				console.log(weightedClasses[i].class?.class, weightedClasses[i].matches, weightedClasses[i].class?.aptitudes);
			}
		}
	}
}
