////////////////////////////////////////
//  Retrieve player and notes info
////////////////////////////////////////

const $j = jQuery.noConflict();

const player = GetPlayer();

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

// Update module title if different
if (notes_object["title"] != title) {
  notes_object["title"] = title;
  localStorage.setItem(module,JSON.stringify(notes_object));
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

//////////////////////////////////////////////
//  Get and load note for current slide
//////////////////////////////////////////////

// Get current slide and section
let my_slide = find_slide_in_menu();
let my_section = find_section_in_menu(my_slide);

// Get slide and section id
section_id = my_section.attr('data-reactid');
slide_id = my_slide.attr('data-reactid');

// Set slide note if it exists
let note = "";
if (typeof notes_object["contents"][section_id] != 'undefined') {
  if (typeof notes_object["contents"][section_id]["slides"] != 'undefined') {
    if (typeof notes_object["contents"][section_id]["slides"][slide_id] != 'undefined') {
      if (typeof notes_object["contents"][section_id]["slides"][slide_id]["note"] != 'undefined') {
        note = notes_object["contents"][section_id]["slides"][slide_id]["note"];
      }
    }
  }
}

player.SetVar('Notes',note);