self.importScripts("./turbocommons-es5.js");
let StringUtils = org_turbocommons.StringUtils;

/**
 * station code
 * e.g. "KM"
 */
let abbrs = [];

/**
 * station code (lowercased)
 * e.g. "km"
 */
let abbrsLower = [];

/**
 * e.g. "BF"
 */
let types = [];

/**
 * human-readable station name
 * e.g. "Mönchengladbach Hbf"
 */
let names = [];

/**
 * human-readable station name (lowercased)
 * e.g. "mönchengladbach hbf"
 */
let namesLower = [];

/**
 * human-readable shortened station name (lowercased)
 * e.g. "m'gladbach hbf"
 */
let snamesLower = [];

async function loadAndParseStops() {
  await fetch("stops.csv")
    .then((response) => response.text())
    .then((stopsCsv) => {
      stopsCsv = stopsCsv.split("\n");
      for (let i = 1; i < stopsCsv.length; i++) {
        /*
         * Sample Line:
         * DE17110;KM;Mönchengladbach Hbf;M'gladbach Hbf;BF;Bf;Betrieb;20201001;;3;West;20201029
         */
        let fields = stopsCsv[i].split(";");
        if (
          fields.length > 4 &&
          (fields[4].toLowerCase() == "bf" ||
            fields[4].toLowerCase() == "hp") &&
          !fields[2].includes(" Gbf") &&
          !fields[2].includes(" Hgbf") &&
          !fields[2].includes(" Rbf")
        ) {
          abbrs.push(fields[1]);
          abbrsLower.push(fields[1].toLowerCase());
          names.push(fields[2]);
          namesLower.push(fields[2].toLowerCase());
          snamesLower.push(fields[3].toLowerCase());
          types.push(fields[4]);
        } else {
          /*console.log('Uebersprungen: '+fields[2]
                    +' (Kuerzel: '+fields[0]+', Typ: '
                    +fields[4]+')')*/
        }
      }
      console.log(
        "ingesamt " + abbrs.length + " bahnhoefe/haltepunkte geladen."
      );
    });
}

/**
 * finds the smallest value within an array
 * and returns its index
 */
function argmin(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? r : a))[1];
}

/**
 * Takes two strings, compares them,
 * and returns a number representing the
 * difference of them.
 *
 * The higher the number - the more difference
 */
function stringDistance(s1, s2) {
  return (
    StringUtils.compareByLevenshtein(s1, s2) -
    Math.sqrt(Math.abs(s2.length - s1.length))
  );
}

function search(params) {
  const { query, lines, dir, fullSearch } = params;

  /**
   * list of indices of "direct matches"
   * MOVE!
   */
  let incIs = [];

  /**
   * stores the difference value of the search query
   * to the station name at the particular index.
   *
   * if it's a direct match, it will instead be hard-locked
   * to 1e99;
   * MOVE!
   */
  let sims = [];

  /*
   * a variant of the query where umlaut substitudes
   * are replaced with their original umlauts
   * MOVE!
   */
  querySub = query
    .replace("ae", "ä")
    .replace("oe", "ö")
    .replace("ue", "ü")
    .replace("ss", "ß");

  /**
   * matches each station by the query
   * MOVE!
   */
  for (let i = 0; i < abbrs.length; i++) {
    /**
     * searches for "direct matches"
     * within the names, shortnames and abbreviations,
     * disregarding case-sensitivity
     */
    let isMatch = true;
    if (query.length > 2) {
      let q = query.split(" ");
      let qSub = querySub.split(" ");
      /**
       * tries direct-matching for individual words of the query,
       * e.g. "köln essen" matching both "Köln" and "Essen" directly,
       * because "köln hbf" includes "köln" and "essen hbf" includes "essen"
       */
      for (let j = 0; j < q.length; j++) {
        if (
          !namesLower[i].includes(q[j]) &&
          !snamesLower[i].includes(q[j]) &&
          !abbrsLower[i].includes(q[j]) &&
          !namesLower[i].includes(qSub[j]) &&
          !snamesLower[i].includes(qSub[j])
        ) {
          isMatch = false;
        }
      }
    } else {
      isMatch = false;
    }
    if (isMatch) {
      incIs.push(i);
      sims.push(1e99);
    } else {
      /**
       * "expensive" string distance operation
       * is skipped if we're not doing a full search!
       */
      if (fullSearch) {
        sims.push(
          Math.min(
            stringDistance(query, namesLower[i]),
            stringDistance(querySub, namesLower[i])
          )
        );
      } else {
        sims.push(1e99);
      }
    }
  }

  /**
   * a html string containing the result links
   * MOVE!
   */
  let resStr = "";
  /**
   * number of result outputs
   * MOVE!
   */
  let resCount = 0;

  function makeLink(i) {
    return (
      '<a href="https://iris.noncd.db.de/wbt/js/index.html?' +
      "typ=" +
      dir +
      "&style=" +
      dir +
      "&bhf=" +
      abbrs[i] +
      "&Zeilen=" +
      lines +
      '" class="suggestEntry">' +
      "<span>" +
      names[i] +
      "</span><span>" +
      types[i] +
      "</span></a>"
    );
  }

  /**
   * step 1: fill in all "direct matches" into the "result string"
   *
   * if we have too many, we add an ellipsis indicating "there's more"
   */
  for (let i = 0; i < incIs.length; i++) {
    resStr += makeLink(incIs[i]);
    resCount++;
    if (resCount >= 20) {
      resStr += "...";
      break;
    }
  }

  let prefix = "";
  if (fullSearch && resCount > 0) {
    prefix += "<hr />";
  }

  /**
   * while we have less than 15 results, find the "next best result"
   * by similarity (with a threshold) and append it to the "result string" as well
   */
  while (resCount < 15) {
    if (sims.length == 0) {
      break;
    }
    bestI = argmin(sims);
    if (query.length <= 2 || sims[bestI] / query.length > 0.9) {
      break;
    }
    sims[bestI] = 1e99;
    resStr += prefix + makeLink(bestI);
    prefix = "";
    resCount++;
  }

  return resStr;
}

const loaded = loadAndParseStops();

self.addEventListener('message', async (e) => {
  const [nonce, params] = e.data;

  await loaded;

  const result = search(params);
  self.postMessage([nonce, result]);
});