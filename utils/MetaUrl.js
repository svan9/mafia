(function(self, factory) {
  factory(self);
})(self, function(global) {
  /**
   * @type {Document}
   */
  var document = global.document;
  /**
   * @type {self}
   */
  var window = global;
  var addMeta, parseSearches, addORChange, getMeta, restoreSearches;

  /**
   * @type {{name: string, data: JSON}[]}
   */
  var searches = [];

  addMeta = function(name, json) {
    addORChange(name, json);
    let ss = parseSearches(searches);
    if (ss == "") return;
    if (document.location.search != "?"+ss) {
      window.history.pushState(null, null, "?"+ss)
    }
  }

  window.addEventListener("load", () => {
    if (document.location.search != "") {
      searches = restoreSearches(document.location.search);
    }
  });

  getMeta = function(name) {
    return searches.find(e=>e.name==name)?.data;
  }

  addORChange = function(name, data) {
    let index = searches.findIndex((e)=>e.name == name);
    if (index != -1) {
      searches[index] = {name, data};
    } else {
      searches.push({name, data});
    }
  }
  /**
   * 
   * @param {{name: string, data: JSON}[]} searches 
   * @returns {string}
   */
  function parseSearchess(searches) {
    var str = [];

    searches.forEach(s => {
      let parsed = Base64.encode(JSON.stringify(s.data, (_key, value) => (value instanceof Set ? [...value] : value), 0));
      let search = s.name+"~"+parsed;
      str.push(search);
    });

    return str.join("&");
  }

  parseSearches = parseSearchess;

  /**
   * 
   * @param {string} search 
   * @returns {{name: string, data: JSON}[]}
   */
  function parseStringToSearches(search) {
    if (search[0] == "?") {
      search = search.split("").slice(1).join("");
    }
    var exit = [];
    var str = search.split("&");
    
    str.forEach(s=> {
      let [name, parsed] = s.split("~");
      if (parsed != void 0) {
        let data = JSON.parse(Base64.decode(parsed));
        exit.push({name, data});
      }
    });

    return exit;
  }

  restoreSearches = parseStringToSearches;

  global.restoreSearches = parseStringToSearches;
  global.parseSearches = parseSearchess;
  global.addMeta = addMeta;
  global.getMeta = getMeta;
  global.parseSearches = parseSearches;
  global.addORChange = addORChange;
});

var restoreSearches = self.restoreSearches;
var parseSearches = self.parseSearches;
var addMeta = self.addMeta;
var getMeta = self.getMeta;
var parseSearches = self.parseSearches;
var addORChange = self.addORChange;
