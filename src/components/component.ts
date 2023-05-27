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
	}

	triggerRecalc(event: Event) {
		// javascript breakpoint
		//// eslint-disable-next-line no-debugger
		//debugger;

		this.selectedAptitudes = [];

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
		selectedAptitudes.innerHTML = this.selectedAptitudes.join(", ");
		if(duplicate) {
			selectedAptitudes.innerHTML += ", "+duplicate+" (duplicate)";
		}

		// iterate over array this.data.characteristic
		const characteristic = document.getElementById("characteristic") as HTMLDivElement;
		characteristic.innerHTML = "";
		for (let i = 0; i < this.data.characteristic.length; i++) {
			const cost= document.createElement("div");
			for (let j = 0; j < this.data.costs.length; j++) {
				if(this.data.costs[j].type === "characteristic") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if(this.selectedAptitudes.includes(this.data.characteristic[i].name)) {
						matches++;
					}
					if(this.selectedAptitudes.includes(this.data.characteristic[i].aptitude)) {
						matches++;
					}
					cost.innerHTML = this.data.costs[j].cost[2-matches][0]+"..."+this.data.costs[j].cost[2-matches][3]+" ("+matches+")";
					cost.classList.add("m"+matches);
				}
			}
			characteristic.appendChild(cost);
			const characteristicName = document.createElement("div");
			characteristicName.innerHTML = this.data.characteristic[i].name;
			characteristic.appendChild(characteristicName);
			const characteristicAptitude = document.createElement("div");
			characteristicAptitude.innerHTML = this.data.characteristic[i].aptitude;
			characteristic.appendChild(characteristicAptitude);
		}

		// iterate over array this.data.talents
		const talent = document.getElementById("talent") as HTMLDivElement;
		talent.innerHTML = "";
		for (let i = 0; i < this.data.talents.length; i++) {
			const cost= document.createElement("div");
			for (let j = 0; j < this.data.costs.length; j++) {
				if(this.data.costs[j].type === "talent") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if(this.selectedAptitudes.includes(this.data.talents[i].apt1)) {
						matches++;
					}
					if(this.selectedAptitudes.includes(this.data.talents[i].apt2)) {
						matches++;
					}
					cost.innerHTML = this.data.costs[j].cost[2-matches][this.data.talents[i].tier-1]+" ("+matches+")";
					cost.classList.add("m"+matches);
				}
			}
			talent.appendChild(cost);
			const talentTier = document.createElement("div");
			talentTier.innerHTML = "T" + this.data.talents[i].tier;
			talent.appendChild(talentTier);
			const talentName = document.createElement("div");
			talentName.innerHTML = this.data.talents[i].talent;
			talent.appendChild(talentName);
			const talentApt1 = document.createElement("div");
			talentApt1.innerHTML = this.data.talents[i].apt1;
			talent.appendChild(talentApt1);
			const talentApt2 = document.createElement("div");
			talentApt2.innerHTML = this.data.talents[i].apt2;
			talent.appendChild(talentApt2);
			const talentPrerequisites = document.createElement("div");
			talentPrerequisites.innerHTML = this.data.talents[i].prerequisites;
			talent.appendChild(talentPrerequisites);
		}

		// iterate over array this.data.skills
		const skill = document.getElementById("skill") as HTMLDivElement;
		skill.innerHTML = "";
		for (let i = 0; i < this.data.skills.length; i++) {
			const cost= document.createElement("div");
			for (let j = 0; j < this.data.costs.length; j++) {
				if(this.data.costs[j].type === "skill") {
					// cost: number[]/*2,1,0 matches*/[]/*max:1,2,3,4*/;
					let matches = 0;
					if(this.selectedAptitudes.includes(this.data.skills[i].aptitudes[0])) {
						matches++;
					}
					if(this.selectedAptitudes.includes(this.data.skills[i].aptitudes[1])) {
						matches++;
					}
					cost.innerHTML = this.data.costs[j].cost[2-matches][0]+"..."+this.data.costs[j].cost[2-matches][3]+" ("+matches+")";
					cost.classList.add("m"+matches);
				}
			}
			skill.appendChild(cost);
			const skillName = document.createElement("div");
			skillName.innerHTML = this.data.skills[i].name;
			skill.appendChild(skillName);
			for (let j = 0; j < this.data.skills[i].aptitudes.length; j++) {
				const skillApt = document.createElement("div");
				skillApt.innerHTML = this.data.skills[i].aptitudes[j];
				skill.appendChild(skillApt);
			}
		}
	}
}
