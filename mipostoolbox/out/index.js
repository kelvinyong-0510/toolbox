var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/changelog-revert.json.js
async function onRequestPost(context) {
  const { request, env } = context;
  const { logId } = await request.json();
  const logResult = await env.mipostoolbox_db.prepare("SELECT * FROM changelog WHERE id = ?").bind(logId).first();
  if (!logResult) return new Response("Log not found", { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  const { action, target_table, target_id, old_data } = logResult;
  if (action === "CREATE") {
    if (target_table === "led") await env.mipostoolbox_db.prepare("DELETE FROM led_boards WHERE id = ?").bind(target_id).run();
    if (target_table === "tutorial") await env.mipostoolbox_db.prepare("DELETE FROM tutorials WHERE id = ?").bind(target_id).run();
    await env.mipostoolbox_db.prepare("INSERT INTO changelog (action, target_table, target_id) VALUES (?, ?, ?)").bind("REVERT_CREATE", target_table, target_id).run();
  }
  if ((action === "DELETE" || action === "UPDATE") && old_data) {
    const oldRow = JSON.parse(old_data);
    if (target_table === "led") {
      await env.mipostoolbox_db.prepare("INSERT OR REPLACE INTO led_boards (id, sku, details_json) VALUES (?, ?, ?)").bind(oldRow.id, oldRow.sku, oldRow.details_json).run();
    }
    if (target_table === "tutorial") {
      await env.mipostoolbox_db.prepare("INSERT OR REPLACE INTO tutorials (id, sku, playlist_name, playlist_link, video_links_json, file_links_json) VALUES (?, ?, ?, ?, ?, ?)").bind(oldRow.id, oldRow.sku, oldRow.playlist_name || "", oldRow.playlist_link || "", oldRow.video_links_json || "[]", oldRow.file_links_json || "[]").run();
    }
    await env.mipostoolbox_db.prepare("INSERT INTO changelog (action, target_table, target_id, new_data) VALUES (?, ?, ?, ?)").bind("REVERT", target_table, target_id, old_data).run();
  }
  return new Response(JSON.stringify({ success: true }), { headers: { "Access-Control-Allow-Origin": "*" } });
}
__name(onRequestPost, "onRequestPost");
async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");

// api/changelog.json.js
async function onRequestGet(context) {
  const { env } = context;
  const { results } = await env.mipostoolbox_db.prepare("SELECT * FROM changelog ORDER BY id DESC LIMIT 100").all();
  return new Response(JSON.stringify(results, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(onRequestGet, "onRequestGet");
async function onRequestOptions2() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions2, "onRequestOptions");

// api/led-data.json.js
async function onRequestGet2(context) {
  const { env } = context;
  const { results } = await env.mipostoolbox_db.prepare("SELECT * FROM led_boards ORDER BY id DESC").all();
  const formattedData = results.map((row) => {
    return {
      id: row.id,
      SKU: row.sku,
      Details: JSON.parse(row.details_json)
    };
  });
  return new Response(JSON.stringify(formattedData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(onRequestGet2, "onRequestGet");
async function onRequestPost2(context) {
  const { request, env } = context;
  const body = await request.json();
  const stmt = env.mipostoolbox_db.prepare("INSERT INTO led_boards (sku, details_json) VALUES (?, ?) RETURNING id").bind(body.sku, body.details_json);
  const result = await stmt.first();
  await env.mipostoolbox_db.prepare("INSERT INTO changelog (action, target_table, target_id, new_data) VALUES (?, ?, ?, ?)").bind("CREATE", "led", result.id, JSON.stringify(body)).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Access-Control-Allow-Origin": "*" } });
}
__name(onRequestPost2, "onRequestPost");
async function onRequestPut(context) {
  const { request, env } = context;
  const body = await request.json();
  const oldRow = await env.mipostoolbox_db.prepare("SELECT * FROM led_boards WHERE id = ?").bind(body.id).first();
  const stmt = env.mipostoolbox_db.prepare("UPDATE led_boards SET sku = ?, details_json = ? WHERE id = ?").bind(body.sku, body.details_json, body.id);
  await stmt.run();
  await env.mipostoolbox_db.prepare("INSERT INTO changelog (action, target_table, target_id, old_data, new_data) VALUES (?, ?, ?, ?, ?)").bind("UPDATE", "led", body.id, JSON.stringify(oldRow), JSON.stringify(body)).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Access-Control-Allow-Origin": "*" } });
}
__name(onRequestPut, "onRequestPut");
async function onRequestDelete(context) {
  const { request, env } = context;
  const body = await request.json();
  const oldRow = await env.mipostoolbox_db.prepare("SELECT * FROM led_boards WHERE id = ?").bind(body.id).first();
  const stmt = env.mipostoolbox_db.prepare("DELETE FROM led_boards WHERE id = ?").bind(body.id);
  await stmt.run();
  await env.mipostoolbox_db.prepare("INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)").bind("DELETE", "led", body.id, JSON.stringify(oldRow)).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Access-Control-Allow-Origin": "*" } });
}
__name(onRequestDelete, "onRequestDelete");
async function onRequestOptions3() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions3, "onRequestOptions");

// api/tutorial-data.json.js
async function onRequestGet3(context) {
  const { env } = context;
  const { results } = await env.mipostoolbox_db.prepare("SELECT * FROM tutorials ORDER BY id DESC").all();
  const formattedData = results.map((row) => {
    const item = { id: row.id, SKU: row.sku };
    if (row.playlist_name) item.PlaylistName = row.playlist_name;
    if (row.playlist_link) item.PlaylistLink = row.playlist_link;
    try {
      const videoLinks = JSON.parse(row.video_links_json);
      if (videoLinks && videoLinks.length > 0) item.VideoLinks = videoLinks;
    } catch (e) {
    }
    try {
      const fileLinks = JSON.parse(row.file_links_json);
      if (fileLinks && fileLinks.length > 0) item.FileLinks = fileLinks;
    } catch (e) {
    }
    return item;
  });
  return new Response(JSON.stringify(formattedData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
__name(onRequestGet3, "onRequestGet");
async function onRequestPost3(context) {
  const { request, env } = context;
  const body = await request.json();
  const stmt = env.mipostoolbox_db.prepare("INSERT INTO tutorials (sku, playlist_name, playlist_link, video_links_json, file_links_json) VALUES (?, ?, ?, ?, ?) RETURNING id").bind(body.sku, body.playlist_name || "", body.playlist_link || "", body.video_links_json || "[]", body.file_links_json || "[]");
  const result = await stmt.first();
  await env.mipostoolbox_db.prepare("INSERT INTO changelog (action, target_table, target_id, new_data) VALUES (?, ?, ?, ?)").bind("CREATE", "tutorial", result.id, JSON.stringify(body)).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Access-Control-Allow-Origin": "*" } });
}
__name(onRequestPost3, "onRequestPost");
async function onRequestPut2(context) {
  const { request, env } = context;
  const body = await request.json();
  const oldRow = await env.mipostoolbox_db.prepare("SELECT * FROM tutorials WHERE id = ?").bind(body.id).first();
  const stmt = env.mipostoolbox_db.prepare("UPDATE tutorials SET sku = ?, playlist_name = ?, playlist_link = ?, video_links_json = ?, file_links_json = ? WHERE id = ?").bind(body.sku, body.playlist_name || "", body.playlist_link || "", body.video_links_json || "[]", body.file_links_json || "[]", body.id);
  await stmt.run();
  await env.mipostoolbox_db.prepare("INSERT INTO changelog (action, target_table, target_id, old_data, new_data) VALUES (?, ?, ?, ?, ?)").bind("UPDATE", "tutorial", body.id, JSON.stringify(oldRow), JSON.stringify(body)).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Access-Control-Allow-Origin": "*" } });
}
__name(onRequestPut2, "onRequestPut");
async function onRequestDelete2(context) {
  const { request, env } = context;
  const body = await request.json();
  const oldRow = await env.mipostoolbox_db.prepare("SELECT * FROM tutorials WHERE id = ?").bind(body.id).first();
  const stmt = env.mipostoolbox_db.prepare("DELETE FROM tutorials WHERE id = ?").bind(body.id);
  await stmt.run();
  await env.mipostoolbox_db.prepare("INSERT INTO changelog (action, target_table, target_id, old_data) VALUES (?, ?, ?, ?)").bind("DELETE", "tutorial", body.id, JSON.stringify(oldRow)).run();
  return new Response(JSON.stringify({ success: true }), { headers: { "Access-Control-Allow-Origin": "*" } });
}
__name(onRequestDelete2, "onRequestDelete");
async function onRequestOptions4() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions4, "onRequestOptions");

// ../.wrangler/tmp/pages-hZlUiz/functionsRoutes-0.043134524335475044.mjs
var routes = [
  {
    routePath: "/api/changelog-revert.json",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/changelog-revert.json",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/changelog.json",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/changelog.json",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/led-data.json",
    mountPath: "/api",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/led-data.json",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/led-data.json",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions3]
  },
  {
    routePath: "/api/led-data.json",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/led-data.json",
    mountPath: "/api",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/tutorial-data.json",
    mountPath: "/api",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/tutorial-data.json",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/tutorial-data.json",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions4]
  },
  {
    routePath: "/api/tutorial-data.json",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/tutorial-data.json",
    mountPath: "/api",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut2]
  }
];

// ../../../../.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
