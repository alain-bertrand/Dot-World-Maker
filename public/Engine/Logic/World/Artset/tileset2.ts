///<reference path="../TilesetInformation.ts" />
defaultTilesets['tileset2'] = {
    "background": { "file": "/art/tileset2/background.png?v=2", "height": 32, "width": 32, "types": { "grass": [43, 61], "dark_grass": [51], "water": [7], "sand": [25, 33], "empty": [115], "dirt": [64] }, "mainType": "grass", "nbColumns": 6, "nonWalkable": [7, 0, 1, 2, 8, 14, 13, 12, 6, 3, 9, 4, 5, 11, 17, 35, 53, 69, 83, 101, 107, 106, 125, 112, 118, 124, 123, 143, 142, 141, 117, 111, 110, 116, 122, 121, 115, 109, 108, 114, 120, 119, 113, 15], "lastTile": 144, "paths": { "grass_path": [126, 139, 140, 133, 134, 131, 132, 129, 130, 127, 128, 135, 136, 137, 138] }, "transitions": [{ "from": "water", "to": "grass", "size": 12, "transition": [5, 3, 11, 9, 14, 12, 2, 0, 13, 8, 6, 1] }, { "from": "grass", "to": "sand", "size": 12, "transition": [18, 20, 30, 32, 27, 29, 21, 23, 19, 24, 26, 31] }, { "from": "dark_grass", "to": "grass", "size": 12, "transition": [36, 38, 48, 50, 45, 47, 39, 41, 37, 42, 44, 49] }, { "from": "grass", "to": "grass", "size": 12, "transition": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, { "from": "grass", "to": "dirt", "size": 12, "transition": [59, 57, 65, 63, 68, 66, 56, 54, 67, 62, 60, 55] }, { "from": "empty", "to": "dirt", "size": 12, "transition": [113, 111, 119, 117, 122, 120, 110, 108, 121, 116, 114, 109] }] },
    "panelStyle": {
        "file": "/art/tileset2/panel_style.png",
        "leftBorder": 7,
        "rightBorder": 7,
        "topBorder": 7,
        "header": 22,
        "bottomBorder": 9,
        "headerColor": "#e5d9c8",
        "contentColor": "#e5d9c8",
        "buttonBorder": "#b2a38f",
        "buttonBackground": "#60441d",
        "buttonBackgroundHover": "#b2a38f",
        "contentHeaderBackgroundColor": "#e5d9c8",
        "contentHeaderColor": "#000000",
        "contentSelectedColor": "#ac8958"
    },
    "quickslotStyle": {
        "file": "/art/tileset2/quick_slot_bar.png",
        "width": 380,
        "height": 40,
        "leftBorder": 5,
        "topBorder": 5,
        "itemSpacing": 5,
        "selectedSkillColor": "#b2a38f"
    },
    "statBarStyle": {
        "file": "/art/tileset2/main_stat_bars.png",
        "width": 90,
        "height": 100,
        "topBorder": 19,
        "bottomBorder": 18
    },
    characters: {
        "male_1": {
            "file": "/art/tileset2/hiro.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 65,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "woman_1": {
            "file": "/art/tileset2/bani.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "woman_2": {
            "file": "/art/tileset2/hana.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "skel_1": {
            "file": "/art/tileset2/skel.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "skul_1": {
            "file": "/art/tileset2/skul.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "slime_1": {
            "file": "/art/tileset2/slime.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "slime_2": {
            "file": "/art/tileset2/slyme.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 55,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "box_1": {
            "file": "/art/tileset2/box.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 54,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "rat_1": {
            "file": "/art/tileset2/gobo.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 54,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "rat_2": {
            "file": "/art/tileset2/gobi.png",
            "frames": 3,
            "directions": 4,
            "groundX": 35,
            "groundY": 54,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        },
        "bear_1": {
            "file": "/art/tileset2/kit.png",
            "frames": 3,
            "directions": 4,
            "groundX": 28,
            "groundY": 45,
            "width": 210,
            "height": 300,
            "imageFrameDivider": 10,
            "animationCycle": "walkCycle",
            "directionFrames": [
                2,
                0,
                1,
                3
            ],
            "collision": {
                "radius": 16
            }
        }
    },
    houses: {
        "house_1": {
            "collisionX": 2,
            "collisionY": 237,
            "collisionWidth": 145,
            "collisionHeight": 68,
            "parts": [
                {
                    "part": "body",
                    "x": 0,
                    "y": 195
                },
                {
                    "part": "roof",
                    "x": 0,
                    "y": 2
                },
                {
                    "part": "window_1",
                    "x": 18,
                    "y": 201
                },
                {
                    "part": "window_1",
                    "x": 92,
                    "y": 201
                },
                {
                    "part": "vent",
                    "x": 92,
                    "y": 24
                }
            ]
        },
        "house_2": {
            "collisionX": 2,
            "collisionY": 237,
            "collisionWidth": 145,
            "collisionHeight": 68,
            "parts": [
                {
                    "part": "body",
                    "x": 0,
                    "y": 195
                },
                {
                    "part": "roof",
                    "x": 0,
                    "y": 2
                },
                {
                    "part": "vent",
                    "x": 92,
                    "y": 24
                },
                {
                    "part": "window_2",
                    "x": 17,
                    "y": 204
                },
                {
                    "part": "window_2",
                    "x": 92,
                    "y": 204
                }
            ]
        }
    },
    house_parts: {
        "window_1": {
            "file": "/art/tileset2/houses.png",
            "x": 12,
            "y": 0,
            "width": 35,
            "height": 39
        },
        "window_2": {
            "file": "/art/tileset2/houses.png",
            "x": 57,
            "y": 0,
            "width": 37,
            "height": 39
        },
        "vent": {
            "file": "/art/tileset2/houses.png",
            "x": 95,
            "y": 0,
            "width": 32,
            "height": 53
        },
        "roof": {
            "file": "/art/tileset2/houses.png",
            "x": 0,
            "y": 58,
            "width": 148,
            "height": 193
        },
        "body": {
            "file": "/art/tileset2/houses.png",
            "x": 0,
            "y": 250,
            "width": 148,
            "height": 110
        }
    },
    objects: { "tree_1": { "file": "/art/tileset2/objects.png?v=2", "x": 2, "y": 2, "groundX": 27, "groundY": 52, "width": 53, "height": 62, "collision": { "radius": 16 } }, "tree_2": { "file": "/art/tileset2/objects.png?v=2", "x": 2, "y": 69, "groundX": 28, "groundY": 53, "width": 53, "height": 62, "collision": { "radius": 16 } }, "tree_3": { "file": "/art/tileset2/objects.png?v=2", "x": 62, "y": 35, "groundX": 15, "groundY": 22, "width": 29, "height": 29 }, "tree_4": { "file": "/art/tileset2/objects.png?v=2", "x": 62, "y": 102, "groundX": 16, "groundY": 22, "width": 29, "height": 29 }, "mediumGrass_1": { "file": "/art/tileset2/objects.png?v=2", "x": 105, "y": 125, "groundX": 4, "groundY": 6, "width": 15, "height": 22 }, "mediumGrass_2": { "file": "/art/tileset2/objects.png?v=2", "x": 133, "y": 130, "groundX": 7, "groundY": 9, "width": 14, "height": 17 }, "smallGrass_1": { "file": "/art/tileset2/objects.png?v=2", "x": 158, "y": 134, "groundX": 6, "groundY": 4, "width": 11, "height": 8 }, "smallGrass_2": { "file": "/art/tileset2/objects.png?v=2", "x": 177, "y": 134, "groundX": 6, "groundY": 4, "width": 11, "height": 8 }, "small_bag": { "file": "/art/tileset2/objects.png?v=2", "x": 95, "y": 88, "groundX": 15, "groundY": 12, "width": 29, "height": 23 }, "chest_1": { "file": "/art/tileset2/objects.png?v=2", "x": 129, "y": 58, "groundX": 15, "groundY": 15, "width": 29, "height": 29 }, "tombstone_1": { "file": "/art/tileset2/objects.png?v=2", "x": 96, "y": 10, "groundX": 16, "groundY": 15, "width": 32, "height": 29 }, "tombstone_2": { "file": "/art/tileset2/objects.png?v=2", "x": 96, "y": 55, "groundX": 15, "groundY": 12, "width": 29, "height": 23 }, "tombstone_3": { "file": "/art/tileset2/objects.png?v=2", "x": 162, "y": 7, "groundX": 12, "groundY": 16, "width": 23, "height": 32 }, "wall_1": { "file": "/art/tileset2/objects.png?v=2", "x": 162, "y": 58, "groundX": 15, "groundY": 15, "width": 29, "height": 29 }, "sign_1": { "file": "/art/tileset2/objects.png?v=2", "x": 167, "y": 93, "groundX": 12, "groundY": 16, "width": 23, "height": 32 }, "fence_1": { "file": "/art/tileset2/objects.png?v=2", "x": 127, "y": 96, "groundX": 18, "groundY": 10, "width": 35, "height": 20 }, "fire_camp": { "file": "/art/tileset2/objects.png?v=2", "x": 9, "y": 140, "groundX": 33, "groundY": 22, "width": 64, "height": 42, "collision": { "radius": 32 }, "particleEffect": "fire" } },
    "sounds": {
        "The Moldau": {
            mp3: '/Sounds/sm_mold_section.mp3',
            ogg: '/Sounds/sm_mold_section.ogg'
        }
    }
};