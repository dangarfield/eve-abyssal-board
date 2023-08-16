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
  143: 'None'
}
export const getUnitStringForUnitId = (unitId) => {
  return UNIT_STR[unitId] || ''
}
export const getAbyssModuleTypes = () => {
  return [
    {
      group: 'Microwarpdrives',
      categories: [
        {
          categoryName: '5MN',
          typeID: 47740
        },
        {
          categoryName: '50MN',
          typeID: 47408
        },
        {
          categoryName: '500MN',
          typeID: 47745
        },
        {
          categoryName: '50000MN',
          typeID: 56306
        }
      ]
    },
    {
      group: 'Afterburners',
      categories: [
        {
          categoryName: '1MN',
          typeID: 47749
        },
        {
          categoryName: '10MN',
          typeID: 47753
        },
        {
          categoryName: '100MN',
          typeID: 47757
        },
        {
          categoryName: '10000MN',
          typeID: 56305
        }
      ]
    },
    {
      group: 'Shield Extenders',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47800
        },
        {
          categoryName: 'Medium',
          typeID: 47804
        },
        {
          categoryName: 'Large',
          typeID: 47808
        }
      ]
    },
    {
      group: 'Armor Plates',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47812
        },
        {
          categoryName: 'Medium',
          typeID: 47817
        },
        {
          categoryName: 'Large',
          typeID: 47820
        }
      ]
    },
    {
      group: 'Shield Boosters',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47781
        },
        {
          categoryName: 'Medium',
          typeID: 47785
        },
        {
          categoryName: 'Large',
          typeID: 47789
        },
        {
          categoryName: 'X-Large',
          typeID: 47793
        },
        {
          categoryName: 'Capital',
          typeID: 56309
        }
      ]
    },
    {
      group: 'Armor Repairers',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47769
        },
        {
          categoryName: 'Medium',
          typeID: 47773
        },
        {
          categoryName: 'Large',
          typeID: 47777
        },
        {
          categoryName: 'Capital',
          typeID: 56307
        }
      ]
    },
    {
      group: 'Ancil. Shield Boosters',
      categories: [
        {
          categoryName: 'Medium',
          typeID: 47836
        },
        {
          categoryName: 'Large',
          typeID: 47838
        },
        {
          categoryName: 'X-Large',
          typeID: 47840
        },
        {
          categoryName: 'Capital',
          typeID: 56310
        }
      ]
    },
    {
      group: 'Ancil. Armor Repairers',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47842
        },
        {
          categoryName: 'Medium',
          typeID: 47844
        },
        {
          categoryName: 'Large',
          typeID: 47846
        },
        {
          categoryName: 'Capital',
          typeID: 56308
        }
      ]
    },
    {
      group: 'Energy Neutralizers',
      categories: [
        {
          categoryName: 'Small',
          typeID: 47824
        },
        {
          categoryName: 'Medium',
          typeID: 47828
        },
        {
          categoryName: 'Heavy',
          typeID: 47832
        },
        {
          categoryName: 'Capital',
          typeID: 56312
        }
      ]
    },
    {
      group: 'Energy Nosferatus',
      categories: [
        {
          categoryName: 'Small',
          typeID: 48419
        },
        {
          categoryName: 'Medium',
          typeID: 48423
        },
        {
          categoryName: 'Heavy',
          typeID: 48427
        },
        {
          categoryName: 'Capital',
          typeID: 56311
        }
      ]
    },
    {
      group: 'Cap Batteries',
      categories: [
        {
          categoryName: 'Small',
          typeID: 48431
        },
        {
          categoryName: 'Medium',
          typeID: 48435
        },
        {
          categoryName: 'Large',
          typeID: 48439
        }
      ]
    },
    {
      group: 'Stasis Webifiers',
      categories: [
        {
          categoryName: 'Stasis Webifiers',
          typeID: 47702
        }
      ]
    },
    {
      group: 'Warp Scramblers',
      categories: [
        {
          categoryName: 'Warp Scramblers',
          typeID: 47732
        },
        {
          categoryName: 'Heavy Warp Scramblers',
          typeID: 56303
        }
      ]
    },
    {
      group: 'Warp Disruptors',
      categories: [
        {
          categoryName: 'Warp Disruptors',
          typeID: 47736
        },
        {
          categoryName: 'Heavy Warp Disruptors',
          typeID: 56304
        }
      ]
    },
    {
      group: 'Damage Modules',
      categories: [
        {
          categoryName: 'Gyrostabilizer',
          typeID: 49730
        },
        {
          categoryName: 'Mag. Field Stab.',
          typeID: 49722
        },
        {
          categoryName: 'Heat Sink',
          typeID: 49726
        },
        {
          categoryName: 'Ballistic Control',
          typeID: 49738
        },
        {
          categoryName: 'Entropic Sink',
          typeID: 49734
        },
        {
          categoryName: 'Drone Amp.',
          typeID: 60482
        }
      ]
    },
    {
      group: 'Damage Control',
      categories: [
        {
          categoryName: 'Standard',
          typeID: 52227
        },
        {
          categoryName: 'Assault',
          typeID: 52230
        }
      ]
    },
    {
      group: 'Fighter Support Unit',
      categories: [
        {
          categoryName: 'Fighter Support Unit',
          typeID: 60483
        }
      ]
    },
    {
      group: 'Siege Module',
      categories: [
        {
          categoryName: 'Siege Module',
          typeID: 56313
        }
      ]
    },
    {
      group: 'Drones',
      categories: [
        {
          categoryName: 'Light',
          typeID: 60478
        },
        {
          categoryName: 'Medium',
          typeID: 60479
        },
        {
          categoryName: 'Heavy',
          typeID: 60480
        },
        {
          categoryName: 'Sentry',
          typeID: 60481
        }
      ]
    }
  ]
}
