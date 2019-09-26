////////////////////////////////////////
//  Retrieve player and notes info
////////////////////////////////////////

const $j = jQuery.noConflict();

const player = GetPlayer();

const note_text = player.GetVar("Notes");
const title = player.GetVar("Module_Title");
const mod_num = player.GetVar("Module");
const module = player.GetVar("Course_Code") + "_" + player.GetVar("Module") + "_notes";
const notes_object = JSON.parse(localStorage.getItem(module));
if (notes_object == 'undefined' || notes_object === null) {
  notes_object = {
    "title" : title,
    "module" : mod_num,
    "contents" : {}
  };
}

///////////////
//  Functions
///////////////

// Get current slide
function find_slide_in_menu() {
  let slide = $j('.slide').eq(document.getElementsByClassName('slide').length - 1);
  let slide_react_id = slide.attr('data-reactid');
  // Determine Storyline 2 or 3
  if (slide_react_id.includes("$_player=")) {
    // Storyline 2
    let pattern = /player.*\./g;
    let result = slide_react_id.match(pattern);
    result = result[0].replace(/\./g,"");
    result = result.replace(/\=./g,".");
  } else {
    // Storyline 3
    let pattern = /\:\$.*\./g;
    let result = slide_react_id.match(pattern);
    result = result[0].replace(/(\:|\$|\.)/g,"");
  }
  slide = $j('.cs-listitem[href$="'+result+'"]');
  return slide;
}

// Get current section
function find_section_in_menu(slide) {
  let section = $j('.is-scene').has(slide);
  return section;
}

// Get parent title
function get_parent_title(slide) {
  return slide.parent().siblings('a').eq(0).find("> span:not([class])").text();
}

//////////////////////////////
//  Initialize Note Objects
//////////////////////////////

let section_id;
let section_value = {
  "title" : "",
  "slides" : {}
};

let slide_id;
let slide_value = {
  "parent_titles" : [],
  "title" : "",
  "number" : "",
  "note" : ""
};

///////////////////////////
//  Generate Note Info
///////////////////////////

// Regex for finding slide and section numbering
let slide_pattern = /\,.*(\,|\d)/g; 
let section_pattern = /\,.*\d/g;

// Get current slide and section
let my_slide = find_slide_in_menu();
let my_section = find_section_in_menu(my_slide);

// Create section information
section_id = my_section.attr('data-reactid');
section_value["title"] = my_section.find('a>span:last-child').eq(0).text();

// Create slide information
slide_id = my_slide.attr('data-reactid');
slide_value["title"] = my_slide.find("> span:not([class])").eq(0).text();
slide_value["number"] = my_slide.parent().find('span.accessibility').eq(0).text().match(slide_pattern).toString().replace(/\,/g,"").trim();
slide_value["note"] = player.GetVar('Notes');

// Create parent title information if subsection
let running = true;
let parent_slide = my_slide;
while (running) {
  if (parent_slide.parent().parent().parent().attr('role') == 'tree') {
    break;
  } else if (parent_slide.parent().attr('role') == 'group') {
    let parent_title = get_parent_title(parent_slide);
    slide_value["parent_titles"].push(parent_title);
  }
  parent_slide = parent_slide.parent();
}

/////////////////
//  Save Note
/////////////////

my_slide = my_slide.find("> span:not([class])");

// Create section if it doesn't already exist
if (!notes_object["contents"][section_id]) {
  notes_object["contents"][section_id] = section_value;
}

// Create / update / delete slide note
if (slide_value["note"].length) {
  // Create / update
  notes_object["contents"][section_id]["slides"][slide_id] = slide_value;
  // Add note bookmark in menu
  if (!my_slide.parent().find(".note").length) {
    my_slide.after("<span class='note'> [Note]</span>");
  }
} else if (slide_value["note"].length == 0 && notes_object["contents"][section_id]["slides"][slide_id]) {
  // Delete if empty
  delete notes_object["contents"][section_id]["slides"][slide_id];
  // Remove note bookmark in menu
  my_slide.parent().find(".note").remove();
}

// Delete section if empty
if (!Object.keys(notes_object["contents"][section_id]["slides"]).length) {
  delete notes_object["contents"][section_id];
}

localStorage.setItem(module,JSON.stringify(notes_object));