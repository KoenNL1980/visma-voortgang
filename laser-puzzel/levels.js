// Levelopbouw:
// - 99 levels totaal
// - 11 puzzelfamilies die in cycli terugkomen
// - daardoor nooit te veel dezelfde soort puzzel achter elkaar
// - elke volgende cyclus voegt net iets meer complexiteit toe

function makeLevelBase(id, title, instructions, source) {
  return {
    id,
    title,
    instructions,
    source,
    balloons: [],
    walls: [],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: {}
  };
}

function familySingleMirror(id, tier) {
  const sourceY = [8, 7, 8, 6, 7, 8, 6, 7, 8][tier - 1];
  const balloonX = [7, 8, 7, 8, 7, 8, 7, 8, 7][tier - 1];
  const balloonY = [2, 1, 3, 2, 1, 3, 2, 1, 2][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Eerste afbuiging`,
    tier === 1
      ? "Plaats een spiegel zodat je meteen ziet hoe de laser afbuigt en de ballon raakt."
      : "Gebruik een enkele spiegel om de laser naar de ballon af te buigen."
    ,
    { x: 0, y: sourceY, dir: "right" }
  );
  level.balloons = [{ x: balloonX, y: balloonY }];
  level.inventory = { mirrorSlash: 1, mirrorBackslash: 1 };
  if (tier >= 4) level.walls.push({ x: 4, y: sourceY - 1 });
  if (tier >= 7) level.walls.push({ x: 2, y: balloonY + 1 });
  return level;
}

function familyDoubleMirror(id, tier) {
  const sourceY = [8, 8, 7, 8, 7, 6, 7, 6, 5][tier - 1];
  const turnX = [2, 3, 2, 3, 4, 3, 4, 5, 4][tier - 1];
  const balloonY = [1, 2, 1, 2, 1, 2, 1, 2, 1][tier - 1];
  const balloonX = [8, 8, 9, 9, 8, 9, 8, 9, 8][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Twee spiegels`,
    "Combineer twee spiegels om eerst omhoog en daarna weer zijwaarts te sturen.",
    { x: 0, y: sourceY, dir: "right" }
  );
  level.balloons = [{ x: balloonX, y: balloonY }];
  level.inventory = { mirrorSlash: 2, mirrorBackslash: 2 };
  if (tier >= 5) {
    level.walls.push({ x: turnX + 2, y: sourceY });
    level.walls.push({ x: turnX + 2, y: sourceY - 1 });
  }
  return level;
}

function familyWalls(id, tier) {
  const sourceY = [7, 8, 7, 6, 7, 6, 5, 6, 5][tier - 1];
  const turnX = [2, 2, 3, 3, 3, 4, 4, 4, 5][tier - 1];
  const balloonY = [1, 2, 1, 2, 1, 2, 1, 2, 1][tier - 1];
  const balloonX = [8, 9, 8, 9, 8, 9, 8, 9, 8][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Muren in de weg`,
    "Vaste obstakels blokkeren de rechte route. Zoek een nette omweg.",
    { x: 0, y: sourceY, dir: "right" }
  );
  level.balloons = [{ x: balloonX, y: balloonY }];
  level.inventory = { mirrorSlash: 2, mirrorBackslash: 2 };
  level.walls = [
    { x: 5, y: sourceY },
    { x: 5, y: sourceY - 1 },
    { x: 5, y: sourceY - 2 }
  ];
  if (tier >= 4) level.walls.push({ x: 6, y: sourceY - 2 });
  if (tier >= 7) level.walls.push({ x: 7, y: sourceY - 2 });
  return level;
}

function familySplitterIntro(id, tier) {
  const splitY = [6, 5, 6, 4, 5, 4, 5, 4, 3][tier - 1];
  const balloonX = [8, 8, 1, 8, 1, 8, 1, 8, 1][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Eerste splitter`,
    "Gebruik de splitter om een zijtak te maken die de ballon raakt.",
    { x: 5, y: 9, dir: "up" }
  );
  level.balloons = [{ x: balloonX, y: splitY }];
  level.inventory = { splitter: 1, mirrorSlash: tier >= 6 ? 1 : 0, mirrorBackslash: tier >= 6 ? 1 : 0 };
  level.walls = [{ x: 5, y: splitY - 2 }];
  if (tier >= 6) level.walls.push({ x: 7, y: splitY });
  return level;
}

function familyDoubleBalloon(id, tier) {
  const sourceY = [8, 7, 8, 7, 6, 7, 6, 5, 6][tier - 1];
  const balloonX = [6, 7, 6, 7, 7, 8, 7, 8, 8][tier - 1];
  const ys = tier % 2 === 0 ? [2, 5] : [1, 4];
  const level = makeLevelBase(
    id,
    `Level ${id} - Twee ballonnen`,
    "Laat de laser over een lijn lopen waar beide ballonnen op liggen.",
    { x: 0, y: sourceY, dir: "right" }
  );
  level.balloons = [{ x: balloonX, y: ys[0] }, { x: balloonX, y: ys[1] }];
  level.inventory = { mirrorSlash: 1, mirrorBackslash: 1 };
  if (tier >= 5) level.walls.push({ x: 4, y: sourceY - 1 });
  return level;
}

function familySplitterDual(id, tier) {
  const splitY = [6, 5, 6, 5, 4, 5, 4, 3, 4][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Split voor twee doelen`,
    "Hier heb je echt twee stralen nodig. Gebruik de splitter slim.",
    { x: 5, y: 9, dir: "up" }
  );
  level.balloons = [{ x: 1, y: splitY }, { x: 8, y: splitY }];
  level.inventory = { splitter: 1, mirrorSlash: tier >= 7 ? 1 : 0, mirrorBackslash: tier >= 7 ? 1 : 0 };
  level.walls = [{ x: 5, y: splitY - 2 }];
  if (tier >= 5) level.walls.push({ x: 3, y: splitY });
  return level;
}

function familyPortal(id, tier) {
  const sourceY = [8, 8, 7, 8, 7, 6, 7, 6, 5][tier - 1];
  const portalExitY = [2, 3, 2, 3, 2, 3, 2, 3, 2][tier - 1];
  const balloonX = [8, 8, 9, 8, 9, 8, 9, 8, 9][tier - 1];
  const balloonY = [0, 1, 0, 1, 0, 1, 0, 1, 0][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Portals`,
    "Gebruik het portalpaar om de straal naar een nieuw deel van het bord te verplaatsen.",
    { x: 0, y: sourceY, dir: "right" }
  );
  level.balloons = [{ x: balloonX, y: balloonY }];
  level.portals = [{ id: "A", x: 3, y: sourceY }, { id: "A", x: 6, y: portalExitY }];
  level.inventory = { mirrorSlash: 1, mirrorBackslash: 1 };
  if (tier >= 6) level.walls.push({ x: 7, y: portalExitY });
  return level;
}

function familySwitch(id, tier) {
  const sourceY = [5, 6, 5, 6, 5, 4, 5, 4, 5][tier - 1];
  const doorX = 5;
  const balloonY = [2, 3, 2, 3, 2, 3, 2, 3, 2][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Schakelaar`,
    "Raak eerst de schakelaar, open de deur en stuur de laser daarna naar de ballon.",
    { x: 0, y: sourceY, dir: "right" }
  );
  level.balloons = [{ x: 8, y: balloonY }];
  level.walls = [{ x: doorX - 1, y: sourceY - 1 }, { x: doorX - 1, y: sourceY + 1 }];
  level.doors = [{ id: `door-${id}`, x: doorX, y: sourceY }];
  level.switches = [{ id: `switch-${id}`, x: 2, y: sourceY, targets: [`door-${id}`] }];
  level.inventory = { mirrorSlash: 1, mirrorBackslash: 1 };
  return level;
}

function familyRotation(id, tier) {
  const sourceY = [8, 7, 8, 7, 6, 7, 6, 5, 6][tier - 1];
  const turnX = [2, 2, 3, 3, 3, 4, 4, 4, 5][tier - 1];
  const balloonY = [1, 2, 1, 2, 1, 2, 1, 2, 1][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Draaien`,
    "Er staan al objecten op het bord. Klik erop om ze te draaien tot de route klopt.",
    { x: 0, y: sourceY, dir: "right" }
  );
  level.balloons = [{ x: 8, y: balloonY }];
  level.placedObjects = [
    { x: turnX, y: sourceY, kind: "mirror", variant: "\\", symbol: "\\" },
    { x: turnX, y: balloonY, kind: "mirror", variant: "/", symbol: "/" }
  ];
  if (tier >= 5) level.walls.push({ x: 5, y: sourceY - 1 });
  return level;
}

function familyCombo(id, tier) {
  const splitY = [6, 5, 6, 5, 4, 5, 4, 3, 4][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Combinatie`,
    "Combineer spiegel, splitter en portal om alle doelen te halen.",
    { x: 5, y: 9, dir: "up" }
  );
  level.balloons = [{ x: 8, y: 1 }, { x: 1, y: splitY }];
  level.portals = [{ id: "B", x: 7, y: splitY }, { id: "B", x: 7, y: 2 }];
  level.walls = [{ x: 5, y: splitY - 2 }, { x: 6, y: 2 }];
  level.inventory = { splitter: 1, mirrorSlash: 2, mirrorBackslash: 2 };
  if (tier >= 6) level.walls.push({ x: 2, y: splitY });
  return level;
}

function familyAdvanced(id, tier) {
  const sourceY = [8, 8, 7, 7, 6, 6, 5, 5, 4][tier - 1];
  const doorY = [5, 6, 5, 6, 5, 4, 5, 4, 5][tier - 1];
  const level = makeLevelBase(
    id,
    `Level ${id} - Netwerkpuzzel`,
    "Een zwaardere combinatiepuzzel met meerdere systemen tegelijk.",
    { x: 0, y: sourceY, dir: "right" }
  );
  level.balloons = [{ x: 8, y: 1 }, { x: 8, y: 8 - tier % 3 }];
  level.portals = [{ id: "C", x: 3, y: sourceY }, { id: "C", x: 6, y: 2 }];
  level.doors = [{ id: `door-adv-${id}`, x: 5, y: doorY }];
  level.switches = [{ id: `switch-adv-${id}`, x: 2, y: sourceY, targets: [`door-adv-${id}`] }];
  level.walls = [
    { x: 5, y: doorY - 1 },
    { x: 5, y: doorY + 1 },
    { x: 7, y: 2 }
  ];
  level.inventory = { splitter: 1, mirrorSlash: 2 + (tier >= 6 ? 1 : 0), mirrorBackslash: 2 + (tier >= 6 ? 1 : 0) };
  return level;
}

const families = [
  familySingleMirror,
  familyDoubleMirror,
  familyWalls,
  familySplitterIntro,
  familyDoubleBalloon,
  familySplitterDual,
  familyPortal,
  familySwitch,
  familyRotation,
  familyCombo,
  familyAdvanced
];

const levels = Array.from({ length: 99 }, (_, index) => {
  const id = index + 1;
  const familyIndex = index % families.length;
  const tier = Math.floor(index / families.length) + 1;
  return families[familyIndex](id, tier);
});

function setExactInventory(level, inventory) {
  level.inventory = { ...inventory };
}

function applyDifficultyCurve(level) {
  const band = Math.floor((level.id - 1) / 10);

  if (band === 0) {
    return;
  }

  if (band >= 1) {
    if (level.inventory.mirrorSlash > 1) level.inventory.mirrorSlash -= 1;
    if (level.inventory.mirrorBackslash > 1) level.inventory.mirrorBackslash -= 1;
  }

  if (band >= 2) {
    if (!level.balloons[1] && (level.id % 3 === 0)) {
      const extraBalloon = {
        x: Math.min(9, Math.max(0, level.balloons[0].x)),
        y: Math.min(9, level.balloons[0].y + 2)
      };
      if (!level.balloons.some((b) => b.x === extraBalloon.x && b.y === extraBalloon.y)) {
        level.balloons.push(extraBalloon);
      }
    }
    if (level.walls.length < 4) {
      level.walls.push({ x: 6, y: Math.max(1, level.source.y - 2) });
    }
  }

  if (band >= 3) {
    if (level.inventory.splitter === 1 && !level.inventory.mirrorSlash && !level.inventory.mirrorBackslash) {
      level.inventory.mirrorSlash = 1;
    }
    if (level.portals.length === 0 && level.id % 5 === 0) {
      level.portals = [{ id: `Z${level.id}`, x: 2, y: 8 }, { id: `Z${level.id}`, x: 7, y: 2 }];
    }
  }

  if (band >= 4) {
    if (level.switches.length && level.doors.length === 1) {
      const extraDoorId = `door-extra-${level.id}`;
      level.doors.push({ id: extraDoorId, x: 6, y: Math.max(1, level.source.y - 1) });
      level.switches[0].targets.push(extraDoorId);
    }
  }

  if (band >= 5) {
    if (level.inventory.mirrorSlash) level.inventory.mirrorSlash = Math.max(1, level.inventory.mirrorSlash - 1);
    if (level.inventory.mirrorBackslash) level.inventory.mirrorBackslash = Math.max(1, level.inventory.mirrorBackslash - 1);
    if (level.inventory.splitter) level.inventory.splitter = Math.max(1, level.inventory.splitter);
  }

  if (band >= 6) {
    if (!level.balloons[2] && level.id % 4 === 0) {
      const candidate = { x: Math.max(1, level.balloons[0].x - 2), y: Math.max(0, level.balloons[0].y + 1) };
      if (!level.balloons.some((b) => b.x === candidate.x && b.y === candidate.y)) {
        level.balloons.push(candidate);
      }
    }
  }

  if (band >= 7) {
    if (level.walls.length < 6) {
      level.walls.push({ x: 3, y: Math.max(1, level.source.y - 1) });
    }
  }

  if (band >= 8) {
    if (level.inventory.splitter && !level.inventory.mirrorBackslash) {
      level.inventory.mirrorBackslash = 1;
    }
  }
}

// De eerste 25 levels zijn bewust handgemaakt, zodat de onboarding strak blijft
// en de reeks gegarandeerd oplosbaar en begrijpelijk opent.
levels.splice(0, 25,
  {
    id: 1,
    title: "Level 1 - Eerste afbuiging",
    instructions: "Plaats 1 spiegel zodat je meteen ziet hoe de laser van richting verandert en de ballon raakt.",
    source: { x: 0, y: 8, dir: "right" },
    balloons: [{ x: 7, y: 2 }],
    walls: [],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 2,
    title: "Level 2 - Twee bochten",
    instructions: "Gebruik twee spiegels om eerst omhoog en daarna weer naar rechts te sturen.",
    source: { x: 0, y: 8, dir: "right" },
    balloons: [{ x: 8, y: 1 }],
    walls: [],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 2, mirrorBackslash: 2 }
  },
  {
    id: 3,
    title: "Level 3 - Muur ertussen",
    instructions: "De vaste muur blokkeert de rechte route. Vind met spiegels een omweg.",
    source: { x: 0, y: 7, dir: "right" },
    balloons: [{ x: 8, y: 2 }],
    walls: [{ x: 5, y: 7 }, { x: 5, y: 6 }, { x: 5, y: 5 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 2, mirrorBackslash: 2 }
  },
  {
    id: 4,
    title: "Level 4 - Nog een muurroute",
    instructions: "Nog een muurpuzzel, maar nu staat de blokkade net anders.",
    source: { x: 0, y: 6, dir: "right" },
    balloons: [{ x: 9, y: 1 }],
    walls: [{ x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 4 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 2, mirrorBackslash: 2 }
  },
  {
    id: 5,
    title: "Level 5 - Eerste splitter",
    instructions: "Plaats een splitter zodat een zijtak de ballon raakt.",
    source: { x: 5, y: 9, dir: "up" },
    balloons: [{ x: 8, y: 6 }],
    walls: [{ x: 5, y: 4 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { splitter: 1 }
  },
  {
    id: 6,
    title: "Level 6 - Split voor twee ballonnen",
    instructions: "Gebruik de splitter om tegelijk links en rechts een ballon te raken.",
    source: { x: 5, y: 9, dir: "up" },
    balloons: [{ x: 2, y: 6 }, { x: 8, y: 6 }],
    walls: [{ x: 5, y: 3 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { splitter: 1 }
  },
  {
    id: 7,
    title: "Level 7 - Splitter plus spiegel",
    instructions: "Nu heb je een splitter en ook een extra spiegel nodig om beide doelen te halen.",
    source: { x: 5, y: 9, dir: "up" },
    balloons: [{ x: 2, y: 6 }, { x: 8, y: 3 }],
    walls: [{ x: 5, y: 4 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { splitter: 1, mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 8,
    title: "Level 8 - Eerste portal",
    instructions: "Teleporteer de straal met het portalpaar en stuur hem daarna goed door.",
    source: { x: 0, y: 8, dir: "right" },
    balloons: [{ x: 8, y: 1 }],
    walls: [{ x: 5, y: 8 }, { x: 5, y: 7 }, { x: 5, y: 6 }],
    doors: [],
    portals: [{ id: "A", x: 3, y: 8 }, { id: "A", x: 6, y: 2 }],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 9,
    title: "Level 9 - Schakelaar en deur",
    instructions: "Raak eerst de schakelaar zodat de deur opengaat, en laat de straal daarna doorlopen.",
    source: { x: 0, y: 5, dir: "right" },
    balloons: [{ x: 8, y: 2 }],
    walls: [{ x: 4, y: 4 }, { x: 4, y: 6 }],
    doors: [{ id: "door-9", x: 5, y: 5 }],
    portals: [],
    switches: [{ id: "switch-9", x: 2, y: 5, targets: ["door-9"] }],
    placedObjects: [],
    inventory: { mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 10,
    title: "Level 10 - Combinatiepuzzel",
    instructions: "Gebruik meerdere hulpmiddelen samen: spiegel, splitter en portal.",
    source: { x: 5, y: 9, dir: "up" },
    balloons: [{ x: 1, y: 5 }, { x: 8, y: 1 }],
    walls: [{ x: 5, y: 4 }, { x: 6, y: 2 }],
    doors: [],
    portals: [{ id: "B", x: 7, y: 5 }, { id: "B", x: 7, y: 2 }],
    switches: [],
    placedObjects: [],
    inventory: { splitter: 1, mirrorSlash: 2, mirrorBackslash: 2 }
  },
  {
    id: 11,
    title: "Level 11 - Drie bochten",
    instructions: "Stuur de laser in drie duidelijke bochten naar de ballon.",
    source: { x: 0, y: 8, dir: "right" },
    balloons: [{ x: 9, y: 2 }],
    walls: [],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 2, mirrorBackslash: 2 }
  },
  {
    id: 12,
    title: "Level 12 - Draaien en afmaken",
    instructions: "Een spiegel staat al klaar maar wijst verkeerd. Draai hem en vul de route aan met een tweede spiegel.",
    source: { x: 0, y: 7, dir: "right" },
    balloons: [{ x: 8, y: 1 }],
    walls: [{ x: 5, y: 7 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [{ x: 2, y: 7, kind: "mirror", variant: "\\", symbol: "\\" }],
    inventory: { mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 13,
    title: "Level 13 - Muur en twee doelen",
    instructions: "Werk om de muur heen en laat de laser twee ballonnen op een rij raken.",
    source: { x: 0, y: 6, dir: "right" },
    balloons: [{ x: 7, y: 3 }, { x: 8, y: 3 }],
    walls: [{ x: 4, y: 6 }, { x: 4, y: 5 }, { x: 4, y: 4 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 2, mirrorBackslash: 2 }
  },
  {
    id: 14,
    title: "Level 14 - Splitter omleiden",
    instructions: "Gebruik een splitter voor de eerste splitsing en een spiegel om een van de takken door te sturen.",
    source: { x: 5, y: 9, dir: "up" },
    balloons: [{ x: 1, y: 6 }, { x: 8, y: 3 }],
    walls: [{ x: 5, y: 4 }, { x: 7, y: 6 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { splitter: 1, mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 15,
    title: "Level 15 - Portal met bocht",
    instructions: "Teleporteren alleen is niet genoeg. Buig na het portal ook nog af naar de ballon.",
    source: { x: 0, y: 8, dir: "right" },
    balloons: [{ x: 8, y: 0 }],
    walls: [{ x: 5, y: 8 }, { x: 5, y: 7 }],
    doors: [],
    portals: [{ id: "C", x: 3, y: 8 }, { id: "C", x: 6, y: 3 }],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 16,
    title: "Level 16 - Schakelaarroute",
    instructions: "Raak de schakelaar, open de deur en stuur daarna met een spiegel door naar boven.",
    source: { x: 0, y: 5, dir: "right" },
    balloons: [{ x: 8, y: 2 }],
    walls: [{ x: 4, y: 4 }, { x: 4, y: 6 }],
    doors: [{ id: "door-16", x: 5, y: 5 }],
    portals: [],
    switches: [{ id: "switch-16", x: 2, y: 5, targets: ["door-16"] }],
    placedObjects: [],
    inventory: { mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 17,
    title: "Level 17 - Voorgeplaatste puzzel",
    instructions: "Draai de voorgeplaatste spiegels in de juiste richting. Je hoeft niets nieuws te plaatsen.",
    source: { x: 0, y: 8, dir: "right" },
    balloons: [{ x: 8, y: 1 }],
    walls: [],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [
      { x: 2, y: 8, kind: "mirror", variant: "\\", symbol: "\\" },
      { x: 2, y: 1, kind: "mirror", variant: "\\", symbol: "\\" }
    ],
    inventory: {}
  },
  {
    id: 18,
    title: "Level 18 - Split in corridor",
    instructions: "De muurcorridor dwingt je om de splitter precies op de juiste plek te zetten.",
    source: { x: 5, y: 9, dir: "up" },
    balloons: [{ x: 2, y: 5 }, { x: 8, y: 5 }],
    walls: [{ x: 4, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 3 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { splitter: 1 }
  },
  {
    id: 19,
    title: "Level 19 - Spiegel, portal, spiegel",
    instructions: "Maak een route met een afbuiging voor het portal en een afbuiging erna.",
    source: { x: 0, y: 7, dir: "right" },
    balloons: [{ x: 9, y: 1 }],
    walls: [{ x: 5, y: 7 }, { x: 5, y: 6 }],
    doors: [],
    portals: [{ id: "D", x: 2, y: 6 }, { id: "D", x: 7, y: 3 }],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 2, mirrorBackslash: 2 }
  },
  {
    id: 20,
    title: "Level 20 - Tweerichtingsdoel",
    instructions: "Gebruik een splitter en laat beide takken nog een keer afbuigen naar de doelen.",
    source: { x: 5, y: 9, dir: "up" },
    balloons: [{ x: 1, y: 3 }, { x: 8, y: 3 }],
    walls: [{ x: 5, y: 5 }],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [],
    inventory: { splitter: 1, mirrorSlash: 2, mirrorBackslash: 2 }
  },
  {
    id: 21,
    title: "Level 21 - Dubbele portal",
    instructions: "De straal reist door twee portals voordat hij de ballon kan bereiken.",
    source: { x: 0, y: 8, dir: "right" },
    balloons: [{ x: 8, y: 0 }],
    walls: [{ x: 4, y: 8 }, { x: 4, y: 7 }, { x: 7, y: 3 }],
    doors: [],
    portals: [{ id: "E", x: 2, y: 8 }, { id: "E", x: 6, y: 5 }, { id: "F", x: 7, y: 5 }, { id: "F", x: 7, y: 2 }],
    switches: [],
    placedObjects: [],
    inventory: { mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 22,
    title: "Level 22 - Twee schakelaars",
    instructions: "Open twee deuren door eerst beide schakelaars te raken.",
    source: { x: 0, y: 5, dir: "right" },
    balloons: [{ x: 8, y: 1 }],
    walls: [{ x: 4, y: 4 }, { x: 4, y: 6 }, { x: 6, y: 2 }],
    doors: [{ id: "door-22a", x: 3, y: 5 }, { id: "door-22b", x: 5, y: 3 }],
    portals: [],
    switches: [
      { id: "switch-22a", x: 1, y: 5, targets: ["door-22a"] },
      { id: "switch-22b", x: 5, y: 5, targets: ["door-22b"] }
    ],
    placedObjects: [],
    inventory: { mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 23,
    title: "Level 23 - Drie vaste stappen",
    instructions: "Draai de vaste objecten goed en plaats daarna nog maar één extra spiegel.",
    source: { x: 0, y: 8, dir: "right" },
    balloons: [{ x: 8, y: 0 }],
    walls: [],
    doors: [],
    portals: [],
    switches: [],
    placedObjects: [
      { x: 2, y: 8, kind: "mirror", variant: "/", symbol: "/" },
      { x: 2, y: 3, kind: "mirror", variant: "\\", symbol: "\\" }
    ],
    inventory: { mirrorSlash: 1, mirrorBackslash: 1 }
  },
  {
    id: 24,
    title: "Level 24 - Splitter en deur",
    instructions: "Open eerst de route en gebruik daarna de splitter om beide ballonnen te halen.",
    source: { x: 5, y: 9, dir: "up" },
    balloons: [{ x: 1, y: 4 }, { x: 8, y: 4 }],
    walls: [{ x: 4, y: 7 }, { x: 6, y: 7 }],
    doors: [{ id: "door-24", x: 5, y: 6 }],
    portals: [],
    switches: [{ id: "switch-24", x: 5, y: 8, targets: ["door-24"] }],
    placedObjects: [],
    inventory: { splitter: 1 }
  },
  {
    id: 25,
    title: "Level 25 - Openingseindbaas",
    instructions: "Combineer alles wat je tot nu toe hebt geleerd: spiegel, splitter, portal en schakelaar.",
    source: { x: 0, y: 8, dir: "right" },
    balloons: [{ x: 1, y: 3 }, { x: 9, y: 3 }],
    walls: [{ x: 4, y: 7 }, { x: 6, y: 7 }],
    doors: [{ id: "door-25", x: 4, y: 8 }],
    portals: [{ id: "G", x: 5, y: 8 }, { id: "G", x: 7, y: 5 }],
    switches: [{ id: "switch-25", x: 2, y: 8, targets: ["door-25"] }],
    placedObjects: [],
    inventory: { splitter: 1, mirrorSlash: 1, mirrorBackslash: 1 }
  }
);

// Exacte openingstrap: de eerste 25 levels moeten scherper aanvoelen.
setExactInventory(levels[1], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[2], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[3], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[6], { splitter: 1, mirrorSlash: 1, mirrorBackslash: 0 });
setExactInventory(levels[7], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[8], { mirrorSlash: 1, mirrorBackslash: 0 });
setExactInventory(levels[9], { splitter: 1, mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[10], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[11], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[12], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[13], { splitter: 1, mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[14], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[15], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[16], {});
setExactInventory(levels[17], { splitter: 1 });
setExactInventory(levels[18], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[19], { splitter: 1, mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[20], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[21], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[22], { mirrorSlash: 1, mirrorBackslash: 1 });
setExactInventory(levels[23], { splitter: 1 });
setExactInventory(levels[24], { splitter: 1, mirrorSlash: 1, mirrorBackslash: 1 });

levels.forEach(applyDifficultyCurve);

// Handmatige correcties na de globale moeilijkheidscurve.
levels[26] = {
  id: 27,
  title: "Level 27 - Twee ballonnen met omweg",
  instructions: "Maak een omweg rond de muur en laat daarna beide ballonnen in dezelfde verticale lijn raken.",
  source: { x: 0, y: 8, dir: "right" },
  balloons: [{ x: 7, y: 1 }, { x: 7, y: 4 }],
  walls: [{ x: 4, y: 8 }, { x: 4, y: 7 }, { x: 4, y: 6 }],
  doors: [],
  portals: [],
  switches: [],
  placedObjects: [],
  inventory: { mirrorSlash: 2, mirrorBackslash: 2 }
};
