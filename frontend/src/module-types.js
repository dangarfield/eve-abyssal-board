export const getAbyssModuleTypesFlatIds = () => {
  const types = getAbyssModuleTypes()
  return types.flatMap((item) => item.categories.map((category) => category.typeId))
}
const RELEVANT_ATTRIBUTES = {
  microwarpdrive: [6, 147, 20, 30, 554, 50],
  afterburner: [6, 20, 30, 50],
  shield_extender: [72, 50, 30, 983],
  armor_plates: [50, 30, 796, 1159],
  shield_booster: [50, 30, 68, 6, 73],
  armor_repairer: [50, 30, 84, 6, 73],
  ancil_shield_booster: [50, 30, 68, 6, 73, 1795],
  ancil_armor_repairer: [50, 30, 84, 6, 73, 1795],
  energy_neutralizer: [50, 30, 6, 54, 2044, 97],
  energy_nosferatu: [50, 30, 54, 2044, 90],
  cap_battery: [50, 30, 2267, 67],
  warp_scrambler: [50, 6, 54, 105],
  warp_disruptor: [50, 6, 54],
  stasis_webifier: [50, 30, 6, 54, 20],
  damage_mod: [50, 64, 204],
  damage_mod_bcs: [50, 213, 204],
  damage_control: [50, 974, 975, 976, 977],
  assault_damage_control: [50, 73, 974, 975, 976, 977],
  drone_damage_amplifier: [50, 1255],
  mutated_light_drone: [64, 160, 37, 263, 9, 54, 265, 158],
  mutated_heavy_drone: [64, 160, 37, 263, 9, 54, 265, 158],
  mutated_sentry_drone: [64, 160, 263, 9, 54, 265, 158],
  mutated_medium_drone: [64, 160, 37, 263, 9, 54, 265, 158],
  abyssal_fighter_support_unit: [2336, 2337, 2338, 50, 30, 2335],
  abyssal_siege_module: [2307, 2306, 2347, 2346, 30]
}
const RELEVANT_VALUE_GROUP_MAPPING = {
  47749: RELEVANT_ATTRIBUTES.afterburner,
  47769: RELEVANT_ATTRIBUTES.armor_repairer,
  47817: RELEVANT_ATTRIBUTES.armor_plates,
  47820: RELEVANT_ATTRIBUTES.armor_plates,
  47836: RELEVANT_ATTRIBUTES.ancil_shield_booster,
  47838: RELEVANT_ATTRIBUTES.ancil_shield_booster,
  47840: RELEVANT_ATTRIBUTES.ancil_shield_booster,
  47846: RELEVANT_ATTRIBUTES.ancil_armor_repairer,
  47781: RELEVANT_ATTRIBUTES.shield_booster,
  47804: RELEVANT_ATTRIBUTES.shield_extender,
  47808: RELEVANT_ATTRIBUTES.shield_extender,
  47828: RELEVANT_ATTRIBUTES.energy_neutralizer,
  47736: RELEVANT_ATTRIBUTES.warp_disruptor,
  47745: RELEVANT_ATTRIBUTES.microwarpdrive,
  47753: RELEVANT_ATTRIBUTES.afterburner,
  47757: RELEVANT_ATTRIBUTES.afterburner,
  47773: RELEVANT_ATTRIBUTES.armor_repairer,
  47789: RELEVANT_ATTRIBUTES.shield_booster,
  47832: RELEVANT_ATTRIBUTES.energy_neutralizer,
  47702: RELEVANT_ATTRIBUTES.stasis_webifier,
  47732: RELEVANT_ATTRIBUTES.warp_scrambler,
  47777: RELEVANT_ATTRIBUTES.armor_repairer,
  47785: RELEVANT_ATTRIBUTES.shield_booster,
  47800: RELEVANT_ATTRIBUTES.shield_extender,
  47812: RELEVANT_ATTRIBUTES.armor_plates,
  47824: RELEVANT_ATTRIBUTES.energy_neutralizer,
  47842: RELEVANT_ATTRIBUTES.ancil_armor_repairer,
  47844: RELEVANT_ATTRIBUTES.ancil_armor_repairer,
  47408: RELEVANT_ATTRIBUTES.microwarpdrive,
  47740: RELEVANT_ATTRIBUTES.microwarpdrive,
  47793: RELEVANT_ATTRIBUTES.shield_booster,
  48431: RELEVANT_ATTRIBUTES.cap_battery,
  48435: RELEVANT_ATTRIBUTES.cap_battery,
  48439: RELEVANT_ATTRIBUTES.cap_battery,
  48419: RELEVANT_ATTRIBUTES.energy_nosferatu,
  48423: RELEVANT_ATTRIBUTES.energy_nosferatu,
  48427: RELEVANT_ATTRIBUTES.energy_nosferatu,
  49730: RELEVANT_ATTRIBUTES.damage_mod,
  49722: RELEVANT_ATTRIBUTES.damage_mod,
  49726: RELEVANT_ATTRIBUTES.damage_mod,
  49738: RELEVANT_ATTRIBUTES.damage_mod_bcs,
  49734: RELEVANT_ATTRIBUTES.damage_mod,
  52227: RELEVANT_ATTRIBUTES.damage_control,
  52230: RELEVANT_ATTRIBUTES.assault_damage_control,
  60482: RELEVANT_ATTRIBUTES.drone_damage_amplifier,
  60478: RELEVANT_ATTRIBUTES.mutated_light_drone,
  60480: RELEVANT_ATTRIBUTES.mutated_heavy_drone,
  60481: RELEVANT_ATTRIBUTES.mutated_sentry_drone,
  60479: RELEVANT_ATTRIBUTES.mutated_medium_drone,
  60483: RELEVANT_ATTRIBUTES.abyssal_fighter_support_unit,
  56303: RELEVANT_ATTRIBUTES.warp_scrambler,
  56304: RELEVANT_ATTRIBUTES.warp_disruptor,
  56305: RELEVANT_ATTRIBUTES.afterburner,
  56306: RELEVANT_ATTRIBUTES.microwarpdrive,
  56307: RELEVANT_ATTRIBUTES.armor_repairer,
  56308: RELEVANT_ATTRIBUTES.ancil_armor_repairer,
  56309: RELEVANT_ATTRIBUTES.shield_booster,
  56310: RELEVANT_ATTRIBUTES.ancil_shield_booster,
  56311: RELEVANT_ATTRIBUTES.energy_nosferatu,
  56312: RELEVANT_ATTRIBUTES.energy_neutralizer,
  56313: RELEVANT_ATTRIBUTES.abyssal_siege_module
}

export const getRelevantDogmaAttributesForTypeId = (typeId) => {
  const mapping = RELEVANT_VALUE_GROUP_MAPPING[typeId]
  if (mapping === undefined) return RELEVANT_ATTRIBUTES.afterburner
  // console.log('mapping', mapping)
  return mapping
}
export const getAllRelevantDogmaAttributes = () => {
  const uniqueIntegers = new Set()
  for (const attributeKey in RELEVANT_ATTRIBUTES) {
    const integersArray = RELEVANT_ATTRIBUTES[attributeKey]
    integersArray.forEach((integer) => {
      uniqueIntegers.add(integer)
    })
  }
  return Array.from(uniqueIntegers)
}
export const getAbyssModuleTypes = () => {
  return [
    {
      group: 'Microwarpdrives',
      categories: [
        {
          categoryName: '5MN',
          typeId: 47740
        },
        {
          categoryName: '50MN',
          typeId: 47408
        },
        {
          categoryName: '500MN',
          typeId: 47745
        },
        {
          categoryName: '50000MN',
          typeId: 56306
        }
      ]
    },
    {
      group: 'Afterburners',
      categories: [
        {
          categoryName: '1MN',
          typeId: 47749
        },
        {
          categoryName: '10MN',
          typeId: 47753
        },
        {
          categoryName: '100MN',
          typeId: 47757
        },
        {
          categoryName: '10000MN',
          typeId: 56305
        }
      ]
    },
    {
      group: 'Shield Extenders',
      categories: [
        {
          categoryName: 'Small',
          typeId: 47800
        },
        {
          categoryName: 'Medium',
          typeId: 47804
        },
        {
          categoryName: 'Large',
          typeId: 47808
        }
      ]
    },
    {
      group: 'Armor Plates',
      categories: [
        {
          categoryName: 'Small',
          typeId: 47812
        },
        {
          categoryName: 'Medium',
          typeId: 47817
        },
        {
          categoryName: 'Large',
          typeId: 47820
        }
      ]
    },
    {
      group: 'Shield Boosters',
      categories: [
        {
          categoryName: 'Small',
          typeId: 47781
        },
        {
          categoryName: 'Medium',
          typeId: 47785
        },
        {
          categoryName: 'Large',
          typeId: 47789
        },
        {
          categoryName: 'X-Large',
          typeId: 47793
        },
        {
          categoryName: 'Capital',
          typeId: 56309
        }
      ]
    },
    {
      group: 'Armor Repairers',
      categories: [
        {
          categoryName: 'Small',
          typeId: 47769
        },
        {
          categoryName: 'Medium',
          typeId: 47773
        },
        {
          categoryName: 'Large',
          typeId: 47777
        },
        {
          categoryName: 'Capital',
          typeId: 56307
        }
      ]
    },
    {
      group: 'Ancil. Shield Boosters',
      categories: [
        {
          categoryName: 'Medium',
          typeId: 47836
        },
        {
          categoryName: 'Large',
          typeId: 47838
        },
        {
          categoryName: 'X-Large',
          typeId: 47840
        },
        {
          categoryName: 'Capital',
          typeId: 56310
        }
      ]
    },
    {
      group: 'Ancil. Armor Repairers',
      categories: [
        {
          categoryName: 'Small',
          typeId: 47842
        },
        {
          categoryName: 'Medium',
          typeId: 47844
        },
        {
          categoryName: 'Large',
          typeId: 47846
        },
        {
          categoryName: 'Capital',
          typeId: 56308
        }
      ]
    },
    {
      group: 'Energy Neutralizers',
      categories: [
        {
          categoryName: 'Small',
          typeId: 47824
        },
        {
          categoryName: 'Medium',
          typeId: 47828
        },
        {
          categoryName: 'Heavy',
          typeId: 47832
        },
        {
          categoryName: 'Capital',
          typeId: 56312
        }
      ]
    },
    {
      group: 'Energy Nosferatus',
      categories: [
        {
          categoryName: 'Small',
          typeId: 48419
        },
        {
          categoryName: 'Medium',
          typeId: 48423
        },
        {
          categoryName: 'Heavy',
          typeId: 48427
        },
        {
          categoryName: 'Capital',
          typeId: 56311
        }
      ]
    },
    {
      group: 'Cap Batteries',
      categories: [
        {
          categoryName: 'Small',
          typeId: 48431
        },
        {
          categoryName: 'Medium',
          typeId: 48435
        },
        {
          categoryName: 'Large',
          typeId: 48439
        }
      ]
    },
    {
      group: 'Stasis Webifiers',
      categories: [
        {
          categoryName: 'Stasis Webifiers',
          typeId: 47702
        }
      ]
    },
    {
      group: 'Warp Scramblers',
      categories: [
        {
          categoryName: 'Warp Scramblers',
          typeId: 47732
        },
        {
          categoryName: 'Heavy Warp Scramblers',
          typeId: 56303
        }
      ]
    },
    {
      group: 'Warp Disruptors',
      categories: [
        {
          categoryName: 'Warp Disruptors',
          typeId: 47736
        },
        {
          categoryName: 'Heavy Warp Disruptors',
          typeId: 56304
        }
      ]
    },
    {
      group: 'Damage Modules',
      categories: [
        {
          categoryName: 'Gyrostabilizer',
          typeId: 49730
        },
        {
          categoryName: 'Mag. Field Stab.',
          typeId: 49722
        },
        {
          categoryName: 'Heat Sink',
          typeId: 49726
        },
        {
          categoryName: 'Ballistic Control',
          typeId: 49738
        },
        {
          categoryName: 'Entropic Sink',
          typeId: 49734
        },
        {
          categoryName: 'Drone Amp.',
          typeId: 60482
        }
      ]
    },
    {
      group: 'Damage Control',
      categories: [
        {
          categoryName: 'Standard',
          typeId: 52227
        },
        {
          categoryName: 'Assault',
          typeId: 52230
        }
      ]
    },
    {
      group: 'Fighter Support Unit',
      categories: [
        {
          categoryName: 'Fighter Support Unit',
          typeId: 60483
        }
      ]
    },
    {
      group: 'Siege Module',
      categories: [
        {
          categoryName: 'Siege Module',
          typeId: 56313
        }
      ]
    },
    {
      group: 'Drones',
      categories: [
        {
          categoryName: 'Light',
          typeId: 60478
        },
        {
          categoryName: 'Medium',
          typeId: 60479
        },
        {
          categoryName: 'Heavy',
          typeId: 60480
        },
        {
          categoryName: 'Sentry',
          typeId: 60481
        }
      ]
    }
  ]
}
