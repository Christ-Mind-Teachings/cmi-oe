/**
 * format table of contents items.
 */

function rendersubcontents(contents, c) {
  return `
    <div class="list">
      ${contents.map(q => `<a data-lid="${++c.counter}" class="item${gettimerclass(q)}" href="${q.url}">${q.title}</a>`).join("")}
    </div>
  `;
}

/**
 * Generate TOC html for given unit (a chapter) of the manual for Teachers
 *
 * @param {object} unit - from book config file for one chapter
 * @param {object} cntr - counter
 */
function makeManualContents(unit, cntr) {
  let html = `
      <div class="item">
        <a data-lid="${++cntr.counter}" class="" href="${unit.url}">${cntr.counter > 1?(cntr.counter-1)+". " :""}${unit.title}</a>
      </div>
    `;

    return html;
}

/*
 * Render section end for workbook.
 */
function renderSectionEnd() {
  return (`
        </div>
      </div>
    </div>
  `);
}

function renderWorkbookSectionHeader(unit, cntr) {
  let html = `
    <div class="item">
      <div class="content">
        <div class="header">${unit.sectionTitle}</div>
        <div class="list">
          <a data-lid="${++cntr.counter}" class="item" href="${unit.url}">${unit.lesson?unit.lesson+". ":""}${unit.title}</a>
  `;

  return html;
}

function renderWorkbookItem(unit, cntr) {
  let html = `
    <a data-lid="${++cntr.counter}" class="item" href="${unit.url}">${unit.lesson?unit.lesson+". ":""}${unit.title}</a>
  `;

  return html;
}

function makeWorkbookContents(unit, cntr) {
  let html = `
    ${unit.sectionTitle ? renderWorkbookSectionHeader(unit, cntr) : renderWorkbookItem(unit, cntr) }
    ${unit.sectionEnd ? renderSectionEnd() : "" }
  `;

  return html;
}

function renderTextSection(url, section, cntr) {

  let html = `
    <a data-lid="${++cntr.counter}" class="item" href="${url}/${section.url}/">${section.subtitle}</a>
  `;

  return html;
}

function makeTextContents(unit, cntr) {
  let html = `
    <div class="item">
      <div class="content">
        <div class="header">${unit.id.length > 0 ? unit.id+": " : ""} ${unit.title}</div>
        <div class="list">
          ${unit.contents.map(section => `
            ${renderTextSection(unit.url, section, cntr)}
          `).join("")}
        </div>
      </div>
    </div>
  `;

  return html;
}

/**
 * This is a TOC extension. It's passed a book id, counter, and unit (chapter or lesson) from the associated
 * config file. It's called repeatedly for each unit in the configuration.
 *
 * The counter is used to keep track of each link in the TOC with a sequential value for data-lid attribute.
 */
export function format(book, unit, cntr) {

  let html = `<p>${book} is not formatted for TOC</p>`;

  switch(book) {
    case "manual":
    case "ack":
      html = makeManualContents(unit, cntr);
      break;
    case "workbook":
      html = makeWorkbookContents(unit, cntr);
      break;
    case "text":
      html = makeTextContents(unit, cntr);
      break;
  }

  return html;
}

