export enum Aptitude {
	General = "General",
	//
	Weapon_Skill = "Weapon Skill",
	Ballistic_Skill = "Ballistic Skill",
	Strength = "Strength",
	Toughness = "Toughness",
	Agility = "Agility",
	Intelligence = "Intelligence",
	Perception = "Perception",
	Willpower = "Willpower",
	Fellowship = "Fellowship",
	//
	Offence="Offence",
	Finesse="Finesse",
	Defence="Defence",
	Psyker="Psyker",
	Tech="Tech",
	Knowledge="Knowledge",
	Leadership="Leadership",
	Fieldcraft="Fieldcraft",
	Social="Social"
}

interface W40KCosts {
	type: string;//characteristic(max:4),talent(max:3),skill(max:4)
	cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
}

interface W40KData {
	costs: W40KCosts[];
	free: Aptitude;
	classes: W40KClass[];
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


export class Component {
	init(): void {
		fetch('assets/w40k.json')
			.then((response) => response.json())
			.then((data) => this.app(data));
	}

	data!: W40KData;

	selectedAptitudes: Aptitude[] = [];

	app(data: W40KData) {
		this.data = data;

		// select element with id="classSelect"
		const classSelect = document.getElementById("classSelect") as HTMLSelectElement;
		{
			const option = document.createElement("option");
			option.text = "None";
			classSelect.add(option);
		}

		// add options to select element
		for (let i = 0; i < this.data.classes.length; i++) {
			const option = document.createElement("option");
			option.text = this.data.classes[i].class;
			option.value = this.data.classes[i].class;
			classSelect.add(option);
		}
		// add event listener to select element
		classSelect.addEventListener("change", (event) => {
			this.triggerRecalc(event);
		});

		// select element with id="aptitudeSelect"
		const aptitudeSelect = document.getElementById("aptitudeSelect") as HTMLSelectElement;
		{
			const option = document.createElement("option");
			option.text = "None";
			aptitudeSelect.add(option);
		}
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

		const export_all = document.getElementById("export_all") as HTMLSelectElement;
		export_all.addEventListener("click", (event) => {
			this.exportAllTableToExcelDef("characteristic","skill","talent");
		});

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
		console.log("wishlistArray",wishlistArray.length,wishlistArray);

		this.selectedAptitudes = [];

		const skip0Cb = document.getElementById("skip0Cb") as HTMLInputElement;
		const skip0CbChecked = skip0Cb.checked;

		// push this.data.free in array selectedAptitudes as first element
		this.selectedAptitudes.push(this.data.free);
		console.log("free",this.data.free);

		const classSelect = document.getElementById("classSelect") as HTMLSelectElement;
		if(classSelect.selectedIndex > 0) {
			const classAptitudes = this.data.classes[classSelect.selectedIndex - 1].aptitudes;
			// iterate over array selectedAptitudes
			for (let i = 0; i < classAptitudes.length; i++) {
				this.selectedAptitudes.push(classAptitudes[i]);
				console.log("class",classSelect.selectedIndex,i,classAptitudes[i]);
			}
		}

		let duplicate: Aptitude | null = null;
		const aptitudeSelect = document.getElementById("aptitudeSelect") as HTMLSelectElement;
		if(aptitudeSelect.selectedIndex > 0) {
			const aptitude = this.data.optional[aptitudeSelect.selectedIndex - 1] as Aptitude;
			if(this.selectedAptitudes.includes(aptitude)) {
				duplicate = aptitude;
			} else {
				// push aptitude in array selectedAptitudes
				this.selectedAptitudes.push(aptitude);
				console.log("apt",aptitudeSelect.selectedIndex, aptitude);
			}
		}

		// concatenate selectedAptitudes into textfield
		const selectedAptitudes = document.getElementById("selectedAptitudes") as HTMLDivElement;
		console.log(this.selectedAptitudes);
		selectedAptitudes.innerHTML = "<u>Aptitudes</u>: ";
		for (let i = 0; i < this.selectedAptitudes.length; i++) {
			selectedAptitudes.innerHTML += "<span class='badge badge-secondary'>" + this.selectedAptitudes[i] + "</span>&nbsp;";
		}
		if(duplicate) {
			selectedAptitudes.innerHTML += "<span class='badge badge-danger'>" + duplicate + " (duplicate)" + "</span>";
		}

		// iterate over array this.data.characteristic
		const characteristic = document.getElementById("characteristic") as HTMLDivElement;
		characteristic.innerHTML = "";

		// iterate over array this.data.characteristic and sort by index
		const sortedCharacteristic = this.data.characteristic.sort((a, b) => {
			let amatches = 0;
			if(this.selectedAptitudes.includes(a.name)) {
				amatches++;
			}
			if(this.selectedAptitudes.includes(a.aptitude)) {
				amatches++;
			}
			let bmatches = 0;
			if(this.selectedAptitudes.includes(b.name)) {
				bmatches++;
			}
			if(this.selectedAptitudes.includes(b.aptitude)) {
				bmatches++;
			}
			return - amatches + bmatches;
		});
		for (let i = 0; i < sortedCharacteristic.length; i++) {
			const cost= document.createElement("div");
			const cost2= document.createElement("div");
			let skip = false;
			for (let j = 0; j < this.data.costs.length; j++) {
				if(this.data.costs[j].type === "characteristic") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if(this.selectedAptitudes.includes(sortedCharacteristic[i].name)) {
						matches++;
					}
					if(this.selectedAptitudes.includes(sortedCharacteristic[i].aptitude)) {
						matches++;
					}
					cost.innerHTML = ""+this.data.costs[j].cost[2-matches][0];
					cost.classList.add("m"+matches);
					cost2.innerHTML = ""+matches;
					cost2.classList.add("m"+matches);
					if(matches === 0 && skip0CbChecked) {
						skip = true;
					}
				}
			}
			if(skip) {
				continue;
			}
			const root= document.createElement("div");
			characteristic.appendChild(root);
			root.appendChild(cost);
			root.appendChild(cost2);
			const characteristicName = document.createElement("div");
			characteristicName.innerHTML = sortedCharacteristic[i].name;
			if(this.selectedAptitudes.includes(sortedCharacteristic[i].name)) {
				characteristicName.classList.add("m2");
			}
			root.appendChild(characteristicName);
			const characteristicAptitude = document.createElement("div");
			characteristicAptitude.innerHTML = sortedCharacteristic[i].aptitude;
			if(this.selectedAptitudes.includes(sortedCharacteristic[i].aptitude)) {
				characteristicAptitude.classList.add("m2");
			}
			root.appendChild(characteristicAptitude);
		}

		const talent = document.getElementById("talent") as HTMLDivElement;
		talent.innerHTML = "";
		const sortedTalents = this.data.talents.sort((a, b) => {
			let amatches = 0;
			if(this.selectedAptitudes.includes(a.apt1)) {
				amatches++;
			}
			if(this.selectedAptitudes.includes(a.apt2)) {
				amatches++;
			}
			let bmatches = 0;
			if(this.selectedAptitudes.includes(b.apt1)) {
				bmatches++;
			}
			if(this.selectedAptitudes.includes(b.apt2)) {
				bmatches++;
			}
			if(amatches === bmatches) {
				return a.tier - b.tier;
			}
			return - amatches + bmatches;
		});
		for (let i = 0; i < sortedTalents.length; i++) {
			console.log(sortedTalents[i].talent.toLowerCase(),wishlistArray.length==0,wishlistArray.includes(sortedTalents[i].talent.toLowerCase()));
			if(!(wishlistArray.length==0 || wishlistArray.includes(sortedTalents[i].talent.toLowerCase().trim()))) {
				continue;
			}
			const cost= document.createElement("div");
			const cost2= document.createElement("div");
			let skip = false;
			for (let j = 0; j < this.data.costs.length; j++) {
				if(this.data.costs[j].type === "talent") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if(this.selectedAptitudes.includes(sortedTalents[i].apt1)) {
						matches++;
					}
					if(this.selectedAptitudes.includes(sortedTalents[i].apt2)) {
						matches++;
					}
					cost.innerHTML = ""+this.data.costs[j].cost[2-matches][sortedTalents[i].tier-1];
					cost.classList.add("m"+matches);
					cost2.innerHTML = ""+matches;
					cost2.classList.add("m"+matches);
					if(matches === 0 && skip0CbChecked) {
						skip = true;
					}
				}
			}
			if(skip) {
				continue;
			}
			const root= document.createElement("div");
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
			if(this.selectedAptitudes.includes(sortedTalents[i].apt1)) {
				talentApt1.classList.add("m2");
			}
			const talentApt2 = document.createElement("div");
			talentApt2.innerHTML = sortedTalents[i].apt2;
			root.appendChild(talentApt2);
			if(this.selectedAptitudes.includes(sortedTalents[i].apt2)) {
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
			if(this.selectedAptitudes.includes(a.aptitudes[0])) {
				amatches++;
			}
			if(this.selectedAptitudes.includes(a.aptitudes[1])) {
				amatches++;
			}
			let bmatches = 0;
			if(this.selectedAptitudes.includes(b.aptitudes[0])) {
				bmatches++;
			}
			if(this.selectedAptitudes.includes(b.aptitudes[1])) {
				bmatches++;
			}
			return - amatches + bmatches;
		});
		for (let i = 0; i < sortedSkills.length; i++) {
			let skip = false;
			const cost= document.createElement("div");
			const cost2= document.createElement("div");
			for (let j = 0; j < this.data.costs.length; j++) {
				if(this.data.costs[j].type === "skill") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if(this.selectedAptitudes.includes(sortedSkills[i].aptitudes[0])) {
						matches++;
					}
					if(this.selectedAptitudes.includes(sortedSkills[i].aptitudes[1])) {
						matches++;
					}
					cost.innerHTML = ""+this.data.costs[j].cost[2-matches][0];
					cost.classList.add("m"+matches);
					cost2.innerHTML = ""+matches;
					cost2.classList.add("m"+matches);
					if(matches === 0 && skip0CbChecked) {
						skip = true;
					}
				}
			}
			if(skip) {
				continue;
			}
			const root= document.createElement("div");
			skill.appendChild(root);
			root.appendChild(cost);
			root.appendChild(cost2);
			const skillName = document.createElement("div");
			skillName.innerHTML = sortedSkills[i].name;
			root.appendChild(skillName);
			for (let j = 0; j < sortedSkills[i].aptitudes.length; j++) {
				const skillApt = document.createElement("div");
				skillApt.innerHTML = sortedSkills[i].aptitudes[j];
				if(this.selectedAptitudes.includes(sortedSkills[i].aptitudes[j])) {
					skillApt.classList.add("m2");
				}
				root.appendChild(skillApt);
			}
		}
	}

	exportAllTableToExcelDef(divId1: string,divId2: string,divId3: string){
		document.getElementById("exportTableToExcelDef")?.remove();
		const tableHtml1 = this.exportDivToTable(divId1);
		const tableHtml2 = this.exportDivToTable(divId2);
		const tableHtml3 = this.exportDivToTable(divId3);
		if(!tableHtml1) return;
		if(!tableHtml2) return;
		if(!tableHtml3) return;
		const d = document.createElement("div");
		d.innerHTML = "<table>"
			+"<tr><td>Characteristics</td></tr>"
			+"\t<tr>\n" +
			"\t\t<td>cost</td>\n" +
			"\t\t<td>m</td>\n" +
			"\t\t<td>skill</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t</tr>"
			+tableHtml1.replace("<table>","").replace("</table>","")
			+"<tr><td> </td></tr>"
			+"<tr><td> </td></tr>"
			+"<tr><td>Skills</td></tr>"
			+"\t<tr>\n" +
			"\t\t<td>cost</td>\n" +
			"\t\t<td>m</td>\n" +
			"\t\t<td>characteristic</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t</tr>"
			+tableHtml2.replace("<table>","").replace("</table>","")
			+"<tr><td> </td></tr>"
			+"<tr><td> </td></tr>"
			+"<tr><td>Talents</td></tr>"
			+"\t<tr>\n" +
			"\t\t<td>cost</td>\n" +
			"\t\t<td>m</td>\n" +
			"\t\t<td>tier</td>\n" +
			"\t\t<td>talent</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t\t<td>aptitude</td>\n" +
			"\t\t<td>requirement</td>\n" +
			"\t\t<td>description</td>\n" +
			"\t</tr>"
			+tableHtml3.replace("<table>","").replace("</table>","")
			+"</table>";
		d.style.display = "none";
		d.id = "exportTableToExcelDef";
		document.body.appendChild(d);
		this.exportTableToExcel("exportTableToExcelDef", "all");
	}

	exportTableToExcelDef(divId: string){
		document.getElementById("exportTableToExcelDef")?.remove();
		const tableHtml = this.exportDivToTable(divId);
		if(!tableHtml) return;
		const d = document.createElement("div");
		d.innerHTML = tableHtml;
		d.style.display = "none";
		d.id = "exportTableToExcelDef";
		document.body.appendChild(d);
		this.exportTableToExcel("exportTableToExcelDef", divId);
	}

	exportDivToTable(divId: string, plain = false){
		const div = document.getElementById(divId);
		if(!div) return;
		// iterate over divs inside div
		let tab = "";
		if(!plain) tab += "<table>";
		for (let i = 0; i < div.children.length; i++) {
			if(!plain) tab += "<tr>";
			const r = div.children[i] as HTMLDivElement;
			for (let j = 0; j < r.children.length; j++) {
				const c = r.children[j] as HTMLDivElement;
				if(!plain) tab += "<td>";
				tab += c.innerHTML;
				if(!plain) tab += "</td>";
				else tab += "\t";
			}
			if(!plain) tab += "</tr>";
			else tab += "\n";
		}
		if(!plain) tab += "</table>";
		return tab;
	}

	// https://www.codexworld.com/export-html-table-data-to-excel-using-javascript/
	exportTableToExcel(tableID: string, filename = ''){
		const dataType = 'application/vnd.ms-excel';
		const tableSelect = document.getElementById(tableID);
		if(!tableSelect) return;
		const tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
		// Specify file name
		filename = filename?filename+'.xls':'excel_data.xls';
		// Create download link element
		const downloadLink = document.createElement("a");
		document.body.appendChild(downloadLink);
		if((navigator as any).msSaveOrOpenBlob){
			const blob = new Blob(['\ufeff', tableHTML], {
				type: dataType
			});
			(navigator as any).msSaveOrOpenBlob( blob, filename);
		}else{
			// Create a link to the file
			downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
			// Setting the file name
			downloadLink.download = filename;
			//triggering the function
			downloadLink.click();
		}
	}

	copyToClipboard(divId: string) {
		document.getElementById("exportTableToClipboard")?.remove();
		const tableHtml = this.exportDivToTable(divId,true);
		if(!tableHtml) return;
		const d: HTMLTextAreaElement = document.createElement("textarea");
		//d.type="text";
		//d.value = tableHtml;
		d.innerHTML = tableHtml;
		d.style.display = "none";
		d.id = "exportTableToClipboard";
		document.body.appendChild(d);
		d.select();
		d.setSelectionRange(0, 99999); // For mobile devices
		console.log(d.value);
		navigator.clipboard.writeText(d.value);
	}
}
