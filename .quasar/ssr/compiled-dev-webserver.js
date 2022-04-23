var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src-ssr/middlewares/render.js
var render_exports = {};
__export(render_exports, {
  default: () => render_default
});
var import_wrappers, render_default;
var init_render = __esm({
  "src-ssr/middlewares/render.js"() {
    import_wrappers = require("quasar/wrappers");
    render_default = (0, import_wrappers.ssrMiddleware)(({ app, resolve, render, serve }) => {
      app.get(resolve.urlPath("*"), (req, res) => {
        res.setHeader("Content-Type", "text/html");
        render({ req, res }).then((html) => {
          res.send(html);
        }).catch((err) => {
          if (err.url) {
            if (err.code) {
              res.redirect(err.code, err.url);
            } else {
              res.redirect(err.url);
            }
          } else if (err.code === 404) {
            res.status(404).send("404 | Page Not Found");
          } else if (true) {
            serve.error({ err, req, res });
          } else {
            res.status(500).send("500 | Internal Server Error");
          }
        });
      });
    });
  }
});

// .quasar/ssr-dev-webserver.js
var ssr_dev_webserver_exports = {};
__export(ssr_dev_webserver_exports, {
  close: () => close,
  create: () => create,
  injectMiddlewares: () => injectMiddlewares,
  listen: () => listen,
  serveStaticContent: () => serveStaticContent
});
module.exports = __toCommonJS(ssr_dev_webserver_exports);

// src-ssr/server.js
var import_express = __toESM(require("express"));
var import_compression = __toESM(require("compression"));
function create() {
  const app = (0, import_express.default)();
  if (false) {
    app.use((0, import_compression.default)());
  }
  return app;
}
async function listen({ app, port, isReady }) {
  await isReady();
  return await app.listen(port, () => {
    if (false) {
      console.log("Server listening at port " + port);
    }
  });
}
function close({ listenResult }) {
  return listenResult.close();
}
var maxAge = true ? 0 : 1e3 * 60 * 60 * 24 * 30;
function serveStaticContent(path, opts) {
  return import_express.default.static(path, __spreadValues({
    maxAge
  }, opts));
}

// .quasar/ssr-middlewares.js
function injectMiddlewares(opts) {
  return Promise.all([
    Promise.resolve().then(() => (init_render(), render_exports))
  ]).then(async (rawMiddlewares) => {
    const middlewares = rawMiddlewares.map((entry) => entry.default);
    for (let i = 0; i < middlewares.length; i++) {
      try {
        await middlewares[i](opts);
      } catch (err) {
        console.error("[Quasar SSR] middleware error:", err);
        return;
      }
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  close,
  create,
  injectMiddlewares,
  listen,
  serveStaticContent
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjLXNzci9taWRkbGV3YXJlcy9yZW5kZXIuanMiLCAiLi4vc3NyLWRldi13ZWJzZXJ2ZXIuanMiLCAiLi4vLi4vc3JjLXNzci9zZXJ2ZXIuanMiLCAiLi4vc3NyLW1pZGRsZXdhcmVzLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBzc3JNaWRkbGV3YXJlIH0gZnJvbSAncXVhc2FyL3dyYXBwZXJzJ1xuXG4vLyBUaGlzIG1pZGRsZXdhcmUgc2hvdWxkIGV4ZWN1dGUgYXMgbGFzdCBvbmVcbi8vIHNpbmNlIGl0IGNhcHR1cmVzIGV2ZXJ5dGhpbmcgYW5kIHRyaWVzIHRvXG4vLyByZW5kZXIgdGhlIHBhZ2Ugd2l0aCBWdWVcblxuZXhwb3J0IGRlZmF1bHQgc3NyTWlkZGxld2FyZSgoeyBhcHAsIHJlc29sdmUsIHJlbmRlciwgc2VydmUgfSkgPT4ge1xuICAvLyB3ZSBjYXB0dXJlIGFueSBvdGhlciBFeHByZXNzIHJvdXRlIGFuZCBoYW5kIGl0XG4gIC8vIG92ZXIgdG8gVnVlIGFuZCBWdWUgUm91dGVyIHRvIHJlbmRlciBvdXIgcGFnZVxuICBhcHAuZ2V0KHJlc29sdmUudXJsUGF0aCgnKicpLCAocmVxLCByZXMpID0+IHtcbiAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJylcblxuICAgIHJlbmRlcigvKiB0aGUgc3NyQ29udGV4dDogKi8geyByZXEsIHJlcyB9KVxuICAgICAgLnRoZW4oaHRtbCA9PiB7XG4gICAgICAgIC8vIG5vdyBsZXQncyBzZW5kIHRoZSByZW5kZXJlZCBodG1sIHRvIHRoZSBjbGllbnRcbiAgICAgICAgcmVzLnNlbmQoaHRtbClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgLy8gb29wcywgd2UgaGFkIGFuIGVycm9yIHdoaWxlIHJlbmRlcmluZyB0aGUgcGFnZVxuXG4gICAgICAgIC8vIHdlIHdlcmUgdG9sZCB0byByZWRpcmVjdCB0byBhbm90aGVyIFVSTFxuICAgICAgICBpZiAoZXJyLnVybCkge1xuICAgICAgICAgIGlmIChlcnIuY29kZSkge1xuICAgICAgICAgICAgcmVzLnJlZGlyZWN0KGVyci5jb2RlLCBlcnIudXJsKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXMucmVkaXJlY3QoZXJyLnVybClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyLmNvZGUgPT09IDQwNCkge1xuICAgICAgICAgIC8vIGhtbSwgVnVlIFJvdXRlciBjb3VsZCBub3QgZmluZCB0aGUgcmVxdWVzdGVkIHJvdXRlXG5cbiAgICAgICAgICAvLyBTaG91bGQgcmVhY2ggaGVyZSBvbmx5IGlmIG5vIFwiY2F0Y2gtYWxsXCIgcm91dGVcbiAgICAgICAgICAvLyBpcyBkZWZpbmVkIGluIC9zcmMvcm91dGVzXG4gICAgICAgICAgcmVzLnN0YXR1cyg0MDQpLnNlbmQoJzQwNCB8IFBhZ2UgTm90IEZvdW5kJylcbiAgICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5ERVYpIHtcbiAgICAgICAgICAvLyB3ZWxsLCB3ZSB0cmVhdCBhbnkgb3RoZXIgY29kZSBhcyBlcnJvcjtcbiAgICAgICAgICAvLyBpZiB3ZSdyZSBpbiBkZXYgbW9kZSwgdGhlbiB3ZSBjYW4gdXNlIFF1YXNhciBDTElcbiAgICAgICAgICAvLyB0byBkaXNwbGF5IGEgbmljZSBlcnJvciBwYWdlIHRoYXQgY29udGFpbnMgdGhlIHN0YWNrXG4gICAgICAgICAgLy8gYW5kIG90aGVyIHVzZWZ1bCBpbmZvcm1hdGlvblxuXG4gICAgICAgICAgLy8gc2VydmUuZXJyb3IgaXMgYXZhaWxhYmxlIG9uIGRldiBvbmx5XG4gICAgICAgICAgc2VydmUuZXJyb3IoeyBlcnIsIHJlcSwgcmVzIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gd2UncmUgaW4gcHJvZHVjdGlvbiwgc28gd2Ugc2hvdWxkIGhhdmUgYW5vdGhlciBtZXRob2RcbiAgICAgICAgICAvLyB0byBkaXNwbGF5IHNvbWV0aGluZyB0byB0aGUgY2xpZW50IHdoZW4gd2UgZW5jb3VudGVyIGFuIGVycm9yXG4gICAgICAgICAgLy8gKGZvciBzZWN1cml0eSByZWFzb25zLCBpdCdzIG5vdCBvayB0byBkaXNwbGF5IHRoZSBzYW1lIHdlYWx0aFxuICAgICAgICAgIC8vIG9mIGluZm9ybWF0aW9uIGFzIHdlIGRvIGluIGRldmVsb3BtZW50KVxuXG4gICAgICAgICAgLy8gUmVuZGVyIEVycm9yIFBhZ2Ugb24gcHJvZHVjdGlvbiBvclxuICAgICAgICAgIC8vIGNyZWF0ZSBhIHJvdXRlICgvc3JjL3JvdXRlcykgZm9yIGFuIGVycm9yIHBhZ2UgYW5kIHJlZGlyZWN0IHRvIGl0XG4gICAgICAgICAgcmVzLnN0YXR1cyg1MDApLnNlbmQoJzUwMCB8IEludGVybmFsIFNlcnZlciBFcnJvcicpXG4gICAgICAgICAgLy8gY29uc29sZS5lcnJvcihlcnIuc3RhY2spXG4gICAgICAgIH1cbiAgICAgIH0pXG4gIH0pXG59KVxuIiwgIi8qIGVzbGludC1kaXNhYmxlICovXG4vKipcbiAqIFRISVMgRklMRSBJUyBHRU5FUkFURUQgQVVUT01BVElDQUxMWS5cbiAqIERPIE5PVCBFRElULlxuICoqL1xuXG5pbXBvcnQgeyBjcmVhdGUsIGxpc3RlbiwgY2xvc2UsIHNlcnZlU3RhdGljQ29udGVudCB9IGZyb20gJy4uL3NyYy1zc3Ivc2VydmVyJ1xuaW1wb3J0IGluamVjdE1pZGRsZXdhcmVzIGZyb20gJy4vc3NyLW1pZGRsZXdhcmVzJ1xuXG5leHBvcnQge1xuICBjcmVhdGUsXG4gIGxpc3RlbixcbiAgY2xvc2UsXG4gIHNlcnZlU3RhdGljQ29udGVudCxcbiAgaW5qZWN0TWlkZGxld2FyZXNcbn1cbiIsICIvKipcbiAqIE1vcmUgaW5mbyBhYm91dCB0aGlzIGZpbGU6XG4gKiBodHRwczovL3YyLnF1YXNhci5kZXYvcXVhc2FyLWNsaS12aXRlL2RldmVsb3Bpbmctc3NyL3Nzci13ZWJzZXJ2ZXJcbiAqXG4gKiBSdW5zIGluIE5vZGUgY29udGV4dC5cbiAqL1xuXG4vKipcbiAqIE1ha2Ugc3VyZSB0byB5YXJuIGFkZCAvIG5wbSBpbnN0YWxsIChpbiB5b3VyIHByb2plY3Qgcm9vdClcbiAqIGFueXRoaW5nIHlvdSBpbXBvcnQgaGVyZSAoZXhjZXB0IGZvciBleHByZXNzIGFuZCBjb21wcmVzc2lvbikuXG4gKi9cbmltcG9ydCBleHByZXNzIGZyb20gJ2V4cHJlc3MnXG5pbXBvcnQgY29tcHJlc3Npb24gZnJvbSAnY29tcHJlc3Npb24nXG5cbi8qKlxuICogQ3JlYXRlIHlvdXIgd2Vic2VydmVyIGFuZCByZXR1cm4gaXRzIGluc3RhbmNlLlxuICogSWYgbmVlZGVkLCBwcmVwYXJlIHlvdXIgd2Vic2VydmVyIHRvIHJlY2VpdmVcbiAqIGNvbm5lY3QtbGlrZSBtaWRkbGV3YXJlcy5cbiAqXG4gKiBTaG91bGQgTk9UIGJlIGFzeW5jIVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlICgvKiB7IC4uLiB9ICovKSB7XG4gIGNvbnN0IGFwcCA9IGV4cHJlc3MoKVxuXG4gIC8vIHBsYWNlIGhlcmUgYW55IG1pZGRsZXdhcmVzIHRoYXRcbiAgLy8gYWJzb2x1dGVseSBuZWVkIHRvIHJ1biBiZWZvcmUgYW55dGhpbmcgZWxzZVxuICBpZiAocHJvY2Vzcy5lbnYuUFJPRCkge1xuICAgIGFwcC51c2UoY29tcHJlc3Npb24oKSlcbiAgfVxuXG4gIHJldHVybiBhcHBcbn1cblxuLyoqXG4gKiBZb3UgbmVlZCB0byBtYWtlIHRoZSBzZXJ2ZXIgbGlzdGVuIHRvIHRoZSBpbmRpY2F0ZWQgcG9ydFxuICogYW5kIHJldHVybiB0aGUgbGlzdGVuaW5nIGluc3RhbmNlIG9yIHdoYXRldmVyIHlvdSBuZWVkIHRvXG4gKiBjbG9zZSB0aGUgc2VydmVyIHdpdGguXG4gKlxuICogVGhlIFwibGlzdGVuUmVzdWx0XCIgcGFyYW0gZm9yIHRoZSBcImNsb3NlKClcIiBkZWZpbml0aW9uIGJlbG93XG4gKiBpcyB3aGF0IHlvdSByZXR1cm4gaGVyZS5cbiAqXG4gKiBGb3IgcHJvZHVjdGlvbiwgeW91IGNhbiBpbnN0ZWFkIGV4cG9ydCB5b3VyXG4gKiBoYW5kbGVyIGZvciBzZXJ2ZXJsZXNzIHVzZSBvciB3aGF0ZXZlciBlbHNlIGZpdHMgeW91ciBuZWVkcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3RlbiAoeyBhcHAsIHBvcnQsIGlzUmVhZHkgfSkge1xuICBhd2FpdCBpc1JlYWR5KClcbiAgcmV0dXJuIGF3YWl0IGFwcC5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgIGlmIChwcm9jZXNzLmVudi5QUk9EKSB7XG4gICAgICBjb25zb2xlLmxvZygnU2VydmVyIGxpc3RlbmluZyBhdCBwb3J0ICcgKyBwb3J0KVxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4gKiBTaG91bGQgY2xvc2UgdGhlIHNlcnZlciBhbmQgZnJlZSB1cCBhbnkgcmVzb3VyY2VzLlxuICogV2lsbCBiZSB1c2VkIG9uIGRldmVsb3BtZW50IG9ubHkgd2hlbiB0aGUgc2VydmVyIG5lZWRzXG4gKiB0byBiZSByZWJvb3RlZC5cbiAqXG4gKiBTaG91bGQgeW91IG5lZWQgdGhlIHJlc3VsdCBvZiB0aGUgXCJsaXN0ZW4oKVwiIGNhbGwgYWJvdmUsXG4gKiB5b3UgY2FuIHVzZSB0aGUgXCJsaXN0ZW5SZXN1bHRcIiBwYXJhbS5cbiAqXG4gKiBDYW4gYmUgYXN5bmMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9zZSAoeyBsaXN0ZW5SZXN1bHQgfSkge1xuICByZXR1cm4gbGlzdGVuUmVzdWx0LmNsb3NlKClcbn1cblxuY29uc3QgbWF4QWdlID0gcHJvY2Vzcy5lbnYuREVWXG4gID8gMFxuICA6IDEwMDAgKiA2MCAqIDYwICogMjQgKiAzMFxuXG4vKipcbiAqIFNob3VsZCByZXR1cm4gbWlkZGxld2FyZSB0aGF0IHNlcnZlcyB0aGUgaW5kaWNhdGVkIHBhdGhcbiAqIHdpdGggc3RhdGljIGNvbnRlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXJ2ZVN0YXRpY0NvbnRlbnQgKHBhdGgsIG9wdHMpIHtcbiAgcmV0dXJuIGV4cHJlc3Muc3RhdGljKHBhdGgsIHtcbiAgICBtYXhBZ2UsXG4gICAgLi4ub3B0c1xuICB9KVxufVxuXG5jb25zdCBqc1JFID0gL1xcLmpzJC9cbmNvbnN0IGNzc1JFID0gL1xcLmNzcyQvXG5jb25zdCB3b2ZmUkUgPSAvXFwud29mZiQvXG5jb25zdCB3b2ZmMlJFID0gL1xcLndvZmYyJC9cbmNvbnN0IGdpZlJFID0gL1xcLmdpZiQvXG5jb25zdCBqcGdSRSA9IC9cXC5qcGU/ZyQvXG5jb25zdCBwbmdSRSA9IC9cXC5wbmckL1xuXG4vKipcbiAqIFNob3VsZCByZXR1cm4gYSBTdHJpbmcgd2l0aCBIVE1MIG91dHB1dFxuICogKGlmIGFueSkgZm9yIHByZWxvYWRpbmcgaW5kaWNhdGVkIGZpbGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclByZWxvYWRUYWcgKGZpbGUpIHtcbiAgaWYgKGpzUkUudGVzdChmaWxlKSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBgPGxpbmsgcmVsPVwibW9kdWxlcHJlbG9hZFwiIGhyZWY9XCIke2ZpbGV9XCIgY3Jvc3NvcmlnaW4+YFxuICB9XG5cbiAgaWYgKGNzc1JFLnRlc3QoZmlsZSkgPT09IHRydWUpIHtcbiAgICByZXR1cm4gYDxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiJHtmaWxlfVwiPmBcbiAgfVxuXG4gIGlmICh3b2ZmUkUudGVzdChmaWxlKSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBgPGxpbmsgcmVsPVwicHJlbG9hZFwiIGhyZWY9XCIke2ZpbGV9XCIgYXM9XCJmb250XCIgdHlwZT1cImZvbnQvd29mZlwiIGNyb3Nzb3JpZ2luPmBcbiAgfVxuXG4gIGlmICh3b2ZmMlJFLnRlc3QoZmlsZSkgPT09IHRydWUpIHtcbiAgICByZXR1cm4gYDxsaW5rIHJlbD1cInByZWxvYWRcIiBocmVmPVwiJHtmaWxlfVwiIGFzPVwiZm9udFwiIHR5cGU9XCJmb250L3dvZmYyXCIgY3Jvc3NvcmlnaW4+YFxuICB9XG5cbiAgaWYgKGdpZlJFLnRlc3QoZmlsZSkgPT09IHRydWUpIHtcbiAgICByZXR1cm4gYDxsaW5rIHJlbD1cInByZWxvYWRcIiBocmVmPVwiJHtmaWxlfVwiIGFzPVwiaW1hZ2VcIiB0eXBlPVwiaW1hZ2UvZ2lmXCI+YFxuICB9XG5cbiAgaWYgKGpwZ1JFLnRlc3QoZmlsZSkgPT09IHRydWUpIHtcbiAgICByZXR1cm4gYDxsaW5rIHJlbD1cInByZWxvYWRcIiBocmVmPVwiJHtmaWxlfVwiIGFzPVwiaW1hZ2VcIiB0eXBlPVwiaW1hZ2UvanBlZ1wiPmBcbiAgfVxuXG4gIGlmIChwbmdSRS50ZXN0KGZpbGUpID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGA8bGluayByZWw9XCJwcmVsb2FkXCIgaHJlZj1cIiR7ZmlsZX1cIiBhcz1cImltYWdlXCIgdHlwZT1cImltYWdlL3BuZ1wiPmBcbiAgfVxuXG4gIHJldHVybiAnJ1xufVxuIiwgIi8qIGVzbGludC1kaXNhYmxlICovXG4vKipcbiAqIFRISVMgRklMRSBJUyBHRU5FUkFURUQgQVVUT01BVElDQUxMWS5cbiAqIERPIE5PVCBFRElULlxuICoqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbmplY3RNaWRkbGV3YXJlcyAob3B0cykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgIFxuICAgIGltcG9ydCgnc3JjLXNzci9taWRkbGV3YXJlcy9yZW5kZXInKVxuICAgIFxuICBdKS50aGVuKGFzeW5jIHJhd01pZGRsZXdhcmVzID0+IHtcbiAgICBjb25zdCBtaWRkbGV3YXJlcyA9IHJhd01pZGRsZXdhcmVzXG4gICAgICAubWFwKGVudHJ5ID0+IGVudHJ5LmRlZmF1bHQpXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1pZGRsZXdhcmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBtaWRkbGV3YXJlc1tpXShvcHRzKVxuICAgICAgfVxuICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdbUXVhc2FyIFNTUl0gbWlkZGxld2FyZSBlcnJvcjonLCBlcnIpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBTU87QUFOUDtBQUFBO0FBQUEsc0JBQThCO0FBTTlCLElBQU8saUJBQVEsbUNBQWMsQ0FBQyxFQUFFLEtBQUssU0FBUyxRQUFRLFlBQVk7QUFHaEUsVUFBSSxJQUFJLFFBQVEsUUFBUSxHQUFHLEdBQUcsQ0FBQyxLQUFLLFFBQVE7QUFDMUMsWUFBSSxVQUFVLGdCQUFnQixXQUFXO0FBRXpDLGVBQTZCLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFDdEMsS0FBSyxVQUFRO0FBRVosY0FBSSxLQUFLLElBQUk7QUFBQSxRQUNmLENBQUMsRUFDQSxNQUFNLFNBQU87QUFJWixjQUFJLElBQUksS0FBSztBQUNYLGdCQUFJLElBQUksTUFBTTtBQUNaLGtCQUFJLFNBQVMsSUFBSSxNQUFNLElBQUksR0FBRztBQUFBLFlBQ2hDLE9BQU87QUFDTCxrQkFBSSxTQUFTLElBQUksR0FBRztBQUFBLFlBQ3RCO0FBQUEsVUFDRixXQUFXLElBQUksU0FBUyxLQUFLO0FBSzNCLGdCQUFJLE9BQU8sR0FBRyxFQUFFLEtBQUssc0JBQXNCO0FBQUEsVUFDN0MsV0FBVyxNQUFpQjtBQU8xQixrQkFBTSxNQUFNLEVBQUUsS0FBSyxLQUFLLElBQUksQ0FBQztBQUFBLFVBQy9CLE9BQU87QUFRTCxnQkFBSSxPQUFPLEdBQUcsRUFBRSxLQUFLLDZCQUE2QjtBQUFBLFVBRXBEO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQUEsSUFDSCxDQUFDO0FBQUE7QUFBQTs7O0FDdEREO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDV0EscUJBQW9CO0FBQ3BCLHlCQUF3QjtBQVNqQixrQkFBZ0M7QUFDckMsUUFBTSxNQUFNLDRCQUFRO0FBSXBCLE1BQUksT0FBa0I7QUFDcEIsUUFBSSxJQUFJLGdDQUFZLENBQUM7QUFBQSxFQUN2QjtBQUVBLFNBQU87QUFDVDtBQWFBLHNCQUE4QixFQUFFLEtBQUssTUFBTSxXQUFXO0FBQ3BELFFBQU0sUUFBUTtBQUNkLFNBQU8sTUFBTSxJQUFJLE9BQU8sTUFBTSxNQUFNO0FBQ2xDLFFBQUksT0FBa0I7QUFDcEIsY0FBUSxJQUFJLDhCQUE4QixJQUFJO0FBQUEsSUFDaEQ7QUFBQSxFQUNGLENBQUM7QUFDSDtBQVlPLGVBQWdCLEVBQUUsZ0JBQWdCO0FBQ3ZDLFNBQU8sYUFBYSxNQUFNO0FBQzVCO0FBRUEsSUFBTSxTQUFTLE9BQ1gsSUFDQSxNQUFPLEtBQUssS0FBSyxLQUFLO0FBTW5CLDRCQUE2QixNQUFNLE1BQU07QUFDOUMsU0FBTyx1QkFBUSxPQUFPLE1BQU07QUFBQSxJQUMxQjtBQUFBLEtBQ0csS0FDSjtBQUNIOzs7QUMxRWUsMkJBQTRCLE1BQU07QUFDL0MsU0FBTyxRQUFRLElBQUk7QUFBQSxJQUVqQjtBQUFBLEVBRUYsQ0FBQyxFQUFFLEtBQUssT0FBTSxtQkFBa0I7QUFDOUIsVUFBTSxjQUFjLGVBQ2pCLElBQUksV0FBUyxNQUFNLE9BQU87QUFFN0IsYUFBUyxJQUFJLEdBQUcsSUFBSSxZQUFZLFFBQVEsS0FBSztBQUMzQyxVQUFJO0FBQ0YsY0FBTSxZQUFZLEdBQUcsSUFBSTtBQUFBLE1BQzNCLFNBQ08sS0FBUDtBQUNFLGdCQUFRLE1BQU0sa0NBQWtDLEdBQUc7QUFDbkQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogW10KfQo=
