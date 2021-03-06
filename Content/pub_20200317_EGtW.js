var iFileName = "pub_20200317_EGtW.js";
RequiredSheetVersion(13);

// Define the source
SourceList.W={
	name : "Explorer's Guide to Wildemount",
	abbreviation : "EGtW",
	group : "Primary Sources",
	url : "https://dnd.wizards.com/products/wildemount",
	date : "2020/03/17"
};

// Add one subclass for Fighter
AddSubClass("fighter", "echo knight-egtw", {
	regExpSearch : /^(?=.*echo)(?=.*knight).*$/i,
	subname : "Echo Knight",
	source : ["W", 183],
	fullname : "Echo Knight",
	features : {
		"subclassfeature3" : {
			name : "Manifest Echo",
			source : ["W", 183],
			minlevel : 3,
			description : desc([
				"As a bonus action I can summon a gray copy of myself within 15ft with AC 14 + prof. bonus,",
				"1 HP and uses my saves. As free action I can command it to move up to 30ft.",
				"If its is more than 30ft from me at the end of my turn it is destroyed.",
				"I can bonus action to swap places with my echo for 15ft of movement regardless of distance.",
				"Attacks and reaction attacks can originate from me or the echo."]),
			action: ["bonus action", " (summon/swap)"],
			eval : function (lvl, chc) {
				companionUtil.add("Echo");
			},
			removeeval : function (lvl, chc) {
				companionUtil.remove("echo");
				if (CreatureList.echo && CreatureList.echo.removeeval) CreatureList.echo.removeeval();
			}
		},
		"subclassfeature3.1" : {
			name : "Unleash Incarnation",
			source : ["W", 183],
			minlevel : 3,
			description : "Whenever I attack my echo can make an additional attack. Minimum once.",
			usages : "Constitution modifier per ",
			usagescalc : usagescalcStr("Con"),
			recovery : "long rest"
		},
		"subclassfeature7" : {
			name : "Echo Avatar",
			source : ["W", 183],
			minlevel : 7,
			description : desc([
				"As an action I can transfer my senses into my echo for 10 minutes. During this I am blinded",
				"and deaf. My echo can go up to 1000ft from me when used in this way."]),
			action : [["action", ""]]
		},
		"subclassfeature10" : {
			name : "Shadow Martyr",
			source : ["W", 183],
			minlevel : 10,
			description : desc([
				"Using my reaction, before an attack roll is made I can use my echo to intercept an attack",
				"directed at another creature I can see. The echo teleports within 5ft of the target."]),
			action : [["reaction", ""]],
			usages : 1,
			recovery : "short rest"
		},
		"subclassfeature15" : {
			name : "Reclaim Potential",
			source : ["W", 184],
			minlevel : 15,
			description : desc([
					"When my echo is destroyed I gain 2d6 + Constitution modifier in temp. HP (provided I don't",
					"already have temp. HP) minimum once."]),
			usages : "Constitution modifier per ",
			usagescalc : usagescalcStr("Con"),
			recovery : "long rest"
		},
		"subclassfeature18" : {
			name : "Legion of One",
			source : ["W", 184],
			minlevel : 18,
			description : desc([
					"When I use my bonus action to Manifest Echo I can create two echoes that both function for",
					"my Echo Knight abilities. If I try to summon a third the prior 2 are destroyed. If I roll initiative",
					"with no uses of Unleash Incarnation left, I regain one use."])
		}
	}
});
CreatureList.echo = {
	name : "Echo",
	source : [["W", 183]],
	size : 3,
	type : "",
	subtype : "",
	alignment : "Neutral",
	ac : 14,
	hp : 1,
	hd : [],
	speed : "0 ft",
	scores : [10, 10, 10, 10, 10, 10],
	saves : ["", "", "", "", "", ""],
	condition_immunities : "all conditions",
	passivePerception : 0,
	senses : "",
	languages : "",
	challengeRating : "0",
	proficiencyBonus : 0,
	attacksAction : 0,
	attacks : [],
	eval : function(prefix) {

		// HP is only ever 1
		var HPmaxFld = tDoc.getField(prefix + "Comp.Use.HP.Max");
		HPmaxFld.readonly = true;
		Hide(prefix + "Buttons.Comp.Use.HP.Max");

		// Echo type
		var theType = tDoc.getField(prefix + 'Comp.Type');
		theType.readonly = true;
		theType.value = 'Echo';

		// Armour class is 14 + character proficiency
		var armourClass = tDoc.getField(prefix + 'Comp.Use.AC');
		armourClass.readonly = true;
		armourClass.setAction("Calculate", "event.value = 14 + Number(How('Proficiency Bonus'));");

		// Same size as character
		PickDropdown(prefix + "Comp.Desc.Size", CurrentRace.size);

		// Saving throws are the same as the character's
		for (var i = 0; i < AbilityScores.abbreviations.length; i++) {
			var abi = AbilityScores.abbreviations[i];
			var saveModBonus = tDoc.getField(prefix + 'BlueText.Comp.Use.Ability.' + abi + '.ST.Bonus');
			saveModBonus.readonly = true;
			saveModBonus.setAction("Calculate", "event.value = What('" + abi + " ST Mod');");
		}
		// TODO: This doesn't quite work, as this bonus is unfortunately calculated after the actual save.
	}
};
function usagescalcStr(mod) {
	return "event.value = Math.max(1, What('" + mod + " Mod'));";
}
var companionUtil = {
	add : function (compName) {
		var AScompA = isTemplVis('AScomp') ? What('Template.extras.AScomp').split(',') : false;
		var prefix = false;
		if (AScompA) {
			for (var a = 1; a < AScompA.length; a++) {
				if (!What(AScompA[a] + 'Comp.Race')) {
					prefix = AScompA[a];
					break;
				}
			}
		}
		if (!prefix) prefix = DoTemplate('AScomp', 'Add');
		Value(prefix + 'Comp.Race', compName);
		var changeMsg = "The " + compName + " has been added to the companion page at page number " + (tDoc.getField(prefix + 'Comp.Race').page + 1);
		CurrentUpdates.types.push("notes");
		if (!CurrentUpdates.notesChanges) {
			CurrentUpdates.notesChanges = [changeMsg];
		} else {
			CurrentUpdates.notesChanges.push(changeMsg);
		}
		return prefix;
	},
	remove : function (compName) {
		var AScompA = isTemplVis('AScomp') ? What('Template.extras.AScomp').split(',') : false;
		if (!AScompA) return;
		compName = compName.toLowerCase();
		for (var a = 1; a < AScompA.length; a++) {
			if (What(AScompA[a] + 'Comp.Race').toLowerCase().indexOf(compName) !== -1) {
				DoTemplate("AScomp", "Remove", AScompA[a], true);
			}
		}
	},
	find : function (compName) {
		var AScompA = isTemplVis('AScomp') ? What('Template.extras.AScomp').split(',') : false;
		var prefixes = [];
		if (!AScompA) return prefixes;
		compName = compName.toLowerCase();
		for (var a = 1; a < AScompA.length; a++) {
			if (What(AScompA[a] + 'Comp.Race').toLowerCase().indexOf(compName) !== -1) prefixes.push(AScompA[a]);
		}
		return prefixes;
	}
};

// Add two subclasses for Wizard
// Chronurgy Magic
AddSubClass("wizard", "chronurgy magic-egtw", {
	regExpSearch : /^((?=.*chronurgy)(?=.*(wizard|magic|mage))|chronomancer|chronurgist).*$/i,
	subname : "Chronurgy Magic",
	source : ["W", 184],
	fullname : "Chronurgist",
	features : {
		"subclassfeature2" : {
			name : "Chronal Shift",
			source : ["W", 184],
			minlevel : 2,
			description : "\n   " + "As a reaction, me or creature I can see within 30ft can reroll an attack, ability check or saving throw (after seeing the result) target must use second roll. I can do this twice per long rest.",
			action : [["reaction", ""]],
			usages : 2,
			recovery : "long rest"
		},
		"subclassfeature2.1" : {
			name : "Temporal Awareness",
			source : ["W", 184],
			minlevel : 2,
			description : "\n   " + "I gain a bonus to my initiative rolls equal to my Intelligence modifier",
			addMod : { type : "skill", field : "Init", mod : "max(Int|0)", text : "I can add my Intelligence modifier to initiative rolls." }
		},
		"subclassfeature6" : {
			name : "Momentary Stasis",
			source : ["W", 184],
			minlevel : 6,
			description : "\n   " + "As an action large or smaller creature within 60ft makes Constitution save or creature is incapacitated with speed of 0 until the end of my next turn (damage removes the effect). Minimum once.",
			action : [["action", ""]],
			usages : "Intelligence modifier per ",
			usagescalc : usagescalcStr("Int"),
			recovery : "long rest"
		},
		"subclassfeature10" : {
			name : "Arcane Abeyance",
			source : ["W", 184],
			minlevel : 10,
			description : "\n   " + "Once per short/long rest I can cast a spell of 4th level or lower into a grey bead with AC 15 and 1 HP for 1 hr (immune to poison and psyhic). Using an action a creature holding the bead can release the spell as if they cast it but using the my spell attack / DC.",
			usages: 1,
			recovery: "short rest"
		},
		"subclassfeature14" : {
			name : "Convergent Future",
			source : ["W", 185],
			minlevel : 14,
			description : "\n   " + "As a reaction when I or a creature I can see within 60ft makes an attack roll, ability check or saving throw I can ignore the die roll and decide if number rolled is min needed to succeed or 1 less than that number. When I use this feature I gain 1 level of exhaustion which can only be removed by a long rest.",
			action : [["reaction", ""]]
		}
	}
});
// Graviturgy Magic
AddSubClass("wizard", "graviturgy magic-egtw", {
	regExpSearch : /^((?=.*graviturgy)(?=.*(wizard|magic|mage))|gravimancer|graviturgist).*$/i,
	subname : "Graviturgy Magic",
	source : ["W", 185],
	fullname : "Graviturgist",
	features : {
		"subclassfeature2" : {
			name : "Adjust Density",
			source : ["W", 185],
			minlevel : 2,
			description : "\n   " + "As an action I can halve or double the weight of a large or smaller crea. or obj. within 30ft for 1 min (requires concentration). Crea. of halved weight has extra 10ft of movement and jumps twice as far, disadv. Str checks and saving throws. Crea. of doubled weight has 10ft less movement adv. Str checks and saving throws. At 10th level the target can be huge or smaller.",				
			action : [["action", ""]]
		},
		"subclassfeature6" : {
			name : "Gravity Well",
			source : ["W", 185],
			minlevel : 6,
			description : "\n   " + "Whenever I cast a spell on a creature I can move it 5ft to an unoccupied space. If the creature is not willing I must succeed the spell attack or they must fail the saving throw.",
			},
		"subclassfeature10" : {
			name : "Violent Attraction",
			source : ["W", 185],
			minlevel : 10,
			description : "\n   " + "As a reaction I can add 1d10 to a creatures weapon attack or reduce a creatures fall damage by 2d10 if within 60ft. Minimum once.",	
			action : [["reaction", ""]],
			usages : "Intelligence modifier per ",
			usagescalc : usagescalcStr("Int"),
			recovery : "long rest"
		},
		"subclassfeature14" : {
			name : "Event Horizon",
			source : ["W", 185],
			minlevel : 14,
			description : "\n   " + "As an action (requires concentration) hostile crea. within 30ft make Str saving throw or take 2d10 Force dmg and speed is 0 until start of its next turn. Half dmg is taken on a save and movement is halved. Can cast once per long rest without a spell slot, requires a 3rd level or higher slot thereafter.",action : [["action", ""]],
			usages : 1,
			recovery: "long rest",
			altResource : "SS 3+",
		}
	}
});

// Backgrounds
BackgroundList["grinner"] = {
	regExpSearch : /^(?=.*grinner).*$/i,
	name : "Grinner",
	source : ["W", 200],
	skills : ["Deception", "Performance"],
	gold : 15,
	equipleft : [
		["Disguise kit", "", 3],
		["Musical instrument of your choice", "", ""]
	],
	equipright : [
		["Fine clothes", "", 6],
		["Gold-plated ring with smiling face", "", ""],
		["Belt pouch (with coins)", "", 1]
	],
	feature : "Ballad of the Grinning Fool",
	trait : [
		"I love the spotlight. Everyone, look at me!",
		"Give me a drink am I'm your friend.",
		"Talk to me about yourself. I'm a hell of a listener.",
		"I hate to start fights, but I love to finish them.",
		"I can't sit still.",
		"I'm always humming an old tune from my past.",
		"When I don't have a reason to smile, I'm miserable.",
		"I'm lucky like you wouldn't believe."
	],
	ideal : [
		["Revolution",
			"Revolution: Tyrants must fall, no matter the cost. (Chaotic)"
		],
		["Compassion",
			"Compassion: The only way to make a better world is to perform small kindnesses. (Good)"
		],
		["Justice",
			"Justice: A nation built upon just foundations will uphold freedom for all. (Law)"
		],
		["Expression",
			"Expression: Music, joy, and laughter are the keys to freedom. (Good)"
		],
		["Self-Determination",
			"Self-Determination: People should be free to do as they please. (Chaotic)"
		],
		["Vigilance",
			"Vigilance: A free people must be carefully taught, lest they be misled. (Neutral)"
		]
	],
	bond : [
		"I lost someone important to an agent of the empire. That regime will fall.",
		"The first people to be hurt by this war will be the common folk. I need to protect them.",
		"Music helped me through a dark time in my life. Now, I'll use music to change the world.",
		"I will be known as the greatest spy who ever lived.",
		"All life is precious to me. I know I can change the world without taking a humanoid life.",
		"The elite in their ivory towers don't understand how we suffer. I intend to show them."
	],
	flaw : [
		"I've never lied once in my life. What? No, I'm not crossing my fingers!",
		"I do everything big! Subtlety? I don't know the meaning of subtlety! Oh, that's a problem?",
		"Being a spy in wartime is painful. I've seen so much suffering, I think I'm losing my mind.",
		"I can't focus on my mission. I just want to carouse and sing and play!",
		"Yeah, that's my name. Yeah, I'm a Grinner spy. Who cares about staying undercover?",
		"I can't afford to trust anyone. Not. Anyone."
	],
	extra : [
		"Select Your Favorite Code-Song",
		"Zan's Coming Back",
		"Blow Fire Down the Coast",
		"Hush! Onward Come the Dragons",
		"Let the Sword Grow Rust",
		"Drink Deep, Li'l Hummingbird",
		"Dirge for the Emerald Fire"
	],
	toolProfs : ["Thieves' tools", ["Musical instrument", 1]],
	lifestyle : "modest"
};
BackgroundFeatureList["ballad of the grinning fool"] = {
	description : "Like every Grinner, you know how to find a hideout. In any city of 10,000 people or more on the Menagerie Coast or in the lands of the Dwendalian Empire, you can play the \"Ballad of the Grinning Fool\" in a major tavern or inn. A member of the Golden Grin will find you and give shelter to you and any companions you vouch for. This shelter might be discontinued if it becomes too dangerous to hide you, at the DM's discretion. This feature must be used with caution, for not all who know the ballad are your friends. Some are traitors, counterspies, or agents of tyranny.",
	source : ["EGtW", 200]
};
BackgroundList["volstrucker agent"] = {
	regExpSearch : /^(?=.*volstrucker)(?=.*agent).*$/i,
	name : "Volstrucker Agent",
	source : ["W", 202],
	skills : ["Deception", "Stealth"],
	gold : 10,
	equipleft : [
		["Poisoner's kit", "", 2]
	],
	equipright : [
		["Common clothes", "", 3],
		["Black cloak with a hood", "", ""],
		["Belt pouch (with coins)", "", 1]
	],
	feature : "Shadow Network",
	trait : [
		"I prefer to keep my thoughts to myself.",
		"I indulge vice in excess to quiet my conscience.",
		"I've left emotion behind me, I'm now perfectly placid.",
		"Some event from the past keeps worming its way into my mind, making me restless.",
		"I always keep my word - except when I'm commanded to break it.",
		"I laugh off insults and never take them personally."
	],
	ideal : [
		["Order",
			"Order: The will of the crown is absolute. (Law)"
		],
		["True Loyalty",
			"True Loyalty: The Cerberus Assembly is greater than any power, even the crown. (Any)"
		],
		["Death",
			"Death: The penalty for disloyalty is death. (Evil)"
		],
		["Determination",
			"Determination: I cannot fail. Not ever. (Neutral)"
		],
		["Fear",
			"Fear: People should not respect power. They should fear it. (Evil)"
		],
		["Escape",
			"Escape: The Volstrucker are pure evil! I can't atone for what I've done for them, but I can escape with my life. (Any)"
		]
	],
	bond : [
		"The job is all that matters. I will see it through.",
		"My orders are important, but my comrades are worth more than anything. I would die for them.",
		"Everything I've done, I've done to protect someone close to me.",
		"If the empire falls, all of civilization falls with it. I will hold back the chaos and barbarism at any cost."
	],
	flaw : [
		"I drink to dull the pain in the back of my head.",
		"I go a bit mad when I see blood.",
		"I can hear the voices of everyone I've killed. I see their faces. I can't be free of these ghosts.",
		"Fear is a powerful motivator. I will do whatever it takes to prevent those who know what I am from seeing me fail, and those I care about from knowing what I am."
	],
	extra : [
		"Select Your Tragedy",
		"Familicide",
		"Amnesia",
		"Capture",
		"Starvation",
		"Disfigurement",
		"Vicissitude"
	],
	toolProfs : ["Poisoner's kit"],
	languageProfs : [1],
	lifestyle : "modest"
};
BackgroundFeatureList["shadow network"] = {
	description : "You have access to the Volstrucker shadow network, which allows you to communicate with other members of the order over long distances. If you write a letter in special arcane ink, address it to a member of the Volstrucker, and cast it into a fire, the letter will burn to cinders and materialize whole again on the person of the agent you addressed it to. The ink used to send a letter across the shadow network is the same as that used by a wizard to scribe spells in a spellbook. Writing a letter in this ink costs 10gp per page.",
	source : ["EGtW", 202]
};

// Add Races (TODO: Page numbers)
// Dragonborn
var breathWeaponDesc = function (dmgType, shape) {
    var shapeStr = shape === "line" ? "5 ft by 30 ft line" : "15 ft cone";
    var capitailzedDmgType = dmgType.charAt(0).toUpperCase() + dmgType.slice(1);
    var saveStat = ["cold", "poison"].indexOf(dmgType) >= 0 ? "Con" : "Dex";
    return capitailzedDmgType + " Breath Weapon: As an action once per short rest, I can deal 2d6 " + dmgType + " damage to all in a " + shapeStr + ", " + saveStat + " save halves (DC 8 + Con mod + prof bonus).\nThis damage increases to 3d6 at level 6, 4d6 at level 11, and 5d6 at level 16.";
};
var draconicAncestryFeature = {
    name: "Draconic Ancestry",
    source: [["SRD", 5], ["P", 34]],
    limfeaname: "Breath Weapon",
    minlevel: 1,
    usages: 1,
    additional: levels.map(function (n) {
        return (n < 6 ? 2 : n < 11 ? 3 : n < 16 ? 4 : 5) + 'd6';
    }),
    recovery: "short rest" /* ShortRest */,
    action: [['action', ""]],
    calcChanges: {
        atkAdd: [
            function (fields, v) {
                if (v.theWea.dbBreathWeapon && (CurrentRace.known === 'ravenite' || CurrentRace.known === 'draconblood')) {
                    fields.Damage_Die = (CurrentRace.level < 6 ? 2 : CurrentRace.level < 11 ? 3 : CurrentRace.level < 16 ? 4 : 5) + 'd6';
                    if (CurrentRace.variant) {
                        fields.Damage_Type = CurrentRace.breathDmgType;
                        fields.Description = fields.Description.replace(/(dex|con) save/i, ((/cold|poison/i).test(CurrentRace.breathDmgType) ? 'Con' : 'Dex') + ' save');
                        fields.Range = (/black|blue|brass|bronze|copper/i).test(CurrentRace.variant) ? '5-ft \u00D7 30-ft line' : '15-ft cone';
                    }
                }
            }
        ]
    }
};
var breathWeaponObj = {
    regExpSearch: /^(?=.*breath)(?=.*weapon).*$/i,
    name: "Breath weapon",
    source: [["SRD", 5], ["P", 34]],
    ability: 3,
    type: 'Natural',
    damage: [2, 6, 'fire'],
    range: "15-ft cone",
    description: "Hits all in area; Dex save, success - half damage; Usable only once per short rest",
    abilitytodamage: false,
    dc: true,
    dbBreathWeapon: true
};
var acidBreath = breathWeaponDesc("acid", "line");
var lightningBreath = breathWeaponDesc("lightning", "line");
var coneFireBreath = breathWeaponDesc("fire", "cone");
var coldBreath = breathWeaponDesc("cold", "cone");

// Draconblood
var forcefulPresenceStr = "Forceful Presence: Once per short rest, I can give myself adv. on an Intimidation or Persuasion check.";
RaceList["draconblood"] = {
	regExpSearch : /^(?=.*draconblood)(?=.*dragonborn)?.*$/i,
	name : "Draconblood Dragonborn",
	sortname : "Dragonborn, Draconblood",
	source : [["W", 168]],
	plural : "Draconblood Dragonborn",
	size : 3,
	speed : {
		walk : { spd : 30, enc : 20 }
	},
	languageProfs : ["Common", "Draconic"],
	vision : [["Darkvision", 60]],
    weaponOptions: [breathWeaponObj],
	weaponsAdd : ["Breath Weapon"],
	age : " reach adulthood by 15 and live around 80 years",
	height : " stand well over 6 feet tall (5'6\" + 2d8\")",
	weight : " weigh around 240 lb (175 + 2d8 \xD7 2d6 lb)",
	heightMetric : " stand well over 1,8 metres tall (170 + 5d8 cm)",
	weightMetric : " weigh around 110 kg (80 + 5d8 \xD7 4d6 / 10 kg)",
	scores : [0, 0, 0, 2, 0, 1],
	trait : "Draconblood Dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		"Draconic Ancestry: Choose one type of dragon using the \"Racial Options\" button. I gain a breath weapon as determined by the dragon type chosen.",
		forcefulPresenceStr
	]),
    features: {
        "draconic ancestry": draconicAncestryFeature,
        "forceful presence": {
            name: "Forceful Presence",
            source: [["W", 168]],
            minlevel: 1,
            usages: 1,
            recovery: "short rest" /* ShortRest */
        }
    },
	variants : []
};
AddRacialVariant("draconblood", "black", {
	regExpSearch : /black/i,
	name : "Black draconblood dragonborn",
	trait : "Black draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		acidBreath,
		forcefulPresenceStr
	]),
	breathDmgType : "acid"
});
AddRacialVariant("draconblood", "blue", {
	regExpSearch : /blue/i,
	name : "Blue draconblood dragonborn",
	trait : "Blue draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		lightningBreath,
		forcefulPresenceStr
	]),
	breathDmgType : "lightning"
});
AddRacialVariant("draconblood", "brass", {
	regExpSearch : /brass/i,
	name : "Brass draconblood dragonborn",
	trait : "Brass draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		breathWeaponDesc("fire", "line"),
		forcefulPresenceStr
	]),
	breathDmgType : "fire"
});
AddRacialVariant("draconblood", "bronze", {
	regExpSearch : /bronze/i,
	name : "Bronze draconblood dragonborn",
	trait : "Bronze draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		lightningBreath,
		forcefulPresenceStr
	]),
	breathDmgType : "lightning"
});
AddRacialVariant("draconblood", "copper", {
	regExpSearch : /copper/i,
	name : "Copper draconblood dragonborn",
	trait : "Copper draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		acidBreath,
		forcefulPresenceStr
	]),
	breathDmgType : "acid"
});
AddRacialVariant("draconblood", "gold", {
	regExpSearch : /gold/i,
	name : "Gold draconblood dragonborn",
	trait : "Gold draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		coneFireBreath,
		forcefulPresenceStr
	]),
	breathDmgType : "fire"
});
AddRacialVariant("draconblood", "green", {
	regExpSearch : /green/i,
	name : "Green draconblood dragonborn",
	trait : "Green draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		breathWeaponDesc("poison", "cone"),
		forcefulPresenceStr
	]),
	breathDmgType : "poison"
});
AddRacialVariant("draconblood", "red", {
	regExpSearch : /red/i,
	name : "Red draconblood dragonborn",
	trait : "Red draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		coneFireBreath,
		forcefulPresenceStr
	]),
	breathDmgType : "fire"
});
AddRacialVariant("draconblood", "silver", {
	regExpSearch : /silver/i,
	name : "Silver draconblood dragonborn",
	trait : "Silver draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		coldBreath,
		forcefulPresenceStr
	]),
	breathDmgType : "cold"
});
AddRacialVariant("draconblood", "white", {
	regExpSearch : /white/i,
	name : "White draconblood dragonborn",
	trait : "White draconblood dragonborn (+2 Intelligence, +1 Charisma)" + desc([
		coldBreath,
		forcefulPresenceStr
	]),
	breathDmgType : "cold"
});

// Ravenite
var vengefulAssaultStr = "Vengeful Assault: When I take damage from a creature in range of a weapon that I'm holding, I can use my reaction to make an attack. This can be used once per short rest.";
RaceList["ravenite"] = {
	regExpSearch : /^(?=.*ravenite)(?=.*dragonborn)?.*$/i,
	name : "Ravenite Dragonborn",
	sortname : "Dragonborn, Ravenite",
	source : [["W", 169]],
	plural : "Ravenite Dragonborn",
	size : 3,
	speed : {
		walk : { spd : 30, enc : 20 }
	},
	languageProfs : ["Common", "Draconic"],
	vision : [["Darkvision", 60]],
    weaponOptions: [breathWeaponObj],
	weaponsAdd : ["Breath Weapon"],
	age : " reach adulthood by 15 and live around 80 years",
	height : " stand well over 6 feet tall (5'6\" + 2d8\")",
	weight : " weigh around 240 lb (175 + 2d8 \xD7 2d6 lb)",
	heightMetric : " stand well over 1,8 metres tall (170 + 5d8 cm)",
	weightMetric : " weigh around 110 kg (80 + 5d8 \xD7 4d6 / 10 kg)",
	scores : [2, 1, 0, 0, 0, 0],
	trait : "Ravenite Dragonborn (+2 Strength, +1 Constitution)" + desc([
		"Draconic Ancestry: Choose one type of dragon using the \"Racial Options\" button. I gain a breath weapon as determined by the dragon type chosen.",
		vengefulAssaultStr
	]),
    features: {
        "draconic ancestry": draconicAncestryFeature,
        "vengeful assault": {
            name: "Vengeful Assault",
            source: [["W", 168]],
            minlevel: 1,
            usages: 1,
            action: [['reaction', ""]],
            recovery: "short rest"
        }
    },
	variants : []
};
AddRacialVariant("ravenite", "black", {
	regExpSearch : /black/i,
	name : "Black ravenite dragonborn",
	trait : "Black ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		acidBreath,
		vengefulAssaultStr
	]),
	breathDmgType : "acid"
});
AddRacialVariant("ravenite", "blue", {
	regExpSearch : /blue/i,
	name : "Blue ravenite dragonborn",
	trait : "Blue ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		lightningBreath,
		vengefulAssaultStr
	]),
	breathDmgType : "lightning"
});
AddRacialVariant("ravenite", "brass", {
	regExpSearch : /brass/i,
	name : "Brass ravenite dragonborn",
	trait : "Brass ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		breathWeaponDesc("fire", "line"),
		vengefulAssaultStr
	]),
	breathDmgType : "fire"
});
AddRacialVariant("ravenite", "bronze", {
	regExpSearch : /bronze/i,
	name : "Bronze ravenite dragonborn",
	trait : "Bronze ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		lightningBreath,
		vengefulAssaultStr
	]),
	breathDmgType : "lightning"
});
AddRacialVariant("ravenite", "copper", {
	regExpSearch : /copper/i,
	name : "Copper ravenite dragonborn",
	trait : "Copper ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		acidBreath,
		vengefulAssaultStr
	]),
	breathDmgType : "acid"
});
AddRacialVariant("ravenite", "gold", {
	regExpSearch : /gold/i,
	name : "Gold ravenite dragonborn",
	trait : "Gold ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		coneFireBreath,
		vengefulAssaultStr
	]),
	breathDmgType : "fire"
});
AddRacialVariant("ravenite", "green", {
	regExpSearch : /green/i,
	name : "Green ravenite dragonborn",
	trait : "Green ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		breathWeaponDesc("poison", "cone"),
		vengefulAssaultStr
	]),
	breathDmgType : "poison"
});
AddRacialVariant("ravenite", "red", {
	regExpSearch : /red/i,
	name : "Red ravenite dragonborn",
	trait : "Red ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		coneFireBreath,
		vengefulAssaultStr
	]),
	breathDmgType : "fire"
});
AddRacialVariant("ravenite", "silver", {
	regExpSearch : /silver/i,
	name : "Silver ravenite dragonborn",
	trait : "Silver ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		coldBreath,
		vengefulAssaultStr
	]),
	breathDmgType : "cold"
});
AddRacialVariant("ravenite", "white", {
	regExpSearch : /white/i,
	name : "White ravenite dragonborn",
	trait : "White ravenite dragonborn (+2 Strength, +1 Constitution)" + desc([
		coldBreath,
		vengefulAssaultStr
	]),
	breathDmgType : "cold"
});


// Sea Elf
RaceList["sea elf"] = { 
	regExpSearch : /^(?!.*half)((?=.*\b(elfs?|elves|elvish|elven)\b)(?=.*\b(seas?|oceans?|water)\b)).*$/i,
	name : "Sea elf",
	sortname : "Elf, Sea",
	source : [["MToF", 62], ["UA:ES", 1], ["W", 0]],
	plural : "Sea elves",
	size : 3,
	speed : {
		walk : { spd : 30, enc : 20 },
		swim : { spd : 30, enc : 20 }
	},
	weaponProfs : [false, false, ["spear", "trident", "light crossbow", "net"]],
	languageProfs : ["Common", "Elvish", "Aquan"],
	vision : [["Darkvision", 60]],
	savetxt : {
		text : ["Magic can't put me to sleep"],
		adv_vs : ["charmed"]
	},
    skills: ["perception" /* Perception */],
	age : " typically claim adulthood around age 100 and can live to be 750 years old",
	height : " range from under 5 to almost 6 feet tall (4'6\" + 2d8\")",
	weight : " weigh around 115 lb (90 + 2d8 \xD7 1d4 lb)",
	heightMetric : " range from under 1,5 to almost 1,8 metres tall (140 + 5d8 cm)",
	weightMetric : " weigh around 52 kg (40 + 5d8 \xD7 2d4 / 10 kg)",
	scores : [0, 2, 1, 0, 0, 0],
	trait : "Sea Elf (+2 Dexterity, +1 Constitution)" + desc([
		"Trance: Elves don't need to sleep, but meditate semiconsciously, for 4 hours a day. While meditating, I can dream after a fashion. After resting in this way, I gain the same benefit that a human does from 8 hours of sleep, thus needing only 4 hours for a long rest.",
		"Child of the Sea. I have 30 ft swimming speed and can breathe air and water.",
		"Friend of the Sea: Through sounds and gestures, I can communicate simple ideas with any beast that has an inborn swimming speed."
	])
};
// Pallid Elf
RaceList["pallid elf"] = {
	regExpSearch : /^(?!.*half)((?=.*\b(elfs?|elves|elvish|elven)\b)(?=.*\b(pallid|pale)\b)).*$/i,
	name : "Pallid Elf",
	sortname : "Elf, Pallid",
	source : ["W", 200],
	plural : "Pallid Elves",
	size : 3,
	speed : {
		walk : { spd : 30, enc : 20 }
	},
	languageProfs : ["Common", "Elvish"],
	vision : [["Darkvision", 60], ["Adv. on Intelligence (Investigation) and Wisdom (Insight) checks", ""]],
	savetxt : {
		text : ["Magic can't put me to sleep"],
		adv_vs : ["charmed"]
	},
	skills : ["Perception"],
	age : " typically claim adulthood around age 100 and can live to be 750 years old",
	height : " range from under 5 to over 6 feet tall (4'6\" + 2d10\")",
	weight : " weigh around 110 lb (90 + 2d10 \xD7 1d4 lb)",
	heightMetric : " range from under 1,5 to 1,7 metres tall (137 + 5d10 cm)",
	weightMetric : " weigh around 50 kg (40 + 5d10 \xD7 2d4 / 10 kg)",
	improvements : "Pallid Elf: +2 Dexterity, +1 Wisdom;",
	scores : [0, 2, 0, 0, 1, 0],
	trait : "Pallid Elf (+2 Dexterity, +1 Wisdom)\nTrance: Elves don't need to sleep, but meditate semiconsciously, for 4 hours a day. This gives the same benefit as a human gets from 8 hours of sleep (long rest takes only 4 hours).\nIncisive Sense: I have advantage on Intelligence (Investigation) and Wisdom (Insight) checks.\nBlessing of the Moonweaver: 1st level: Light cantrip; 3rd level: Sleep; 5th level: Invisibility. I can cast both spells on myself once per long rest without material components, using Wisdom as my spellcasting ability for these.", // errata to specify once per day is long rest
	abilitySave : 5,
	spellcastingAbility : 5,
	spellcastingBonus : {
		name : "Blessing of the Moonweaver (level 1)",
		spells : ["light"],
		selection : ["light"],
		atwill : true
	},
	features : {
		"sleep" : {
			name : "Sleep",
			minlevel : 3,
			usages : 1,
			recovery : "long rest",
			tooltip : " (Blessing of the Moonweaver)",
			action : ["action", ""],
			spellcastingBonus : {
				name : "Blessing of the Moonweaver (level 3)",
				spells : ["sleep"],
				selection : ["sleep"],
				oncelr : true
			}
		},
		"invisibility" : {
			name : "Invisibility (self only)",
			minlevel : 5,
			usages : 1,
			recovery : "long rest",
			tooltip : " (Blessing of the Moonweaver)",
			action : ["action", ""],
			spellcastingBonus : {
				name : "Blessing of the Moonweaver (level 5)",
				spells : ["invisibility"],
				selection : ["invisibility"],
				oncelr : true
			}
		}
	}
};

//Lotusden Halfling
RaceList["lotusden halfling"] = {
	regExpSearch : /^(?=.*\b(halflings?|hobbits?)\b)(?=.*lotusden).*$/i,
	name : "Halfling (Lotusden)",
	sortname : "Halfling, Lotusden",
	source : [["W", 164]],
	plural : "Halflings (Lotusden)",
	size : 4,
	speed : {
		walk : { spd : 25, enc : 15 }
	},
	languageProfs : ["Common", "Halfling"],
	savetxt : { adv_vs : ["frightened"] },
	age : " reach adulthood at age 20 and live around 150 years",
	height : " average about 3 feet tall (2'7\" + 2d4\")",
	weight : " weigh around 40 lb (35 + 2d4 lb)",
	heightMetric : " average about 90 cm tall (80 + 5d4)",
	weightMetric : " weigh around 18 kg (16 + 5d4 / 10 kg)",
	scores : [0, 2, 0, 0, 1, 0],
	//trait is probably too long, I will need to edit it down
	trait : "Lotusden Halfling (+2 Dexterity, +1 Wisdom)" + (typePF ? "\n" : " ") + "Lucky: When I roll a 1 on an attack roll, ability check, or saving throw, I can reroll the die and must use the new roll." + (typePF ? "\n" : " ") + "Halfling Nimbleness: I can move through the space of any creature that is of a size larger than me." + (typePF ? "\n" : " ") + "Child of the Wood: I know the Druidcraft cantrip. I can cast Entangle once per long rest at 3rd level, and Spike Growth once per long rest at 5th level. Wisdom is my spellcasting ability for these." + (typePF ? "\n" : " ") + "Timberwalk: Ability checks to track me have disadv. I can ignore difficult terrain made of nonmagical plants and undergrowth.",
	spellcastingAbility : 5,
	spellcastingBonus : {
		name : "Child of the Wood",
		spells : ["druidcraft"],
		selection : ["druidcraft"],
		firstCol : 'atwill'
	},
	features : {
		"entangle" : {
			name : "Child of the Wood (level 3)",
			limfeaname : "Entangle",
			minlevel : 3,
			usages : 1,
			recovery : "long rest",
			spellcastingBonus : {
				name : "Child of the Wood (level 3)",
				spells : ["entangle"],
				selection : ["entangle"],
				firstCol : 'oncelr'
			}
		},
		"spike growth" : {
			name : "Child of the Wood (level 5)",
			limfeaname : "Spike Growth",
			minlevel : 5,
			usages : 1,
			recovery : "long rest",
			spellcastingBonus : {
				name : "Child of the Wood (level 5)",
				spells : ["spike growth"],
				selection : ["spike growth"],
				firstCol : 'oncelr'
			},
			spellChanges : {
				"spike growth" : {
					components : "V,S",
					compMaterial : "",
					changes : "Using Child of the Wood, I can cast Spike Growth once per long rest without requiring material components."
				}
			}
		}
	}
};

// Add Spells (entries by Biggoron144)
SpellsList["sapping sting"] = { 
	name : "Sapping Sting",
	classes : ["wizard"],
	source : ["W", 189],
	level : 0,
	school : "Necro",
	time : "1 a",
	range : "30 ft",
	components : "V/S",
	duration : "Instantaneous",
	save : "Con",
	description : "1 visible crea 1d4 Necrotic dmg and fall prone; +1d4 at CL 5, 11, and 17",
	descriptionFull :  "You sap the vitality of one creature you can see in range. The target must succeed on a Constitution saving throw or take 1d4 necrotic damage and fall prone." + "\n " + "This spell's damage increases by 1d4 when you reach 5th level (2d4), 11th level (3d4), and 17th level (4d4)."
};
SpellsList["gift of alacrity"] = { 
	name : "Gift of Alacrity",
	classes : ["wizard"],
	source : ["W", 186],
	level : 1,
	school : "Divin",
	time : "1 min",
	range : "Touch",
	components : "V/S",
	duration : "8 h",
	description :  "You touch a willing creature. For the duration, the target can add 1d8 to its initiative rolls.",
	descriptionFull :  "You touch a willing creature. For the duration, the target can add 1d8 to its initiative rolls."
};
SpellsList["magnify gravity"] = { 
	name : "Magnify Gravity",
	classes : ["wizard"],
	source : ["W", 188],
	level : 1,
	school : "Trans",
	time : "1 a",
	range : "60 ft",
	components : "V/S",
	duration : "1 r",
	description : "10-ft rad 2d8+1d8/SL Force dmg, hlf spd unt. e.o.n.t. Save half+no spd red. Str chk to move free objs.",
	descriptionFull :  "The gravity in a 10-foot-radius sphere centered on a point you can see within range increases for a moment. Each creature in the sphere on the turn when you cast the spell must make a Constitution saving throw. On a failed save, a creature takes 2d8 force damage, and its speed is halved until the end of its next turn. On a successful save, a creature takes half as much damage and suffers no reduction to its speed." + "\n " + "Until the start of your next turn, any object that isn't being worn or carried in the sphere requires a successful Strength check against your spell save DC to pick up or move." + AtHigherLevels + "When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st."
};
SpellsList["fortune's favor"] = { 
	name : "Fortune's Favor",
	classes : ["wizard"],
	source : ["W", 186],
	level : 2,
	school : "Divin",
	time : "1 min",
	range : "Touch",
	components : "V/S/M",
	compMaterial : "a white pearl worth at least 100 gp, which the spell consumes",
	duration : "1 h",
	description : "1+1/SL crea end effect to roll add. d20 for atk roll/abl. chk./sav. throw or enemy atk. roll against it.",
	descriptionFull : "You impart latent luck to yourself or one willing creature you can see within range. When the chosen creature makes an attack roll, an ability check, or a saving throw before the spell ends, it can dismiss this spell on itself to roll an additional d20 and choose which of the d20s to use. Alternatively, when an attack roll is made against the chosen creature, it can dismiss this spell on itself to roll a d20 and choose which of the d20s to use, the one it rolled or the one the attacker rolled." + "\n" + "If the original d20 roll has advantage or disadvantage, the creature rolls the additional d20 after advantage or disadvantage has been applied to the original roll." + AtHigherLevels + "When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd."
};
SpellsList["immovable object"] = { 
	name : "Immovable Object",
	classes : ["wizard"],
	source : ["W", 187],
	level : 2,
	school : "Trans",
	time : "1 a",
	range : "Touch",
	components : "V/S/M",
	compMaterial : "gold dust worth at least 25 gp, which the spell consumes",
	duration : "1 h",
	description : "1 obj <10lb fixed in place. Obj can hold <4000lb. Chosen move it; others str chk. DC 10. Psw. access 1m.",
	descriptionFull : "You touch an object that weighs no more than 10 pounds and cause it to become magically fixed in place. You and the creatures you designate when you cast this spell can move the object normally. You can also set a password that, when spoken within 5 feet of the object, suppresses this spell for 1 minute." + "\n" + "If the object is fixed in the air, it can hold up to 4,000 pounds of weight. More weight causes the object to fall. Otherwise, a creature can use an action to make a Strength check against your spell save DC. On a success, the creature can move the object up to 10 feet." + AtHigherLevels + "If you cast this spell using a spell slot of 4th or 5th level, the DC to move the object increases by 5, it can carry up to 8,000 pounds of weight, and the duration increases to 24 hours. If you cast this spell using a spell slot of 6th level or higher, the DC to move the object increases by 10, it can carry up to 20,000 pounds of weight, and the effect is permanent until dispelled."
};
SpellsList["wristpocket"] = { 
	name : "Wristpocket",
	classes : ["wizard"],
	source : ["W", 190],
	ritual : true,
	level : 2,
	school : "Conj",
	time : "1 a",
	range : "Self",
	components : "S",
	duration : "Conc, 1 h",
	description : "1 held obj <5 lb disappear to alt. dim. 1 a to summon obj to hand or return. Obj appears at feet at end.",
	descriptionFull : "You flick your wrist, causing one object in your hand to vanish. The object, which only you can be holding and can weigh no more than 5 pounds, is transported to an extradimensional space, where it remains for the duration." + "\n" + "Until the spell ends, you can use your action to summon the object to your free hand, and you can use your action to return the object to the extradimensional space. An object still in the pocket plane when the spell ends appears in your space, at your feet."
};
SpellsList["pulse wave"] = { 
	name : "Pulse Wave",
	classes : ["wizard"],
	source : ["W", 188],
	level : 3,
	school : "Evoc",
	time : "1 a",
	range : "Self",
	components : "V/S",
	duration : "Instantaneous",
	save : "Con",
	description : "30-ft cone 6d6+1d6/SL Force dmg, pull/push 15+5/SL ft; Save hlf/no move.",
	descriptionFull : "You create intense pressure, unleash it in a 30-foot cone, and decide whether the pressure pulls or pushes creatures and objects. Each creature in that cone must make a Constitution saving throw. A creature takes 6d6 force damage on a failed save, or half as much damage on a successful one. And every creature that fails the save is either pulled 15 feet toward you or pushed 15 feet away from you, depending on the choice you made for the spell." + "\n" + "In addition, unsecured objects that are completely within the cone are likewise pulled or pushed 15 feet." + AtHigherLevels + "When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 and the distance pulled or pushed increases by 5 feet for each slot level above 3rd."
};
SpellsList["gravity sinkhole"] = { 	
	name : "Gravity Sinkhole", 
	classes : ["wizard"], 	
	source : ["W", 187], 	
	level : 4, 	
	school : "Evoc", 	
	time : "1 a", 	
	range : "120 ft", 	
	components : "V,S,M", 	
	compMaterial : "black marble", 	
	duration : "Instantaneous", 
	save : "Con", 	
	description : "20-ft sphere save or take 5d10 Force dmg and pulled to center of sphere even in air", 	
	descriptionMetric : "6-m sphere save or take 5d10 Force dmg and pulled to center of sphere even in air", 	
	descriptionFull : "A 20-foot-radius sphere of crushing force forms at a point you can see within range and tugs at the creatures there. Each creature in the sphere must make a Constitution saving throw. On a failed save, the creature takes 5d10 force damage and is pulled in a straight line toward the center of the sphere, ending in an unoccupied space as close to the center as possible (even if that space is in the air). On a successful save, the creature takes half as much damage and isn't pulled." + AtHigherLevels + "When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d10 for each slot level above 4th.",
};
SpellsList["temporal shunt"] = { 	
	name : "Temporal Shunt", 	
	classes : ["wizard"], 	
	source : ["W", 189], 	
	level : 5, 	
	school : "Trans", 	
	time : "1 rea", 	
	range : "120 ft", 	
	components : "V,S", 	
	duration : "1 rnd", 
	save : "Wis", 	
	description : "1+1/SL attacking or casting crea vanish; spells are wasted; targets don't remember", 	
	descriptionMetric : "1+1/SL attacking or casting crea vanish; spells are wasted; targets don't remember", 	
	descriptionFull : "You target the triggering creature, which must succeed on a Wisdom saving throw or vanish, being thrown to another point in time and causing the attack to miss or the spell to be wasted. At the start of its next turn, the target reappears where it was or in the closest unoccupied space. The target doesn't remember you casting the spell or being affected by it." + AtHigherLevels + "When you cast this spell using a spell slot of 6th level or higher, you can target one additional creature for each slot level above 5th. All targets must be within 30 feet of each other.",
};
SpellsList["gravity fissure"] = { 	
	name : "Gravity Fissure", 	
	source : ["W", 187], 		
	level : 6, 	
	school : "Evoc", 	
	time : "1 a", 	
	range : "100-ft line", 	
	components : "V,S,M", 	
	compMaterial : "Fistful of iron filings", 	
	duration : "Instantaneous", 
	save : "Con", 	
	description : "100-ft line crea save or take 8d8 Force dmg; Crea within 10-ft also take dmg and pulled", 	
	descriptionMetric : "30-m line crea save or take 8d8 Force dmg; Crea within 10-ft also take dmg and pulled", 	
	descriptionFull : "You manifest a ravine of gravitational energy in a line originating from you that is 100 feet long and 5 feet wide. Each creature in that line must make a Constitution saving throw, taking 8d8 force damage on a failed save, or half as much damage on a successful one. Each creature within 10 feet of the line but not in it must succeed on a Constitution saving throw or take 8d8 force damage and be pulled toward the line until the creature is in its area." + AtHigherLevels + "When you cast this spell using a spell slot of 7th level or higher, the damage increases by 1d8 for each slot level above 6th.",
};
SpellsList["tether essence"] = { 	
	name : "Tether Essence", 
	classes : ["wizard"], 	
	source : ["W", 189], 		
	level : 7, 	
	school : "Necro", 	
	time : "1 a", 	
	range : "60 ft", 	
	components : "V,S,M\u2020", 	
	compMaterial : "250gp platinum cord which is consumed", 	
	duration : "Conc, 1 hr", 
	save : "Con", 
	description : "2 crea linked and take the same dmg and healing for duration or until 0 hp; Disadv if within 30-ft", 
	descriptionMetric : "2 crea linked and take the same dmg and healing for duration or until 0 hp; Disadv if within 9-m", 
	descriptionFull : "Two creatures you can see within range must make a Constitution saving throw, with disadvantage if they are within 30 feet of each other. Either creature can willingly fail the save. If either save succeeds, the spell has no effect. If both saves fail, the creatures are magically linked for the duration, regardless of the distance between them. When damage is dealt to one of them, the same damage is dealt to the other one. If hit points are restored to one of them, the same number of hit points are restored to the other one. If either of the tethered creatures is reduced to 0 hit points, the spell ends on both. If the spell ends on one creature, it ends on both", 
};
SpellsList["dark star"] = { 
	name : "Dark Star",
	classes : ["wizard"],
	source : ["W", 186],
	level : 8,
	school : "Evoc",
	time : "1 a",
	range : "150 ft",
	components : "V/S/M",
	compMaterial : "A shard of onyx and a drop of the caster's blood, both of which the spell consumes",
	duration : "Conc, 1 m",
	save : "Con",
	description : "40-ft rad 8d10 Force dmg ea turn, save half; darkness/silence/dif. ter./hit unc. crea disintegrate",
	descriptionFull :  "This spell creates a sphere centered on a point you choose within range. The sphere can have a radius of up to 40 feet. The area within this sphere is filled with magical darkness and crushing gravitational force." + "\n " + "For the duration, the spell's area is difficult terrain. A creature with darkvision can't see through the magical darkness, and nonmagical light can't illuminate it. No sound can be created within or pass through the area. Any creature or object entirely inside the sphere is immune to thunder damage, and creatures are deafened while entirely inside it. Casting a spell that includes a verbal component is impossible there." + "\n " + "Any creature that enters the spell's area for the first time on a turn or starts its turn there must make a Constitution saving throw. The creature takes 8d10 force damage on a failed save, or half as much damage on a successful one. A creature reduced to 0 hit points by this damage is disintegrated. A disintegrated creature and everything it is wearing and carrying, except magic items, are reduced to a pile of fine gray dust. " 
};
SpellsList["reality break"] = { 	
	name : "Reality Break", 		
	classes : ["wizard"], 	
	source : ["W", 189], 		
	level : 8, 	
	school : "Conj", 	
	time : "1 a", 	
	range : "60 ft", 	
	components : "V,S,M", 	
	compMaterial : "Crystal prism", 	
	duration : "Conc, 1 min", 
	save : "Wis", 	
	description : "Crea save or can't take reactions and at start of turn roll 1d10 on reality break table and suffer effects", 	
	descriptionMetric : "Crea save or can't take reactions and at start of turn roll 1d10 on reality break table and suffer effects", 	
	descriptionFull : "You shatter the barriers between realities and timelines, thrusting a creature into turmoil and madness. The target must succeed on a Wisdom saving throw, or it can't take reactions until the spell ends. The affected target must also roll a d10 at the start of each of its turns; the number rolled determines what happens to the target, as shown on the Reality Break Effects table. At the end of each of its turns, the affected target can repeat the Wisdom saving throw, ending the spell on itself on a success."
                      + "\n   " + "1-2 Vision of the Far Realm: The target takes 6d12 psychic damage, and it is stunned until the end of the turn."
					  + "\n   " + "3-5 Rending Rift: The target must make a Dexterity saving throw, taking 8d12 force damage on a failed save, or half as much damage on a successful one."
					  + "\n   " + "6-8 Wormhole: The target is teleported, along with everything it is wearing and carrying, up to 30 feet to an unoccupied space of your choice that you can see. The target also takes 10d12 force damage and is knocked prone."
					  + "\n   " + "9-10 Chill of the Dark Void: The target takes 10d12 cold damage, and it is blinded until the end of the turn",
};
SpellsList["ravenous void"] = { 	
	name : "Ravenous Void", 		
	classes : ["wizard"], 	
	source : ["W", 188], 		
	level : 9, 	
	school : "Evoc", 	
	time : "1 a", 	
	range : "1000 ft", 	
	components : "V,S,M", 	
	compMaterial : "Small 9 pointed iron star", 	
	duration : "Conc, 1 min", 
	save : "Str", 	
	description : "20-ft sphere, 100-ft dif. ter; crea save or 5d10 Force dmg pull and restrained, obj. pull and destroyed", 	
	descriptionMetric : "6-m sphere, 30-m dif. ter; crea save or 5d10 Force dmg pull and restrained, obj. pull and destroyed", 	
	descriptionFull : "You create a 20-foot-radius sphere of destructive gravitational force centered on a point you can see within range. For the spell's duration, the sphere and any space within 100 feet of it are difficult terrain, and nonmagical objects fully inside the sphere are destroyed if they aren't being worn or carried. When the sphere appears and at the start of each of your turns until the spell ends, unsecured objects within 100 feet of the sphere are pulled toward the sphere's center, ending in an unoccupied space as close to the center as possible. A creature that starts its turn within 100 feet of the sphere must succeed on a Strength saving throw or be pulled straight toward the sphere's center, ending in an unoccupied space as close to the center as possible. A creature that enters the sphere for the first time on a turn or starts its turn there takes 5d10 force damage and is restrained until it is no longer in the sphere. If the sphere is in the air, the restrained creature hovers inside the sphere. A creature can use its action to make a Strength check against your spell save DC, ending this restrained condition on itself or another creature in the sphere that it can reach. A creature reduced to 0 hit points by this spell is annihilated, along with any nonmagical items it is wearing or carrying.",
};
SpellsList["time ravage"] = { 	
	name : "Time Ravage", 	
	classes : ["wizard"], 	
	source : ["W", 189], 		
	level : 9, 	
	school : "Necro", 	
	time : "1 a", 	
	range : "90 ft", 	
	components : "V,S,M\u2020", 	
	compMaterial : "Hourglass filled with 5000gp diamond dust which is consumed", 	
	duration : "Instantaneous", 
	save : "Con", 	
	description : "Crea take 10d12 Necro Dmg and aged; save half dmg and not aged", 	
	descriptionMetric : "Crea take 10d12 Necro Dmg and aged; save half dmg and not aged", 	
	descriptionFull : "You target a creature you can see within range, putting its physical form through the devastation of rapid aging. The target must make a Constitution saving throw, taking 10d12 necrotic damage on a failed save, or half as much damage on a successful one. If the save fails, the target also ages to the point where it has only 30 days left before it dies of old age. In this aged state, the target has disadvantage on attack rolls, ability checks, and saving throws, and its walking speed is halved. Only the wish spell or the greater restoration cast with a 9th-level spell slot can end these effects and restore the target to its previous age.",
};

//Add Magic Items (contributed by kat9137 [discord] aka sophiechiabatta [github])

//Vestiges of Divergence
MagicItemsList["danoth's visor"] = {
	name : "Danoth's Visor",
	source : ["W", 270],
	type : "wondrous item",
	rarity : "legendary",
	attunement : true,
	description : "These mithral-frame goggles with clear diamond lenses were used by the evoker Danoth Oro to spot invisible enemies and scout areas from afar. See notes page for more information.",
	choices : ["dormant state", "awakened state", "exaulted state"],
	"dormant state" : {
		name : "Danoth's Visor: Dormant",
		vision : [["Danoth's Visor", "fixed 60"]],
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Danoth's Visor",
			note : "\n  \u2022 Dormant State (EGtW 270)" + desc([
				"The wearer can see normally in darkness, both magical and nonmagical, to a distance of 60 feet.",
				"The wearer has advantage on Intelligence (Investigation) and Wisdom (Perception) checks that rely on sight.",
			])  
		}]
	},
	"awakened state" : {
		name : "Danoth's Visor: Awakened",
		vision : [["Danoth's Visor", "fixed 60"]],
		action : [["bonus action", " (see thru matter)"], ["bonus action", " (spyglass mode)"]], 
		extraLimitedFeatures : [{
			name : "Danoth's Visor (see thru matter)",
			usages : 1,
			recovery : "dawn"
		}],
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Danoth's Visor",
			note : "\n  \u2022 Dormant State (EGtW 270)" + desc([
				"The wearer can see normally in darkness, both magical and nonmagical, to a distance of 60 feet.",
				"The wearer has advantage on Intelligence (Investigation) and Wisdom (Perception) checks that rely on sight.",
			]) + "\n  \u2022 Awakened State (EGtW 270)" + desc([
				"The wearer sees invisible creatures and objects within 60 feet as if they were visible, and they can see into the Ethereal Plane.",
				"Using a bonus action, the wearer can speak a command word and use the goggles to see into and through solid matter. This vision has a radius of 60 feet and lasts for 1 minute. The vision can penetrate 1 foot of stone, 1 inch of common metal, or up to 3 feet of wood or dirt. Thicker substances block the vision, as does a thin sheet of lead. This property can't be used again until the next dawn.",	
				"As a bonus action, the wearer can speak a command word to switch the goggles into spyglass mode. While in this mode, creatures and objects viewed through the goggles are magnified to twice their size.",
			]) 
		}]
	},
	"exaulted state" : {
		name : "Danoth's Visor: Exaulted",
		vision : [["Danoth's Visor", "fixed 60"]],
		action : [["action", " (Antimagic Field)"], ["bonus action", " (see thru matter)"], ["bonus action", " (spyglass mode)"]],
		extraLimitedFeatures : [{
			name : "Danoth's Visor (see thru matter)",
			usages : 1,
			recovery : "dawn"
		}, {
			name : "Danoth's Visor (Antimagic Field)",
			usages : 1,
			recovery : "dawn"
		}],
		spellcastingAbility : "class",
		spellcastingBonus : {
			name : "Once per dawn",
			spells : ["antimagic field"],
			selection : ["antimagic field"],
			firstCol : 'oncelr',
			times : 1
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Danoth's Visor",
			note : "\n  \u2022 Dormant State (EGtW 270)" + desc([
				"The wearer can see normally in darkness, both magical and nonmagical, to a distance of 60 feet.",
				"The wearer has advantage on Intelligence (Investigation) and Wisdom (Perception) checks that rely on sight.",
			]) + "\n  \u2022 Awakened State (EGtW 270)" + desc([
				"The wearer sees invisible creatures and objects within 60 feet as if they were visible, and they can see into the Ethereal Plane.",
				"Using a bonus action, the wearer can speak a command word and use the goggles to see into and through solid matter. This vision has a radius of 60 feet and lasts for 1 minute. The vision can penetrate 1 foot of stone, 1 inch of common metal, or up to 3 feet of wood or dirt. Thicker substances block the vision, as does a thin sheet of lead. This property can't be used again until the next dawn.",	
				"As a bonus action, the wearer can speak a command word to switch the goggles into spyglass mode. While in this mode, creatures and objects viewed through the goggles are magnified to twice their size.",
			]) + "\n  \u2022 Exaulted State (EGtW 270)" + desc([
				"The wearer automatically detects illusions he or she can see and automatically succeeds on saving throws against them. In addition, they see a bright aura around any creature that isn't in its true form.",
				"As an action, the wearer can cast the antimagic field spell from the visor. This property can't be used again until the next dawn.",
			]) 
		}]
	}
};

MagicItemsList["hide of the feral guardian"] = {
	name : "Hide of the Feral Guardian",
	source : ["W", 271],
	type : "armor (studded leather)",
	rarity : "legendary",
	attunement : true,
	description : "It is believed that this polished and beautifully detailed leather armor was a gift from Melora, bestowed on a long-forgotten archdruid and champion of the natural world before the terrors of the Calamity. See notes page for more info.",
	extraLimitedFeatures : [{
			name : "Hide of the Feral Guardian (Polymorph)",
			usages : 1,
			recovery : "dawn"
		}],
	choices : ["dormant state", "awakened state", "exaulted state"],
	"dormant state" : {
		name : "Hide of the Feral Guardian: Dormant",
		armorAdd : "Hide of the Feral Guardian",
		armorOptions : {
			regExpSearch : /^(?=.*hide)(?=.*feral)(?=.*guardian).*$/i,
			name : "Hide of the Feral Guardian",
			source : ["W", 271],
			type : "light",
			ac : 13,
			weight : 13,
		},
		action : [["action", " (polymorph)"]],
		spellcastingBonus : [{
			name : "1/LR no spell slot",
			spells : ["polymorph"],
			selection : ["polymorph"],
			firstCol : "oncelr",
		}],
		spellChanges : {
			"polymorph" : {
				name : "Polymorph (special)",
				range : "Self",
				description : "I transform into a giant owl, but I keep my Int, Wis, Cha.",
				changes : "Using my Hide of the Feral Guardian, I can cast Polymorph once per dawn without using a spell slot, but when I do so I can only cast it on myself and transform into a giant owl. I keep my Int, Wis, Cha."
			},
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Hide of the Feral Guardian",
			note : "\n  \u2022 Dormant State (EGtW 271)" + desc([
				"The armor grants you a +1 bonus to AC.",
				"While you are transformed by an effect that replaces any of your game statistics with those of another creature, you have a +1 bonus to melee attack and damage rolls, and you retain the benefits of this armor.",
				"As an action, you can use the armor to cast polymorph on yourself, transforming into a giant owl while retaining your Intelligence, Wisdom, and Charisma scores. This property can’t be used again until the next dawn.",
			])  
		}]
	},
	"awakened state" : {
		name : "Hide of the Feral Guardian: Awakened",
		armorAdd : "Hide of the Feral Guardian: Awakened",
		armorOptions : {
			regExpSearch : /^(?=.*hide)(?=.*feral)(?=.*guardian).*$/i,
			name : "Hide of the Feral Guardian: Awakened",
			source : ["W", 271],
			type : "light",
			ac : 14,
			weight : 13,
		},
		action : [["action", " (polymorph)"]],
		spellcastingBonus : [{
			name : "1/LR no spell slot",
			spells : ["polymorph"],
			selection : ["polymorph"],
			firstCol : "oncelr",
		}],
		spellChanges : {
			"polymorph" : {
				name : "Polymorph (special)",
				range : "Self",
				description : "I transform into a giant owl/cave bear (polar bear), but I keep my Int, Wis, Cha.",
				changes : "Using my Hide of the Feral Guardian, I can cast Polymorph once per dawn without using a spell slot, but when I do so I can only cast it on myself and transform into a giant owl or a cave bear (polar bear). I keep my Int, Wis, Cha."
			},
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Hide of the Feral Guardian",
			note : "\n  \u2022 Awakened State (EGtW 271)" + desc([
				"The armor grants you a +2 bonus to AC.",
				"While you are transformed by an effect that replaces any of your game statistics with those of another creature, you have a +2 bonus to melee attack and damage rolls, and you retain the benefits of this armor.",
				"As an action, you can use the armor to cast polymorph on yourself, transforming into a giant owl or a cave bear (polar bear) while retaining your Intelligence, Wisdom, and Charisma scores. This property can’t be used again until the next dawn.",
			]) 
		}]
	},
	"exaulted state" : {
		name : "Hide of the Feral Guardian: Exaulted",
		armorAdd : "Hide of the Feral Guardian: Exaulted",
		armorOptions : {
			regExpSearch : /^(?=.*hide)(?=.*feral)(?=.*guardian).*$/i,
			name : "Hide of the Feral Guardian: Exaulted",
			source : ["W", 271],
			type : "light",
			ac : 15,
			weight : 13,
		},
		action : [["action", " (polymorph)"]],
		spellcastingBonus : [{
			name : "1/LR no spell slot",
			spells : ["polymorph"],
			selection : ["polymorph"],
			firstCol : "oncelr",
		}],
		spellChanges : {
			"polymorph" : {
				name : "Polymorph (special)",
				range : "Self",
				description : "I transform into a giant owl/cave bear (polar bear)/guardian wolf, but I keep my Int, Wis, Cha.",
				changes : "Using my Hide of the Feral Guardian, I can cast Polymorph once per dawn without using a spell slot, but when I do so I can only cast it on myself and transform into a giant owl, cave bear (polar bear), or guardian wolf. I keep my Int, Wis, Cha."
			},
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Hide of the Feral Guardian",
			note : "\n  \u2022 Exaulted State (EGtW 271)" + desc([
				"The armor grants you a +3 bonus to AC.",
				"While you are transformed by an effect that replaces any of your game statistics with those of another creature, you have a +3 bonus to melee attack and damage rolls, and you retain the benefits of this armor.",
				"As an action, you can use the armor to cast polymorph on yourself, transforming into a giant owl, cave bear (polar bear), or guardian wolf while retaining your Intelligence, Wisdom, and Charisma scores. This property can’t be used again until the next dawn.",
			]) 
		}]
	}
};

MagicItemsList["infiltrator's key"] = {
	name : "Infiltrator's Key",
	source : ["W", 273],
	type : "wondrous item",
	rarity : "legendary",
	attunement : true,
	description : "This mithral skeleton key was forged using the blood of twelve master thieves executed for trying to steal magic items during the Age of Arcanum. See notes page for more information.",
	choices : ["dormant state", "awakened state", "exaulted state"],
	"dormant state" : {
		name : "Infiltrator's Key: Dormant",
		toolProfs : [["Thieves' tools", "Dex"]],
		eval : function () {
			if (CurrentMagicItems.known.indexOf("boots of elvenkind") !== -1) {
				SetProf("advantage", true, ["Stealth", true], "Infiltrator's Key (magic items)");
			}
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Infiltrator's Key",
			note : "\n  \u2022 Dormant State (EGtW 273)" + desc([
				"The key can be used as thieves’ tools for the purpose of opening locks. When using the key, you are considered proficient in thieves’ tools and you have advantage on ability checks made to open locks.",
				"While holding the key, your steps are muffled, giving you advantage on Dexterity (Stealth) checks made to move silently.",
			])  
		}]
	},
	"awakened state" : {
		name : "Infiltrator's Key: Awakened",
		toolProfs : [["Thieves' tools", "Dex"]],
		eval : function () {
			if (CurrentMagicItems.known.indexOf("boots of elvenkind") !== -1) {
				SetProf("advantage", true, ["Stealth", true], "Infiltrator's Key (magic items)");
			}
		},
		action : [["bonus action", " (transform dagger)"], ["bonus action", " (create opening)"]], 
		weaponsAdd : ["Infiltrator's Key"],
		weaponOptions : {
			baseWeapon : "dagger",
			regExpSearch : /^(?=.*infiltrators)(?=.*key).*$/i,
			name : "Infiltrator's Key",
			source : ["W", 273],
			range : "20/60 ft",
			damage : [1, 4, "piercing"],
			description : "Finesse, light, thrown",
			modifiers : [1, 1]
		},
		spellcastingAbility : "class",
		spellcastingBonus : {
			name : "Once per dawn",
			spells : ["alter self", "invisibility", "knock", "pass without trace"],
			selection : ["alter self", "invisibility", "knock", "pass without trace"],
			firstCol : 'oncelr',
			times : 4
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Infiltrator's Key",
			note : "\n  \u2022 Dormant State (EGtW 273)" + desc([
				"The key can be used as thieves’ tools for the purpose of opening locks. When using the key, you are considered proficient in thieves’ tools and you have advantage on ability checks made to open locks.",
				"While holding the key, your steps are muffled, giving you advantage on Dexterity (Stealth) checks made to move silently.",
			]) + "\n  \u2022 Awakened State (EGtW 273)" + desc([
				"While holding the key, you can use a bonus action to transform the key into a magic dagger or back into a key. While the key is in the form of a dagger, you gain a +1 bonus to attack and damage rolls made with it, and it returns to your hand immediately after it is used to make a ranged attack.",
				"While holding the key, you can use an action to cast one of the following spells from it: alter self, invisibility, knock, or pass without trace. Once a spell has been cast using the key, it can’t be used to cast that spell again until the next dawn.",		
			]) 
		}]
	},
	"exaulted state" : {
		name : "Infiltrator's Key: Exaulted",
		toolProfs : [["Thieves' tools", "Dex"]],
		eval : function () {
			if (CurrentMagicItems.known.indexOf("boots of elvenkind") !== -1) {
				SetProf("advantage", true, ["Stealth", true], "Infiltrator's Key (magic items)");
			}
		},
		action : [["bonus action", " (transform dagger)"], ["bonus action", " (create opening)"]], 
		weaponsAdd : ["Infiltrator's Key"],
		weaponOptions : {
			baseWeapon : "dagger",
			regExpSearch : /^(?=.*infiltrator)(?=.*key).*$/i,
			name : "Infiltrator's Key",
			source : ["W", 273],
			range : "20/60 ft",
			damage : [1, 4, "piercing"],
			description : "Finesse, light, thrown",
			modifiers : [1, 1]
		},
		spellcastingAbility : "class",
		spellcastingBonus : {
			name : "Once per dawn",
			spells : ["alter self", "invisibility", "knock", "pass without trace", "dimension door", "gaseous form", "mislead"],
			selection : ["alter self", "invisibility", "knock", "pass without trace", "dimension door", "gaseous form", "mislead"],
			firstCol : 'oncelr',
			times : 7
		},
		extraLimitedFeatures : [{
			name : "Infiltrator's Key (create opening)",
			usages : 1,
			recovery : "dawn"
		}],
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Infiltrator's Key",
			note : "\n  \u2022 Dormant State (EGtW 273)" + desc([
				"The key can be used as thieves’ tools for the purpose of opening locks. When using the key, you are considered proficient in thieves’ tools and you have advantage on ability checks made to open locks.",
				"While holding the key, your steps are muffled, giving you advantage on Dexterity (Stealth) checks made to move silently.",
			]) + "\n  \u2022 Awakened State (EGtW 273)" + desc([
				"While holding the key, you can use a bonus action to transform the key into a magic dagger or back into a key. While the key is in the form of a dagger, you gain a +1 bonus to attack and damage rolls made with it, and it returns to your hand immediately after it is used to make a ranged attack.",
				"While holding the key, you can use an action to cast one of the following spells from it: alter self, invisibility, knock, or pass without trace. Once a spell has been cast using the key, it can’t be used to cast that spell again until the next dawn.",		
			]) + "\n  \u2022 Exaulted State (EGtW 273)" + desc([
				"As a bonus action, you can touch the key to a floor, wall, or ceiling that is no more than 5 feet thick and cause a magical opening to appear in the surface. When you create the opening, you choose its length and width, up to 10 feet for each dimension. The opening lasts until the key passes through it to the other side, at which point it disappears (if a creature is in the opening when the doorway closes, the creature is safely shunted to the nearest unoccupied space). The key can’t be used to create another opening until the next dawn.",
				"While holding the key, you can use an action to cast one of the following spells from it: dimension door, gaseous form, or mislead. Once a spell has been cast using the key, it can’t be used to cast that spell again until the next dawn.",
			]) 
		}]
	}
};

MagicItemsList["stormgirdle"] = {
	name : "Stormgirdle",
	source : ["W", 273],
	type : "wondrous item",
	rarity : "legendary",
	attunement : true,
	choices : ["dormant state", "awakened state", "exaulted state"],
	"dormant state" : {
		name : "Stormgirdle: Dormant",
		description : "A wide belt of leather branded with the symbol of Kord. While attuned to and wearing this belt, I am resistant to lightning and thunder damage. My Strength score becomes 21, provided my Strength is not already 21 or higher. As an action, I can become a Storm Avatar for 1 minute. See notes page for more info.",
		scoresOverride : [21, 0, 0, 0, 0, 0],
		dmgres : [["Lightning"], ["Thunder"]],
		action : [["action", " (Storm Avatar)"], ["bonus action", " (Lightning Strike)"]],
		extraLimitedFeatures : [{
			name : "Storm Girdle (Storm Avatar)",
			usages : 1,
			recovery : "dawn"
		}],	
		weaponsAdd : ["Stormgirdle: Lightning Strike"],
		weaponOptions : {
			regExpSearch : /^(?=.*stormgirdle)(?=.*lightning)(?=.*strike).*$/i,
			name : "Stormgirdle: Lightning Strike",
			source : [["W", 273]],
			ability : 0,
			type : "Magic Item",
			damage : [3, 6, "lightning"],
			range : '30 ft',
			description : "Bonus action; Dex save, success - half damage",
			abilitytodamage : true,
			modifiers : ["dc+7", ""]
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Stormgirdle",
			note : "\n  \u2022 Dormant State (EGtW 273)" + desc([
				"You have resistance to lightning damage and thunder damage, and your Strength score becomes 21 if it isn’t already 21 or higher.",
				"You can use an action to become a Storm Avatar for 1 minute, gaining the following benefits for the duration. Once you use the girdle’s Storm Avatar property, that property can’t be used again until the next dawn.",
				"\u2022 You have immunity to lightning damage and thunder damage.",
				"\u2022 When you hit with a weapon attack that normally deals bludgeoning damage, it deals thunder damage instead. When you hit with a weapon attack that normally deals piercing or slashing damage, it deals lightning damage instead.",
				"\u2022 As a bonus action, you can choose one creature you can see within 30 feet of you to be struck by lightning. The target must make a DC 15 Dexterity saving throw, taking 3d6 lightning damage on a failed save, or half as much damage on a successful one.",
			])  
		}]
	},
	"awakened state" : {
		name : "Stormgirdle: Awakened",
		description : "A wide belt of leather branded with the symbol of Kord. While attuned to and wearing this belt, I am resistant to lightning and thunder damage. My Strength score becomes 23, provided my Strength is not already 23 or higher. As an action, I can become a Storm Avatar for 1 minute. See notes page for more info.",
		scoresOverride : [23, 0, 0, 0, 0, 0],
		dmgres : [["Lightning"], ["Thunder"]],
		action : [["action", " (Storm Avatar)"], ["bonus action", " (Lightning Strike)"]],
		extraLimitedFeatures : [{
			name : "Storm Girdle (Storm Avatar)",
			usages : 1,
			recovery : "dawn"
		}],	
		weaponsAdd : ["Stormgirdle: Lightning Strike"],
		weaponOptions : {
			regExpSearch : /^(?=.*stormgirdle)(?=.*lightning)(?=.*strike).*$/i,
			name : "Stormgirdle: Lightning Strike",
			source : [["W", 273]],
			ability : 0,
			type : "Magic Item",
			damage : [4, 6, "lightning"],
			range : '30 ft',
			description : "Bonus action; Dex save, success - half damage",
			abilitytodamage : true,
			modifiers : ["dc+7", ""]
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Stormgirdle",
			note : "\n  \u2022 Awakened State (EGtW 273)" + desc([
				"You have resistance to lightning damage and thunder damage, and your Strength score becomes 23 if it isn’t already 23 or higher.",
				"You can use an action to become a Storm Avatar for 1 minute, gaining the following benefits for the duration. Once you use the girdle’s Storm Avatar property, that property can’t be used again until the next dawn.",
				"\u2022 You have immunity to lightning damage and thunder damage.",
				"\u2022 When you hit with a weapon attack that normally deals bludgeoning damage, it deals thunder damage instead. When you hit with a weapon attack that normally deals piercing or slashing damage, it deals lightning damage instead.",
				"\u2022 As a bonus action, you can choose one creature you can see within 30 feet of you to be struck by lightning. The target must make a DC 15 Dexterity saving throw, taking 4d6 lightning damage on a failed save, or half as much damage on a successful one.",
				"\u2022 While transformed into a Storm Avatar, you gain a flying speed of 30 feet and can hover.",
			]) 
		}]
	},
	"exaulted state" : {
		name : "Stormgirdle: Exaulted",
		description : "A wide belt of leather branded with the symbol of Kord. While attuned to and wearing this belt, I am resistant to lightning and thunder damage. My Strength score becomes 25, provided my Strength is not already 25 or higher. As an action, I can become a Storm Avatar for 1 minute. See notes page for more info.",
		scoresOverride : [25, 0, 0, 0, 0, 0],
		dmgres : [["Lightning"], ["Thunder"]],
		action : [["action", " (Storm Avatar)"], ["bonus action", " (Lightning Strike)"]],
		extraLimitedFeatures : [{
			name : "Storm Girdle (Storm Avatar)",
			usages : 1,
			recovery : "dawn"
		}],	
		weaponsAdd : ["Stormgirdle: Lightning Strike"],
		weaponOptions : {
			regExpSearch : /^(?=.*stormgirdle)(?=.*lightning)(?=.*strike).*$/i,
			name : "Stormgirdle: Lightning Strike",
			source : [["W", 273]],
			ability : 0,
			type : "Magic Item",
			damage : [5, 6, "lightning"],
			range : '30 ft',
			description : "Bonus action; Dex save, success - half damage",
			abilitytodamage : true,
			modifiers : ["dc+7", ""]
		},
		spellcastingAbility : "class",
		spellcastingBonus : {
			name : "Once per dawn",
			spells : ["control weather"],
			selection : ["control weather"],
			firstCol : 'oncelr',
			times : 1
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Stormgirdle",
			note : "\n  \u2022 Dormant State (EGtW 273)" + desc([
				"You have resistance to lightning damage and thunder damage, and your Strength score becomes 25 if it isn’t already 25 or higher.",
				"You can use an action to become a Storm Avatar for 1 minute, gaining the following benefits for the duration. Once you use the girdle’s Storm Avatar property, that property can’t be used again until the next dawn.",
				"\u2022 You have immunity to lightning damage and thunder damage.",
				"\u2022 When you hit with a weapon attack that normally deals bludgeoning damage, it deals thunder damage instead. When you hit with a weapon attack that normally deals piercing or slashing damage, it deals lightning damage instead.",
				"\u2022 As a bonus action, you can choose one creature you can see within 30 feet of you to be struck by lightning. The target must make a DC 15 Dexterity saving throw, taking 5d6 lightning damage on a failed save, or half as much damage on a successful one.",
				"\u2022 While transformed into a Storm Avatar, you gain a flying speed of 30 feet and can hover.",
				"You can cast the control weather spell from the girdle. This property can’t be used again until the next dawn.",
			])
		}]
	}
};

MagicItemsList["verminshroud"] = {
	name : "Verminshroud",
	source : ["W", 273],
	type : "wondrous item",
	rarity : "legendary",
	description : "This patchy cloak was pieced together from the pelts of rats found feasting on the dead in Blightshore and is dotted with the bloated corpses of magically preserved insects along its seams. See notes page for more info.",
	attunement : true,
	savetxt : { immune : ["disease"] },
	vision : [["Darkvision", "fixed 60"], ["Darkvision", "+60"]],
	extraLimitedFeatures : [{
		name : "Verminshroud (Polymorph)",
		usages : 1,
		recovery : "dawn"
	}],
	choices : ["dormant state", "awakened state", "exaulted state"],
	"dormant state" : {
		name : "Verminshroud: Dormant",
		action : [["action", " (polymorph)"]],
		spellcastingBonus : [{
			name : "1/LR no spell slot",
			spells : ["polymorph"],
			selection : ["polymorph"],
			firstCol : "oncelr",
		}],
		spellChanges : {
			"polymorph" : {
				name : "Polymorph (special)",
				range : "Self",
				description : "I transform into a rat or giant rat, but I keep my Int, Wis, Cha.",
				changes : "Using Verminshroud, I can cast Polymorph once per dawn without using a spell slot, but when I do so I can only cast it on myself and transform into a rat or giant rat. I keep my Int, Wis, Cha."
			},
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Verminshroud",
			note : "\n  \u2022 Dormant State (EGtW 273)" + desc([
				"You have advantage on Wisdom (Perception) checks that rely on smell, you are immune to disease, and you have darkvision out to a range of 60 feet. If you already have darkvision, wearing the cloak increases the range of your darkvision by 60 feet.",
				"As an action, you can use the verminshroud to cast polymorph on yourself, transforming into a giant rat or rat while retaining your Intelligence, Wisdom, and Charisma scores, as well as the properties of the cloak. This property can’t be used again until the next dawn.",
			])  
		}]
	},
	"awakened state" : {
		name : "Verminshroud: Awakened",
		action : [["action", " (polymorph)"], ["action", " (insect plague)"]],
		dmgres : [["Poison"]],
		fixedDC : 15,
		action : [["action", " (insect plague)"]],
		extraLimitedFeatures : [{
			name : "Verminshroud (Insect Plague)",
			usages : 1,
			recovery : "dawn"
		}],
		spellcastingBonus : [{
			name : "Once per dawn",
			spells : ["polymorph", "insect plague"],
			selection : ["polymorph", "insect plague"],
			firstCol : "oncelr",
			times : 2
		}],
		spellChanges : {
			"polymorph" : {
				name : "Polymorph (special)",
				range : "Self",
				description : "I transform into a rat, giant rat, or giant wasp, but I keep my Int, Wis, Cha.",
				changes : "Using Verminshroud, I can cast Polymorph once per dawn without using a spell slot, but when I do so I can only cast it on myself and transform into a rat, giant rat, or giant wasp. I keep my Int, Wis, Cha."
			},
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Verminshroud",
			note : "\n  \u2022 Dormant State (EGtW 273)" + desc([
				"You have advantage on Wisdom (Perception) checks that rely on smell, you are immune to disease, and you have darkvision out to a range of 60 feet. If you already have darkvision, wearing the cloak increases the range of your darkvision by 60 feet.",
				"As an action, you can use the verminshroud to cast polymorph on yourself, transforming into a giant rat or rat while retaining your Intelligence, Wisdom, and Charisma scores, as well as the properties of the cloak. This property can’t be used again until the next dawn.",
			]) + "\n  \u2022 Awakened State (EGtW 273)" + desc([
				"You have resistance to poison damage.",
				"You can use an action to cast the insect plague spell (save DC 15) from the verminshroud, requiring no material components. This property can’t be used again until the next dawn.",		
				"When you cast the polymorph spell using the verminshroud, you can transform into a giant wasp.",
			]) 
		}]
	},
	"exaulted state" : {
		name : "Verminshroud: Exaulted",
		action : [["action", " (polymorph)"], ["action", " (insect plague)"]],
		dmgres : [["Poison"]],
		fixedDC : 15,
		speed : { climb : { spd : "walk", enc : "walk" } },
		extraLimitedFeatures : [{
			name : "Verminshroud (Insect Plague)",
			usages : 1,
			recovery : "dawn"
		}],
		spellcastingBonus : [{
			name : "Once per dawn",
			spells : ["polymorph", "insect plague"],
			selection : ["polymorph", "insect plague"],
			firstCol : "oncelr",
			times : 2
		}],
		spellChanges : {
			"polymorph" : {
				name : "Polymorph (special)",
				range : "Self",
				description : "I transform into a rat, giant rat, giant wasp, or giant scorpion, but I keep my Int, Wis, Cha.",
				changes : "Using Verminshroud, I can cast Polymorph once per dawn without using a spell slot, but when I do so I can only cast it on myself and transform into a rat, giant rat, giant wasp, or giant scorpion. I keep my Int, Wis, Cha."
			},
		},
		weaponsAdd : ["Verminshroud: Bite"],
		weaponOptions : {
			baseWeapon : "unarmed strike",
			regExpSearch : /^(?=.*verminshroud)(?=.*bite).*$/i,
			name : "Verminshroud: Bite",
			source : ["W", 273],
			damage : [1, 6, "piercing"],
			description : "Bonus action; DC17 Con save, failure - poisoned 1 min; repeat save end of their turn",
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Verminshroud",
			note : "\n  \u2022 Dormant State (EGtW 273)" + desc([
				"You have advantage on Wisdom (Perception) checks that rely on smell, you are immune to disease, and you have darkvision out to a range of 60 feet. If you already have darkvision, wearing the cloak increases the range of your darkvision by 60 feet.",
				"As an action, you can use the verminshroud to cast polymorph on yourself, transforming into a giant rat or rat while retaining your Intelligence, Wisdom, and Charisma scores, as well as the properties of the cloak. This property can’t be used again until the next dawn.",
			]) + "\n  \u2022 Awakened State (EGtW 273)" + desc([
				"You have resistance to poison damage.",
				"You can use an action to cast the insect plague spell (save DC 15) from the verminshroud, requiring no material components. This property can’t be used again until the next dawn.",		
				"When you cast the polymorph spell using the verminshroud, you can transform into a giant wasp.",
			]) + "\n  \u2022 Exaulted State (EGtW 273)" + desc([
				"You gain a climbing speed equal to your walking speed.",
				"Your teeth become razor-sharp natural weapons, which you can use to make unarmed strikes. If you hit with them, you deal piercing damage equal to 1d6 + your Strength modifier, instead of the bludgeoning damage normal for an unarmed strike. You can make this attack as a bonus action. When you bite a creature and deal damage to it, the creature must succeed on a DC 17 Constitution saving throw or be poisoned for 1 minute. The target can repeat the saving throw at the end of each of its turns, ending the condition on itself on a success.",		
				"When you cast the polymorph spell using the verminshroud, you can transform into a giant scorpion.",
			])
		}]
	}
};

MagicItemsList["wreath of the Prism"] = {
	name : "Wreath of the Prism",
	source : ["W", 274],
	type : "wondrous item",
	rarity : "legendary",
	attunement : true,
	vision : [["Darkvision", "fixed 60"], ["Darkvision", "+60"]],
	choices : ["dormant state", "awakened state", "exaulted state"],
	"dormant state" : {
		name : "Wreath of the Prism: Dormant",
		description : "This loop of golden thorns is inset with dozens of gems representing the five colors of Tiamat. I gain darkvision to 60 ft, or extend my darkvision by 60 ft. When I hit a beast, dragon, or monstrosity of CR 5 or lower with an attack, I can cast dominate monster on that creature (save DC 13). See notes page for info.",
		fixedDC : 13,
		spellcastingBonus : [{
			name : "CR 5 or lower, DC 13",
			spells : ["dominate monster"],
			selection : ["dominate monster"],
		}],
		spellChanges : {
			"dominate monster" : {
				name : "Dominate Monster (special)",
				description : "Beast, dragon, or monstrosity, CR =<5, on attack hit (DC 13).",
				changes : "I can cast dominate monster on a beast, dragon, or monstrosity of CR 5 when I hit it with an attack (save DC 13). If I use the wreath to charm a second creature, the first spell immediately ends. When the spell ends, the target knows it was charmed by me."
			},
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Wreath of the Prism",
			note : "\n  \u2022 Dormant State (EGtW 274)" + desc([
				"You have darkvision out to a range of 60 feet. If you already have darkvision, wearing the wreath increases the range of your darkvision by 60 feet.",
				"When you hit a beast, dragon, or monstrosity of challenge rating 5 or lower with an attack, or when you grapple it, you can use the wreath to cast dominate monster on the creature (save DC 13). On a successful save, the target is immune to the power of the wreath for 24 hours. On a failure, a shimmering, golden image of the wreath appears as a collar around the target’s neck or as a crown on its head (your choice) until it is no longer charmed by the spell. If you use the wreath to charm a second creature, the first spell immediately ends. When the spell ends, the target knows it was charmed by you.",
			])  
		}]
	},
	"awakened state" : {
		name : "Wreath of the Prism: Awakened",
		description : "This loop of golden thorns is inset with dozens of gems representing the five colors of Tiamat. I gain darkvision to 60 ft, or extend my darkvision by 60 ft. When I hit a beast, dragon, or monstrosity of CR 10 or lower with an attack, I can cast dominate monster on that creature (save DC 15). See notes page for info.",
		fixedDC : 15,
		spellcastingBonus : [{
			name : "CR 10 or lower, DC 15",
			spells : ["dominate monster"],
			selection : ["dominate monster"],
		}],
		spellChanges : {
			"dominate monster" : {
				name : "Dominate Monster (special)",
				description : "Beast, dragon, or monstrosity, CR =<10, on attack hit (DC 15).",
				changes : "I can cast dominate monster on a beast, dragon, or monstrosity of CR 10 when I hit it with an attack (save DC 15). If I use the wreath to charm a second creature, the first spell immediately ends. When the spell ends, the target knows it was charmed by me."
			},
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Wreath of the Prism",
			note : "\n  \u2022 Awakened State (EGtW 274)" + desc([
				"You have darkvision out to a range of 60 feet. If you already have darkvision, wearing the wreath increases the range of your darkvision by 60 feet.",
				"When you hit a beast, dragon, or monstrosity of challenge rating 10 or lower with an attack, or when you grapple it, you can use the wreath to cast dominate monster on the creature (save DC 15). On a successful save, the target is immune to the power of the wreath for 24 hours. On a failure, a shimmering, golden image of the wreath appears as a collar around the target’s neck or as a crown on its head (your choice) until it is no longer charmed by the spell. If you use the wreath to charm a second creature, the first spell immediately ends. When the spell ends, the target knows it was charmed by you.",
			]) 
		}]
	},
	"exaulted state" : {
		name : "Wreath of the Prism: Exaulted",
		description : "This loop of golden thorns is inset with dozens of gems representing the five colors of Tiamat. I gain darkvision to 60 ft, or extend my darkvision by 60 ft. When I hit a beast, dragon, or monstrosity of CR 15 or lower with an attack, I can cast dominate monster on that creature (save DC 17). See notes page for info.",
		fixedDC : 17,
		spellcastingBonus : [{
			name : "CR 15 or lower, DC 17",
			spells : ["dominate monster"],
			selection : ["dominate monster"],
		}],
		spellChanges : {
			"dominate monster" : {
				name : "Dominate Monster (special)",
				description : "Beast, dragon, or monstrosity, CR =<15, on attack hit (DC 17).",
				changes : "I can cast dominate monster on a beast, dragon, or monstrosity of CR 15 when I hit it with an attack (save DC 17). If I use the wreath to charm a second creature, the first spell immediately ends. When the spell ends, the target knows it was charmed by me."
			},
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Wreath of the Prism",
			note : "\n  \u2022 Exaulted State (EGtW 274)" + desc([
				"You have darkvision out to a range of 60 feet. If you already have darkvision, wearing the wreath increases the range of your darkvision by 60 feet.",
				"When you hit a beast, dragon, or monstrosity of challenge rating 15 or lower with an attack, or when you grapple it, you can use the wreath to cast dominate monster on the creature (save DC 17). On a successful save, the target is immune to the power of the wreath for 24 hours. On a failure, a shimmering, golden image of the wreath appears as a collar around the target’s neck or as a crown on its head (your choice) until it is no longer charmed by the spell. If you use the wreath to charm a second creature, the first spell immediately ends. When the spell ends, the target knows it was charmed by you.",
			]) 
		}]
	}
};

MagicItemsList["grimoire infinitus"] = {
	name : "Grimoire Infinitus",
	source : ["W", 271],
	type : "wondrous item",
	rarity : "legendary",
	attunement : true,
	description : "Several of these spellbooks with gilded pages and silver-plated covers were created during the Age of Arcanum, but only one has been found since the Calamity ended. See notes page for more info.",
	prerequisite : "Requires attunement by a wizard",
	prereqeval : function (v) { return classes.known.wizard ? true : false; },
	spellcastingAbility : "class",
	spellcastingBonus : {
		spells : ["alarm", "antimagic field", "bigby's hand", "blight", "charm person", "confusion", "control weather", "create undead", "detect thoughts", "enlarge/reduce", "fear", "foresight", "gaseous form", "glyph of warding", "legend lore", "leomund's tiny hut", "mass suggestion", "mislead", "misty step", "mordenkainen's faithful hound"],
		selection : ["alarm", "antimagic field", "bigby's hand", "blight", "charm person", "confusion", "control weather", "create undead", "detect thoughts", "enlarge/reduce", "fear", "foresight", "gaseous form", "glyph of warding", "legend lore", "leomund's tiny hut", "mass suggestion", "mislead", "misty step", "mordenkainen's faithful hound"],
		times: 20
	},
	eval : function () {
		// get the CurrentSpells object or create it if it didn't exists yet.
		var spObj = CreateCurrentSpellsEntry("items", "grimoire infinitus");
		// now set some of the attributes for it, adding the 5 spells that didn't fit as spellcastingBonus
		spObj.typeSp = "known";
		spObj.known = { cantrips : 0, spells : 5 };
		spObj.list = { spells : ["prismatic spray", "ray of enfeeblement", "silent image", "teleport", "thunderwave"] };
		spObj.selectSp = ["prismatic spray", "ray of enfeeblement", "silent image", "teleport", "thunderwave"];
		spObj.typeList = 2;
	},
	removeeval : function () {
		if (CurrentSpells["grimoire infinitus"]) {
			// delete the CurrentSpells object
			delete CurrentSpells["grimoire infinitus"];
			SetStringifieds('spells');
			CurrentUpdates.types.push("spells");
		}
	},
	choices : ["dormant state", "awakened state", "exaulted state"],
	"dormant state" : {
		name : "Grimoire Infinitus: Dormant",
		calcChanges: {
			spellCalc: [
                function (type, spellcasters, ability) {
                    if (type == "prepare") return 1;
                },
			],
		},
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Grimoire Infinitus",
			note : "\n  \u2022 Dormant State (EGtW 274)" + desc([
				"Most of the book is blank, but the following spells are recorded in the first pages of the tome: alarm, antimagic field, Bigby's hand, blight, charm person, confusion, control weather, create undead, detect thoughts, enlarge/reduce, fear, foresight, gaseous form, glyph of warding, legend lore, Leomund's tiny hut, mass suggestion, mislead, misty step, Mordenkainen's faithful hound, prismatic spray, ray of enfeeblement, silent image, teleport, and thunderwave.",
				"You can use the grimoire as your spellbook, and you can scribe new spells into it as normal.",
				"When you prepare wizard spells using the grimoire, the number of wizard spells you can prepare increases by 1.",
			])  
		}]
	},
	"awakened state" : {
		name : "Grimoire Infinitus: Awakened",
		calcChanges: {
			spellCalc: [
                function (type, spellcasters, ability) {
                    if (type == "prepare") return 2;
                },
			],
		},
		savetxt : { adv_vs : ["spells and other magical effects"] },
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Grimoire Infinitus",
			note : "\n  \u2022 Awakened State (EGtW 274)" + desc([
				"Most of the book is blank, but the following spells are recorded in the first pages of the tome: alarm, antimagic field, Bigby's hand, blight, charm person, confusion, control weather, create undead, detect thoughts, enlarge/reduce, fear, foresight, gaseous form, glyph of warding, legend lore, Leomund's tiny hut, mass suggestion, mislead, misty step, Mordenkainen's faithful hound, prismatic spray, ray of enfeeblement, silent image, teleport, and thunderwave.",
				"You can use the grimoire as your spellbook, and you can scribe new spells into it as normal.",
				"When you prepare wizard spells using the grimoire, the number of wizard spells you can prepare increases by 2.",
				"While you carry the spellbook, you have advantage on saving throws against spells and magical effects.",
			]) 
		}]
	},
	"exaulted state" : {
		name : "Grimoire Infinitus: Exaulted",
		calcChanges: {
			spellCalc: [
                function (type, spellcasters, ability) {
                    if (type == "prepare") return 3;
                },
			],
		},
		savetxt : { adv_vs : ["spells and other magical effects"] },
		extraLimitedFeatures : [{
			name : "Arcane Recovery (Grimoire Infinitus)",
			usages : 1,
			recovery : "long rest"
		}],	
		toNotesPage : [{
			name : "Features",
			popupName : "Features of Grimoire Infinitus",
			note : "\n  \u2022 Exaulted State (EGtW 274)" + desc([
				"Most of the book is blank, but the following spells are recorded in the first pages of the tome: alarm, antimagic field, Bigby's hand, blight, charm person, confusion, control weather, create undead, detect thoughts, enlarge/reduce, fear, foresight, gaseous form, glyph of warding, legend lore, Leomund's tiny hut, mass suggestion, mislead, misty step, Mordenkainen's faithful hound, prismatic spray, ray of enfeeblement, silent image, teleport, and thunderwave.",
				"You can use the grimoire as your spellbook, and you can scribe new spells into it as normal.",
				"When you prepare wizard spells using the grimoire, the number of wizard spells you can prepare increases by 3.",
				"While you carry the spellbook, you have advantage on saving throws against spells and magical effects.",
				"You gain one additional use of your Arcane Recovery feature between long rests.",
			]) 
		}]
	}
};
