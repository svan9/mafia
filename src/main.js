// addMeta("meta", {some: "some"});

/**
 * @type {{name: string, role: string}[]}
 */
var players = [];

const roles = {
  doctor: "доктор",
  commissar: "комиссар",
  lover: "путана",
  maniac: "маньяк",
  master: "ведущий",
  mafia: "мафия",
  civilian: "мирный",
  none: "не выбран"
}

const rolesWithEmoji = {
  doctor: "🌡️доктор",
  commissar: "🕵️комиссар",
  lover: "💌путана",
  maniac: "🔪маньяк",
  master: "🎙️ведущий",
  mafia: "🎩мафия",
  civilian: "🌇мирный",
  none: "🛑не выбран"
}

/**
 * @type {{name: string, role: string, mods: Set<string>}[]}
 */
var player_row = [
  // { name: "олег", role: "ga", mods: new Set() },
];

function stringifyPlayerRow(player_row) {
  var str = [];
  for (let player of player_row) {
    str.push([player.name, player.role, [...player.mods].join("$")].join("/"));
  }
  return str.join("|");
}

function parsePlayerRow(string) {
  if (string == void 0) return void 0;
  return (
    string
      .split("|")
      .map(e=>e.split("/"))
      .map(
        ([name, role, mods]) => 
          ({
            name, 
            role, 
            mods: (new Set(mods?.split("$")?.filter(e=>e!="")) ?? new Set())}))
  );
}

function genMods(mods) {
  return (
    (mods.has("kill") ? "k" : "") +
    (mods.has("heal") ? "h" : "") +
    (mods.has("kiss") ? "s" : "")
    );
}


function generateCard(rolename, player) {
  return /*html*/`
  <div class="card" 
    data-hasrole="false" 
    data-player="${player}" 
    data-role="${roles[rolename] == void 0 ? "none": rolename}" 
    data-mods=""
    >
    <div class="card-text">
      <label class="role-name">${roles[rolename] ?? roles.none}</label>
      <label class="nickname">${player}</label>
    </div>
    <div class="card-icon"></div>
    <div class="card-actions">
      <div class="kill"></div>
      <div class="heal"></div>
      <div class="kiss"></div>
    </div>
  </div>
`;
}


window.addEventListener("load", () => {
  player_row = parsePlayerRow(getMeta("player_row")) ?? player_row;
  player_row.forEach(e=>{(e??{}).mods = new Set(e?.mods)});

  restoreCards();

  function restoreCards() {
    $(".card-holder")[0].innerHTML = "";
    player_row.forEach(e => {
      if (e==null) return;
      $(".card-holder")[0].innerHTML += generateCard(e.role, e.name);
    });
  
  }

  for (let key in roles) {
    $(".select-hero-menu .inner")[0].innerHTML += /*html*/`<div id="${key}" class="style-fcc"><span>${rolesWithEmoji[key]+""}</span></div>`
  }

  $(".select-hero-menu").on("click", ".close", function(ev) {
    $(ev.delegateTarget).attr("hidden", "");
  });

  restoreBurgerList();
  
  $(".select-hero-menu").on("click", ".inner > *", function(ev) {
    if ($(this).hasClass("close")) return;
    
    let sc = $(ev.delegateTarget).attr("selectedCell");
    let card = $(".card-holder")[0].children.item(sc);
    let index = player_row.findIndex(e=>e.name == card.dataset.player);
    player_row[index].role = this.id;

    let rolename = player_row[index].role;

    card.querySelector(".role-name").innerHTML = roles[rolename] ?? roles.none;
    card.dataset.role = `${roles[rolename] == void 0 ? "none": rolename}`

    setTimeout(() => {
      $(ev.delegateTarget).attr("hidden", "true")
    }, 200);
  });

  for(let card of $(".card-holder").children(".card")) {
    cardUpdateMods(card, card.dataset.player);
  }
  var clicks = 0;
  var last_this = null;
  var timeout = null;

  $(".card-holder").on("mouseup", ".card", function(ev) {
    if (
      $(ev.target).hasClass("kiss") ||
      $(ev.target).hasClass("heal") ||
      $(ev.target).hasClass("kill") 
    ) {
      clicks = 0;
      last_this = null;
      clearTimeout(timeout);
      return;
    }
    if (last_this == null) {
      last_this = this;
    }
    if (last_this != this) {
      clicks = 0;
      last_this = null;
      clearTimeout(timeout);
      return;
    }
    clicks++;
    
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      clicks--;
      if (clicks < 0 ) clicks = 0;
    }, 1000);

    if (clicks == 2) {
      onCardHolderHold.call(this, ev.delegateTarget);
      clicks = 0;
      last_this = null;
    }
  });
  
  /**
   * 
   * @param {HTMLElement} parent 
   */
  function onCardHolderHold(parent) {
    let index = [...parent.children].indexOf(this);
    $(".select-hero-menu")[0].dataset.right = !(index % 2 == 0)+"";
    $(".select-hero-menu").removeAttr("hidden");
    $(".select-hero-menu").attr("selectedCell", index);
    $(".select-hero-menu").attr("style", "--_ycell: " + (parseInt(index/2)+1));
  }

  $(".card-holder").on("click", ".card .kiss", function(ev) {
    let player = ev.target.parentElement.parentElement.dataset.player;
    player_row.forEach(e => {
      if (e.name == player) {
        e.mods.has("kiss") 
          ? (e.mods.delete("kiss"))
          : e.mods.add("kiss");
      }
    });

    cardUpdateMods(ev.target.parentElement.parentElement, player);
  });

  $(".card-holder").on("click", ".card .heal", function(ev) {
    let player = ev.target.parentElement.parentElement.dataset.player;
    player_row.forEach(e => {
      if (e.name == player) {
        e.mods.has("heal") 
          ? (e.mods.delete("heal"))
          : e.mods.add("heal");
      }
    });
    cardUpdateMods(ev.target.parentElement.parentElement, player);

  });

  $(".card-holder").on("click", ".card .kill", function(ev) {
    let player = ev.target.parentElement.parentElement.dataset.player;
    player_row.forEach(e => {
      if (e.name == player) {
        e.mods.has("kill") 
          ? (e.mods.delete("kill"))
          : e.mods.add("kill");
      }
    });
    cardUpdateMods(ev.target.parentElement.parentElement, player);
  });

  /**
   * 
   * @param {HTMLElement} card 
   * @param {String} player 
   */
  function cardUpdateMods(card, player) {
    player_row.forEach(e => {
      if (e.name == player) {
        card.dataset.mods = genMods(e.mods);
      }
    });
  }


  $("body").on("click", ".upper-hud #home", () => {
    document.location.search = "";
  });
  
  $("body").on("click", ".upper-hud #burger", () => {
    $(".burger-menu")[0].dataset.open = $(".burger-menu")[0].dataset.open == "false" ? "true" : "false";
  });
  
  $("body").on("click", ".upper-hud #resert", () => {
    player_row.forEach(e=>{
      e.mods.clear();
      e.role = "none";
    });

    restoreCards();
  });

  setInterval(() => {
    addMeta("player_row", stringifyPlayerRow(player_row));
  }, 500);


  $(".burger-menu .inner").on("click", ".send", function(ev) {
    let text = $(ev.delegateTarget).find(".input input").val();

    if (text == void 0 || text.trim() == "") return;

    $(ev.delegateTarget)
      .children(".list")[0]
      .innerHTML += /*html*/`
      <div class="element">
        <label>${text}</label>
        <div class="remove emoji">🔴</div>
      </div>`;

    player_row.push({name: text, role: "none", mods: new Set()});

    $(".card-holder")[0].innerHTML += generateCard("none", text);
  });

  $(".burger-menu .inner .list").on("click", ".element .remove", function(ev) {
    let index = player_row.findIndex(e=>e.name == ev.target.parentElement.querySelector("label").innerHTML)
    $(".card-holder").find(`.card[data-player="${player_row[index].name}"]`).remove();
    player_row.splice(index, 1);
    ev.target.parentElement.remove();
  });

  function restoreBurgerList() {
    player_row.forEach(({name})=>{
      $(".burger-menu .inner .list")[0].innerHTML += /*html*/`
      <div class="element">
        <label>${name}</label>
        <div class="remove emoji">🔴</div>
      </div>`;
    });
  }

  function reupdatePlayerRow() {
    player_row = [];

    $(".burger-menu .inner .list")
      .children()
      .toArray()
      .map(e=>e.querySelector("label").innerHTML)
      .forEach(name=>{
        player_row.push({name: name, role: "none", mods: new Set()});
      });
  }

});
