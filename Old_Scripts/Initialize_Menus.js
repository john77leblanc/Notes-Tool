////////////////////////////////////////
//  Initialize Menus
//  ------------------------------------
//  Retrieve player and notes info
////////////////////////////////////////

const $j = jQuery.noConflict();

const player = GetPlayer();

const title = player.GetVar("Module_Title");
const mod_num = player.GetVar("Module");
const module = player.GetVar("Course_Code") + "_" + player.GetVar("Module") + "_notes";
let notes_object = JSON.parse(localStorage.getItem(module));
if (notes_object == 'undefined' || notes_object === null) {
  notes_object = {
    "title" : title,
    "module" : mod_num,
    "contents" : {}
  };
}

// Check if initialized
let init = sessionStorage.getItem("initialized") == null ? false : true;
sessionStorage.setItem("initialized",true);

///////////////
//  Functions
///////////////

// Get current slide
function find_slide_in_menu(slide_id) {
  let slides = convertToArray(document.querySelectorAll('.cs-listitem[data-reactid="'+slide_id+'"'))
    .map(e => {
      convertToArray(e.querySelectorAll('span'))
        .filter(e => {!e.hasAttribute('class')});
    });
  return slides[0];
}

// Convert HTMLCollection or NodeObject into an array
function convertToArray(obj) {
  let a = [];
  for (let i = 0; i < obj.length; i++) {
    a.push(obj[i]);
  }
  return a;
}

/////////////////////////////////////
//  Order section ID's
/////////////////////////////////////

if (!init) {
  let section_ids = [];

  for (let section_id in notes_object["contents"]) {
    section_ids.push(section_id);
  }

  section_ids.sort();
}

////////////////////////////////////////////
//  Get sections, slide titles and notes
////////////////////////////////////////////

if (!init) {
  for (let section_id = 0; section_id < section_ids.length; section_id++) {
    let section = notes_object["contents"][section_ids[section_id]];

    // Sort slide ID's
    let slide_ids = [];

    for (let slide_id in section['slides']) {
      slide_ids.push(slide_id);
    }

    slide_ids.sort();

    // Loop through slides
    for (let slide_id = 0; slide_id < slide_ids.length; slide_id++) {
      let slide = section["slides"][slide_ids[slide_id]];
      if (slide["note"].length) {
        let my_slide = find_slide_in_menu(slide_ids[slide_id]);
        if (!my_slide.parent().find(".note").length) {
          my_slide.after("<span class='note'> [Note]</span>");
        } // if
      } // if
    } // for
  } // for
} // init