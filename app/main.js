// Router and wiring for Atlas: hash routes, control events, nothing else.
// Routes: #/ (rankings), #/country/<CODE>, #/compare?<CODE>,<CODE>, #/about

import { homeView, countryView, compareView, aboutView, byCode } from "./views.js";

const view = document.getElementById("view");
const state = { query: "", region: "All", metric: "pop", asc: false };

function parseRoute() {
  const hash = window.location.hash || "#/";
  const [pathPart, queryPart] = hash.slice(2).split("?");
  const parts = pathPart.split("/").filter(Boolean);
  return { parts, queryPart: queryPart || "" };
}

function setActiveNav(route) {
  const name = route === "compare" ? "compare" : route === "about" ? "about" : "home";
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === name);
  });
}

function render() {
  const { parts, queryPart } = parseRoute();
  const [route, arg] = parts;
  if (route === "country" && arg) {
    setActiveNav("country");
    view.innerHTML = countryView(arg.toUpperCase());
  } else if (route === "compare") {
    setActiveNav("compare");
    const codes = queryPart ? queryPart.split(",").map((c) => c.toUpperCase()) : [];
    view.innerHTML = compareView(codes);
    wireCompare();
  } else if (route === "about") {
    setActiveNav("about");
    view.innerHTML = aboutView();
  } else {
    setActiveNav("home");
    view.innerHTML = homeView(state);
    wireHome();
  }
  window.scrollTo(0, 0);
}

function wireHome() {
  const q = document.getElementById("q");
  const region = document.getElementById("region");
  const metric = document.getElementById("metric");
  const sortDir = document.getElementById("sortDir");
  q.addEventListener("input", () => {
    state.query = q.value;
    rerenderTableOnly();
  });
  region.addEventListener("change", () => {
    state.region = region.value;
    render();
  });
  metric.addEventListener("change", () => {
    state.metric = metric.value;
    render();
  });
  sortDir.addEventListener("click", () => {
    state.asc = !state.asc;
    render();
  });
  document.querySelectorAll("[data-metric]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.metric = chip.dataset.metric;
      render();
    });
  });
}

function rerenderTableOnly() {
  const keepFocus = document.activeElement === document.getElementById("q");
  const pos = document.getElementById("q").selectionStart;
  render();
  if (keepFocus) {
    const next = document.getElementById("q");
    next.focus();
    next.setSelectionRange(pos, pos);
  }
}

function wireCompare() {
  document.querySelectorAll("[data-slot]").forEach((select) => {
    select.addEventListener("change", () => {
      const codes = [0, 1, 2]
        .map((i) => document.getElementById("pick" + i).value)
        .filter((code, i, arr) => arr.indexOf(code) === i);
      window.location.hash = "#/compare?" + codes.join(",");
    });
  });
}

window.addEventListener("hashchange", render);
render();
