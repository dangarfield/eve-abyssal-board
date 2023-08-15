export const getAbyssModuleTypesFlatIds = () => {
  const types = getAbyssModuleTypes()
  return types.flatMap((item) => item.categories.map((category) => category.typeId))
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
  return UNIT_STR[unitId]
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
