(() => {
  // Grid- en richtingsbasis. Deze structuur maakt het later eenvoudiger
  // om bijvoorbeeld gekleurde lasers of extra objecttypes toe te voegen.
  const GRID_SIZE = 10;
  const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };
  const TOOL_DEFS = {
    mirrorSlash: { label: "Spiegel /", symbol: "/", type: "mirror", variant: "/" },
    mirrorBackslash: { label: "Spiegel \\", symbol: "\\", type: "mirror", variant: "\\" },
    splitter: { label: "Splitter", symbol: "✣", type: "splitter" }
  };
  const EXTENSION_HOOKS = { supportsLaserColors: true, supportsBalloonColors: true };

  const gridEl = document.getElementById("gameGrid");
  const toolbarEl = document.getElementById("toolbar");
  const statusListEl = document.getElementById("statusList");
  const levelTitleEl = document.getElementById("levelTitle");
  const levelCounterEl = document.getElementById("levelCounter");
  const levelInstructionsEl = document.getElementById("levelInstructions");
  const winStateEl = document.getElementById("winState");
  const resetBtn = document.getElementById("resetBtn");
  const nextBtn = document.getElementById("nextBtn");

  let currentLevelIndex = 0;
  let selectedTool = null;
  let state = null;
  let autoAdvanceTimer = null;

  function cloneLevel(level) {
    return JSON.parse(JSON.stringify(level));
  }

  function makeKey(x, y) {
    return `${x},${y}`;
  }

  function isInside(x, y) {
    return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
  }

  function reflect(direction, variant) {
    if (variant === "/") {
      return { up: "right", right: "up", down: "left", left: "down" }[direction];
    }
    return { up: "left", left: "up", down: "right", right: "down" }[direction];
  }

  function getPortalPartner(portalId, x, y) {
    const pair = state.portals.filter((portal) => portal.id === portalId && (portal.x !== x || portal.y !== y));
    return pair[0] || null;
  }

  function getObjectAt(x, y) {
    const key = makeKey(x, y);
    if (state.playerObjects[key]) return state.playerObjects[key];
    if (state.fixedObjects[key]) return state.fixedObjects[key];
    if (state.balloonMap[key]) return state.balloonMap[key];
    return null;
  }

  function setupLevel(index) {
    clearTimeout(autoAdvanceTimer);
    // We klonen leveldata zodat resetten altijd naar de originele puzzel terug kan.
    const level = cloneLevel(levels[index]);
    state = {
      level,
      fixedObjects: {},
      playerObjects: {},
      balloonMap: {},
      portals: level.portals || [],
      inventory: level.inventory || {},
      activeSwitches: new Set(),
      poppedBalloons: new Set(),
      laserCells: {},
      solved: false
    };

    level.walls.forEach((wall, idx) => {
      state.fixedObjects[makeKey(wall.x, wall.y)] = { ...wall, kind: "wall", symbol: "■", id: wall.id || `wall-${idx}` };
    });
    level.doors.forEach((door) => {
      state.fixedObjects[makeKey(door.x, door.y)] = { ...door, kind: "door", symbol: "■" };
    });
    level.portals.forEach((portal) => {
      state.fixedObjects[makeKey(portal.x, portal.y)] = { ...portal, kind: "portal", symbol: portal.id };
    });
    level.switches.forEach((toggle) => {
      state.fixedObjects[makeKey(toggle.x, toggle.y)] = { ...toggle, kind: "switch", symbol: "⌘" };
    });
    level.placedObjects.forEach((object) => {
      state.playerObjects[makeKey(object.x, object.y)] = { ...object, owner: "player" };
    });
    level.balloons.forEach((balloon, idx) => {
      state.balloonMap[makeKey(balloon.x, balloon.y)] = { ...balloon, kind: "balloon", symbol: "○", id: balloon.id || `balloon-${idx}` };
    });

    selectedTool = null;
    recalculateLaser();
    render();
  }

  function addLaserConnection(x, y, direction) {
    const key = makeKey(x, y);
    if (!state.laserCells[key]) state.laserCells[key] = new Set();
    state.laserCells[key].add(direction);
  }

  function activateSwitch(target) {
    state.activeSwitches.add(target.id);
  }

  function isDoorOpen(door) {
    return levelHasSwitchEffect(door.id);
  }

  function levelHasSwitchEffect(targetId) {
    return Array.from(state.activeSwitches).some((switchId) => {
      const switchObject = Object.values(state.fixedObjects).find((obj) => obj.kind === "switch" && obj.id === switchId);
      return switchObject?.targets?.includes(targetId);
    });
  }

  function recalculateLaser() {
    // Elke wijziging in het level triggert een volledige herberekening van
    // de laser, inclusief switchstatus en al geknapte ballonnen.
    state.activeSwitches = new Set();
    state.poppedBalloons = new Set();
    state.laserCells = {};

    const queue = [{
      x: state.level.source.x,
      y: state.level.source.y,
      dir: state.level.source.dir,
      color: "base"
    }];
    // Cel + richting + actieve switchstatus voorkomt oneindige lussen.
    const visited = new Set();
    let guard = 0;

    while (queue.length && guard < 2500) {
      const beam = queue.shift();
      let currentX = beam.x;
      let currentY = beam.y;
      let direction = beam.dir;
      let active = true;

      while (active && guard < 2500) {
        guard += 1;
        const delta = DIRECTIONS[direction];
        const nextX = currentX + delta.x;
        const nextY = currentY + delta.y;

        if (!isInside(nextX, nextY)) break;

        const switchKey = Array.from(state.activeSwitches).sort().join("|");
        const visitKey = `${nextX},${nextY},${direction},${switchKey}`;
        if (visited.has(visitKey)) break;
        visited.add(visitKey);

        addLaserConnection(nextX, nextY, OPPOSITE[direction]);

        const target = getObjectAt(nextX, nextY);
        if (!target) {
          addLaserConnection(nextX, nextY, direction);
          currentX = nextX;
          currentY = nextY;
          continue;
        }

        if (target.kind === "balloon") {
          state.poppedBalloons.add(target.id);
          addLaserConnection(nextX, nextY, direction);
          currentX = nextX;
          currentY = nextY;
          continue;
        }

        if (target.kind === "wall") {
          active = false;
          continue;
        }

        if (target.kind === "door") {
          if (isDoorOpen(target)) {
            addLaserConnection(nextX, nextY, direction);
            currentX = nextX;
            currentY = nextY;
            continue;
          }
          active = false;
          continue;
        }

        if (target.kind === "switch") {
          activateSwitch(target);
          addLaserConnection(nextX, nextY, direction);
          currentX = nextX;
          currentY = nextY;
          continue;
        }

        if (target.kind === "portal") {
          addLaserConnection(nextX, nextY, direction);
          const partner = getPortalPartner(target.id, nextX, nextY);
          if (!partner) break;
          currentX = partner.x;
          currentY = partner.y;
          addLaserConnection(currentX, currentY, direction);
          continue;
        }

        if (target.kind === "mirror") {
          const newDir = reflect(direction, target.variant);
          addLaserConnection(nextX, nextY, newDir);
          direction = newDir;
          currentX = nextX;
          currentY = nextY;
          continue;
        }

        if (target.kind === "splitter") {
          // Splitter maakt altijd twee nieuwe stralen loodrecht op de inkomende.
          const newDirections = (direction === "left" || direction === "right") ? ["up", "down"] : ["left", "right"];
          newDirections.forEach((newDir) => {
            addLaserConnection(nextX, nextY, newDir);
            queue.push({ x: nextX, y: nextY, dir: newDir, color: beam.color });
          });
          active = false;
        }
      }
    }

    state.solved = state.level.balloons.every((balloon) => state.poppedBalloons.has(balloon.id || `balloon-${state.level.balloons.indexOf(balloon)}`));

    if (state.solved && currentLevelIndex < levels.length - 1) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = setTimeout(() => {
        if (state?.solved && currentLevelIndex < levels.length - 1) {
          currentLevelIndex += 1;
          setupLevel(currentLevelIndex);
        }
      }, 900);
    }
  }

  function getSourceSymbol(direction) {
    return { up: "▲", down: "▼", left: "◀", right: "▶" }[direction];
  }

  function buildLaserSvg(connections) {
    const center = 29;
    const points = { up: [center, 0], down: [center, 58], left: [0, center], right: [58, center] };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    connections.forEach((direction) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", center);
      line.setAttribute("y1", center);
      line.setAttribute("x2", points[direction][0]);
      line.setAttribute("y2", points[direction][1]);
      svg.appendChild(line);
    });
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", center);
    circle.setAttribute("cy", center);
    circle.setAttribute("r", 4);
    svg.appendChild(circle);
    return svg;
  }

  function createCell(x, y) {
    const key = makeKey(x, y);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.x = x;
    cell.dataset.y = y;

    const target = getObjectAt(x, y);
    const laserLayer = document.createElement("div");
    laserLayer.className = "laser-layer";
    if (state.laserCells[key]) {
      laserLayer.appendChild(buildLaserSvg(state.laserCells[key]));
    }
    cell.appendChild(laserLayer);

    const content = document.createElement("div");
    content.className = "cell-content";

    if (state.level.source.x === x && state.level.source.y === y) {
      content.textContent = getSourceSymbol(state.level.source.dir);
      content.classList.add("cell-source");
    } else if (target) {
      content.textContent = target.symbol || "";
      content.classList.add(`cell-${target.kind}`);
      if (target.kind === "balloon" && state.poppedBalloons.has(target.id)) {
        content.textContent = "✦";
        content.classList.add("popped");
      }
      if (target.kind === "door" && isDoorOpen(target)) {
        content.textContent = "▫";
        content.classList.add("open");
      }
      if (target.kind === "switch" && state.activeSwitches.has(target.id)) {
        content.textContent = "⚡";
        content.classList.add("active");
      }
      if (target.owner === "player") {
        content.classList.add("cell-player");
        const badge = document.createElement("span");
        badge.className = "tool-badge";
        badge.textContent = target.kind === "mirror" ? target.variant : target.symbol;
        cell.appendChild(badge);
      }
    }

    cell.appendChild(content);

    cell.addEventListener("click", () => handleCellClick(x, y));
    cell.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      handleRemoveObject(x, y);
    });

    return cell;
  }

  function renderGrid() {
    gridEl.innerHTML = "";
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        gridEl.appendChild(createCell(x, y));
      }
    }
  }

  function renderToolbar() {
    toolbarEl.innerHTML = "";
    Object.entries(TOOL_DEFS).forEach(([toolKey, toolDef]) => {
      const count = state.inventory[toolKey] ?? 0;
      if (!count) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = `tool-btn${selectedTool === toolKey ? " selected" : ""}`;
      button.innerHTML = `<strong>${toolDef.label}</strong><div>${toolDef.symbol} <span class="count">${count} beschikbaar</span></div>`;
      button.addEventListener("click", () => {
        selectedTool = selectedTool === toolKey ? null : toolKey;
        renderToolbar();
      });
      toolbarEl.appendChild(button);
    });

    if (!toolbarEl.children.length) {
      toolbarEl.innerHTML = `<p class="help-text">In dit level zijn geen plaatsbare objecten beschikbaar.</p>`;
    }
  }

  function renderStatus() {
    const total = state.level.balloons.length;
    const popped = state.poppedBalloons.size;
    const cards = [
      {
        title: "Ballonnen",
        text: `${popped} van ${total} geknapt`,
        state: popped === total ? "Alle doelen gehaald" : "Nog niet compleet"
      },
      {
        title: "Switches",
        text: state.level.switches.length ? `${state.activeSwitches.size} actief` : "Geen in dit level",
        state: state.level.switches.length ? "Schakelstatus live" : "Niet van toepassing"
      },
      {
        title: "Engine",
        text: "Loopbeveiliging actief",
        state: EXTENSION_HOOKS.supportsLaserColors ? "Klaar voor uitbreidingen" : "Basisversie"
      }
    ];

    statusListEl.innerHTML = "";
    cards.forEach((card) => {
      const element = document.createElement("div");
      element.className = "status-card";
      element.innerHTML = `<strong>${card.title}</strong><div>${card.text}</div><div class="cell-note">${card.state}</div>`;
      statusListEl.appendChild(element);
    });

    if (state.level.switches.length) {
      state.level.switches.forEach((toggle) => {
        const element = document.createElement("div");
        element.className = "status-card";
        const active = state.activeSwitches.has(toggle.id);
        element.innerHTML = `
          <strong>Schakelaar ${toggle.id}</strong>
          <div>${active ? "Geactiveerd door de laser" : "Nog niet geraakt"}</div>
          <div class="target-list">Doelen: ${toggle.targets.join(", ")}</div>
        `;
        statusListEl.appendChild(element);
      });

      state.level.doors.forEach((door) => {
        const element = document.createElement("div");
        element.className = "status-card";
        const open = isDoorOpen(door);
        element.innerHTML = `
          <strong>Deur ${door.id}</strong>
          <div>${open ? "Open - laser kan door" : "Gesloten - blokkeert de laser"}</div>
          <div class="cell-note">${open ? "Actief gekoppeld aan schakelaar" : "Wacht op schakelaar"}</div>
        `;
        statusListEl.appendChild(element);
      });
    }
  }

  function renderMeta() {
    levelTitleEl.textContent = state.level.title;
    levelCounterEl.textContent = `${currentLevelIndex + 1} / ${levels.length}`;
    levelInstructionsEl.textContent = state.level.instructions;
    winStateEl.textContent = state.solved
      ? (currentLevelIndex < levels.length - 1 ? "Level opgelost - doorgaan..." : "Level opgelost")
      : "Nog niet opgelost";
    winStateEl.className = `meta-pill ${state.solved ? "solved" : "unsolved"}`;
    const canAdvance = state.solved && currentLevelIndex < levels.length - 1;
    nextBtn.disabled = !canAdvance;
    if (canAdvance) {
      nextBtn.removeAttribute("disabled");
    } else {
      nextBtn.setAttribute("disabled", "disabled");
    }
  }

  function render() {
    renderMeta();
    renderGrid();
    renderToolbar();
    renderStatus();
  }

  function createPlayerObject(toolKey, x, y) {
    const tool = TOOL_DEFS[toolKey];
    if (!tool) return null;
    if (tool.type === "mirror") {
      return { x, y, kind: "mirror", variant: tool.variant, symbol: tool.variant, owner: "player" };
    }
    return { x, y, kind: tool.type, symbol: tool.symbol, owner: "player" };
  }

  function rotateObject(obj) {
    if (obj.kind === "mirror") {
      obj.variant = obj.variant === "/" ? "\\" : "/";
      obj.symbol = obj.variant;
    }
  }

  function handleCellClick(x, y) {
    const key = makeKey(x, y);
    if (state.level.source.x === x && state.level.source.y === y) return;

    const fixed = state.fixedObjects[key];
    const player = state.playerObjects[key];
    if (fixed) return;

    if (player) {
      rotateObject(player);
      recalculateLaser();
      render();
      return;
    }

    if (!selectedTool) return;
    if ((state.inventory[selectedTool] ?? 0) <= 0) return;
    if (state.balloonMap[key] || state.fixedObjects[key]) return;

    state.playerObjects[key] = createPlayerObject(selectedTool, x, y);
    state.inventory[selectedTool] -= 1;
    recalculateLaser();
    render();
  }

  function handleRemoveObject(x, y) {
    const key = makeKey(x, y);
    const player = state.playerObjects[key];
    if (!player) return;
    const toolKey = player.kind === "mirror"
      ? (player.variant === "/" ? "mirrorSlash" : "mirrorBackslash")
      : "splitter";
    state.inventory[toolKey] = (state.inventory[toolKey] ?? 0) + 1;
    delete state.playerObjects[key];
    recalculateLaser();
    render();
  }

  function goToNextLevel() {
    if (!state.solved || currentLevelIndex >= levels.length - 1) return;
    currentLevelIndex += 1;
    setupLevel(currentLevelIndex);
  }

  function tryAdvanceLevel(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    goToNextLevel();
  }

  resetBtn.addEventListener("click", () => setupLevel(currentLevelIndex));
  nextBtn.addEventListener("click", tryAdvanceLevel);
  nextBtn.addEventListener("pointerdown", tryAdvanceLevel);
  winStateEl.addEventListener("click", tryAdvanceLevel);

  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key.toLowerCase() === "n") && state?.solved) {
      tryAdvanceLevel(event);
    }
  });

  setupLevel(currentLevelIndex);
})();
