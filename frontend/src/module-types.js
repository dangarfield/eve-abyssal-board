export const getAbyssModuleTypesFlatIds = () => {
  const types = getAbyssModuleTypes()
  return types.flatMap((item) => item.categories.map((category) => category.typeID))
}

const UNIT_STR = {
  1: 'm',
  2: 'kg',
  3: 'sec',
  4: 'A',
  5: 'K',
  6: 'mol',
  7: 'cd',
  8: 'm2',
  9: 'm3',
  10: 'm/sec',
  11: 'm/sec',
  12: 'm-1',
  13: 'kg/m3',
  14: 'm3/kg',
  15: 'A/m2',
  16: 'A/m',
  17: 'mol/m3',
  18: 'cd/m2',
  19: 'kg/kg = 1',
  101: 's',
  102: 'mm',
  103: 'None',
  104: 'x',
  105: '%',
  106: 'tf',
  107: 'MW',
  108: '%',
  109: '%',
  111: '%',
  112: 'rad/sec',
  113: 'HP',
  114: 'GJ',
  115: 'groupID',
  116: 'typeID',
  118: 'Ore units',
  119: 'attributeID',
  120: 'points',
  121: '%',
  122: 'None',
  123: 'sec',
  124: '%',
  125: 'N',
  126: 'ly',
  127: '%',
  128: 'Mbit/sec',
  129: 'None',
  133: 'ISK',
  134: 'm3/hour',
  135: 'AU',
  136: 'Slot',
  138: 'units',
  139: '+',
  140: 'Level',
  141: 'hardpoints',
  143: 'None',
  1001: 'HP/s', // Derived Attribute,
  1002: 'HP/GJ', // Derived Attribute,
  1003: '%' // Derived Attribute
}
export const getUnitStringForUnitId = (unitId) => {
  return UNIT_STR[unitId] || ''
}
export const getAbyssModuleTypes = () => {
  return [
    {
      group: 'Microwarpdrives',
      iconID: 47740,
      categories: [
        {
          categoryName: '5MN',
          typeID: 47740,
          defaultItem: 19325 // Coreli A-Type 5MN Microwarpdrive
        },
        {
          categoryName: '50MN',
          typeID: 47408,
          defaultItem: 19345 // Gistum B-Type 50MN Microwarpdrive
        },
        {
          categoryName: '500MN',
          typeID: 47745,
          defaultItem: 19347 // Gist B-Type 500MN Microwarpdrive
        },
        {
          categoryName: '50000MN',
          typeID: 56306,
          defaultItem: 41254 // Domination 50000MN Microwarpdrive
        }
      ]
    },
    {
      group: 'Afterburners',
      iconID: 47740,
      categories: [
        {
          categoryName: '1MN',
          typeID: 47749,
          defaultItem: 18692 // Coreli A-Type 1MN Afterburner
        },
        {
          categoryName: '10MN',
          typeID: 47753,
          defaultItem: 18672 // Gistum A-Type 10MN Afterburner
        },
        {
          categoryName: '100MN',
          typeID: 47757,
          defaultItem: 18674 // Gist A-Type 100MN Afterburner
        },
        {
          categoryName: '10000MN',
          typeID: 56305,
          defaultItem: 41240 // Domination 10000MN Afterburner
        }
      ]
    },
    {
      group: 'Shield Extenders',
      iconID: 47740,
      categories: [
        {
          categoryName: 'Small',
          typeID: 47800,
          defaultItem: 31922 // Caldari Navy Small Shield Extender
        },
        {
          categoryName: 'Medium',
          typeID: 47804,
          defaultItem: 31926 // Caldari Navy Medium Shield Extender
        },
        {
          categoryName: 'Large',
          typeID: 47808,
          defaultItem: 31930 // Caldari Navy Large Shield Extender
        }
      ]
    },
    {
      group: 'Armor Plates',
      iconID: 47740,
      categories: [
        {
          categoryName: 'Small',
          typeID: 47812,
          defaultItem: 31906 // Federation Navy 200mm Steel Plates
        },
        {
          categoryName: 'Medium',
          typeID: 47817,
          defaultItem: 31918 // Federation Navy 800mm Steel Plates
        },
        {
          categoryName: 'Large',
          typeID: 47820,
          defaultItem: 31902 // Federation Navy 1600mm Steel Plates
        }
      ]
    },
    {
      group: 'Shield Boosters',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47781,
          defaultItem: 19179 // Pithi A-Type Small Shield Booster
        },
        {
          categoryName: 'Medium',
          typeID: 47785,
          defaultItem: 19191 // Pithum A-Type Medium Shield Booster
        },
        {
          categoryName: 'Large',
          typeID: 47789,
          defaultItem: 19205 // Pith A-Type Large Shield Booster
        },
        {
          categoryName: 'X-Large',
          typeID: 47793,
          defaultItem: 19206 // Pith A-Type X-Large Shield Booster
        },
        {
          categoryName: 'Capital',
          typeID: 56309,
          defaultItem: 41510 // Domination Capital Shield Booster
        }
      ]
    },
    {
      group: 'Armor Repairers',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47769,
          defaultItem: 19015 // Coreli A-Type Small Armor Repairer
        },
        {
          categoryName: 'Medium',
          typeID: 47773,
          defaultItem: 19033 // Corelum A-Type Medium Armor Repairer
        },
        {
          categoryName: 'Large',
          typeID: 47777,
          defaultItem: 19037 // Core A-Type Large Armor Repairer
        },
        {
          categoryName: 'Capital',
          typeID: 56307,
          defaultItem: 3534 // CONCORD Capital Armor Repairer
        }
      ]
    },
    {
      group: 'Ancil. Shield Boosters',
      categories: [
        {
          categoryName: 'Medium',
          typeID: 47836,
          defaultItem: 32772 // Medium Ancillary Shield Booster
        },
        {
          categoryName: 'Large',
          typeID: 47838,
          defaultItem: 4391 // Large Ancillary Shield Booster
        },
        {
          categoryName: 'X-Large',
          typeID: 47840,
          defaultItem: 32780 // X-Large Ancillary Shield Booster
        },
        {
          categoryName: 'Capital',
          typeID: 56310,
          defaultItem: 41504 // Capital Ancillary Shield Booster
        }
      ]
    },
    {
      group: 'Ancil. Armor Repairers',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47842,
          defaultItem: 33076 // Small Ancillary Armor Repairer
        },
        {
          categoryName: 'Medium',
          typeID: 47844,
          defaultItem: 33101 // Medium Ancillary Armor Repairer
        },
        {
          categoryName: 'Large',
          typeID: 47846,
          defaultItem: 33103 // Large Ancillary Armor Repairer
        },
        {
          categoryName: 'Capital',
          typeID: 56308,
          defaultItem: 41503 // Capital Ancillary Armor Repairer
        }
      ]
    },
    {
      group: 'Energy Neutralizers',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47824,
          defaultItem: 37624 // Corpii A-Type Small Energy Neutralizer
        },
        {
          categoryName: 'Medium',
          typeID: 47828,
          defaultItem: 37627 // Corpum A-Type Medium Energy Neutralizer
        },
        {
          categoryName: 'Heavy',
          typeID: 47832,
          defaultItem: 37630 // Corpus A-Type Heavy Energy Neutralizer
        },
        {
          categoryName: 'Capital',
          typeID: 56312,
          defaultItem: 40663 // True Sansha Capital Energy Neutralizer
        }
      ]
    },
    {
      group: 'Energy Nosferatus',
      categories: [
        {
          categoryName: 'Small',
          typeID: 48419,
          defaultItem: 19105 // Corpii A-Type Small Energy Nosferatu
        },
        {
          categoryName: 'Medium',
          typeID: 48423,
          defaultItem: 19111 // Corpum A-Type Medium Energy Nosferatu
        },
        {
          categoryName: 'Heavy',
          typeID: 48427,
          defaultItem: 19117 // Corpus A-Type Heavy Energy Nosferatu
        },
        {
          categoryName: 'Capital',
          typeID: 56311,
          defaultItem: 40669 // True Sansha Capital Energy Nosferatu
        }
      ]
    },
    {
      group: 'Cap Batteries',
      categories: [
        {
          categoryName: 'Small',
          typeID: 48431,
          defaultItem: 41212 // Republic Fleet Small Cap Battery
        },
        {
          categoryName: 'Medium',
          typeID: 48435,
          defaultItem: 41215 // Republic Fleet Medium Cap Battery
        },
        {
          categoryName: 'Large',
          typeID: 48439,
          defaultItem: 41218 // Republic Fleet Large Cap Battery
        }
      ]
    },
    {
      group: 'Stasis Webifiers',
      categories: [
        {
          categoryName: 'Stasis Webifiers',
          typeID: 47702,
          defaultItem: 17559 // Federation Navy Stasis Webifier
        }
      ]
    },
    {
      group: 'Warp Scramblers',
      categories: [
        {
          categoryName: 'Warp Scramblers',
          typeID: 47732,
          defaultItem: 15893 // Republic Fleet Warp Scrambler
        },
        {
          categoryName: 'Heavy Warp Scramblers',
          typeID: 56303,
          defaultItem: 40764 // Domination Heavy Warp Scrambler
        }
      ]
    },
    {
      group: 'Warp Disruptors',
      categories: [
        {
          categoryName: 'Warp Disruptors',
          typeID: 47736,
          defaultItem: 15891 // Republic Fleet Warp Disruptor
        },
        {
          categoryName: 'Heavy Warp Disruptors',
          typeID: 56304,
          defaultItem: 40737 // Domination Heavy Warp Disruptor
        }
      ]
    },
    {
      group: 'Damage Modules',
      categories: [
        {
          categoryName: 'Gyrostabilizer',
          typeID: 49730,
          defaultItem: 15806 // Republic Fleet Gyrostabilizer
        },
        {
          categoryName: 'Mag. Field Stab.',
          typeID: 49722,
          defaultItem: 15895 // Federation Navy Magnetic Field Stabilizer
        },
        {
          categoryName: 'Heat Sink',
          typeID: 49726,
          defaultItem: 15810 // Imperial Navy Heat Sink
        },
        {
          categoryName: 'Ballistic Control',
          typeID: 49738,
          defaultItem: 15681 // Caldari Navy Ballistic Control System
        },
        {
          categoryName: 'Entropic Sink',
          typeID: 49734,
          defaultItem: 52244 // Veles Entropic Radiation Sink
        },
        {
          categoryName: 'Drone Amp.',
          typeID: 60482,
          defaultItem: 33842 // Federation Navy Drone Damage Amplifier
        }
      ]
    },
    {
      group: 'Damage Control',
      categories: [
        {
          categoryName: 'Standard',
          typeID: 52227,
          defaultItem: 41200 // Shadow Serpentis Damage Control
        },
        {
          categoryName: 'Assault',
          typeID: 52230,
          defaultItem: 47258 // Shadow Serpentis Assault Damage Control
        }
      ]
    },
    {
      group: 'Fighter Support Unit',
      categories: [
        {
          categoryName: 'Fighter Support Unit',
          typeID: 60483,
          defaultItem: 41414 // Hermes Compact Fighter Support Unit
        }
      ]
    },
    {
      group: 'Siege Module',
      categories: [
        {
          categoryName: 'Siege Module',
          typeID: 56313,
          defaultItem: 4292 // Siege Module II
        }
      ]
    },
    {
      group: 'Drones',
      categories: [
        {
          categoryName: 'Light',
          typeID: 60478,
          defaultItem: 28304 // 'Augmented' Warrior
        },
        {
          categoryName: 'Medium',
          typeID: 60479,
          defaultItem: 28296 // 'Augmented' Valkyrie
        },
        {
          categoryName: 'Heavy',
          typeID: 60480,
          defaultItem: 28268 // 'Augmented' Berserker
        },
        {
          categoryName: 'Sentry',
          typeID: 60481,
          defaultItem: 31894 // Republic Fleet Bouncer
        }
      ]
    }
  ]
}
